#!/usr/bin/env sh
set -e

mkdir -p "$SERVER_DIRECTORY"

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

OLD_IMAGE_ID=$(docker inspect --format='{{.Image}}' "$SERVER_CONTAINER_NAME" 2>/dev/null || true)

docker pull "${SERVER_IMAGE}:${SERVER_TAG}"

NEW_IMAGE_ID=$(docker inspect --format='{{.Id}}' "${SERVER_IMAGE}:${SERVER_TAG}")

docker stop "$SERVER_CONTAINER_NAME" 2>/dev/null || true
docker rm   "$SERVER_CONTAINER_NAME" 2>/dev/null || true

docker run -d \
  --name "$SERVER_CONTAINER_NAME" \
  --restart unless-stopped \
  --network "$DOCKER_NETWORK" \
  --env-file "${SERVER_DIRECTORY}/deploy/${ENVIRONMENT}/server.env" \
  "${SERVER_IMAGE}:${SERVER_TAG}"

NGINX_CONF_DIR=$(docker inspect "$NGINX_CONTAINER_NAME" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d"}}{{.Source}}{{end}}{{end}}')
if [ -n "$NGINX_CONF_DIR" ]; then
  cp "${SERVER_DIRECTORY}/deploy/nginx.server.conf" "${NGINX_CONF_DIR}/server.peersend.io.conf"
else
  docker cp "${SERVER_DIRECTORY}/deploy/nginx.server.conf" \
    "${NGINX_CONTAINER_NAME}:/etc/nginx/conf.d/server.peersend.io.conf"
fi
docker exec "$NGINX_CONTAINER_NAME" nginx -s reload

if [ -n "$OLD_IMAGE_ID" ] && [ "$OLD_IMAGE_ID" != "$NEW_IMAGE_ID" ]; then
  docker rmi "$OLD_IMAGE_ID" 2>/dev/null || true
fi
docker image prune -f
