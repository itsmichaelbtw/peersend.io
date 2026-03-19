#!/usr/bin/env sh
set -e

mkdir -p "$SERVER_DIRECTORY"

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

docker pull "${SERVER_IMAGE}:${SERVER_TAG}"

docker stop "$SERVER_CONTAINER_NAME" 2>/dev/null || true
docker rm   "$SERVER_CONTAINER_NAME" 2>/dev/null || true

docker run -d \
  --name "$SERVER_CONTAINER_NAME" \
  --restart unless-stopped \
  --network "$DOCKER_NETWORK" \
  --env-file "${SERVER_DIRECTORY}/deploy/server.env" \
  "${SERVER_IMAGE}:${SERVER_TAG}"

docker cp "${SERVER_DIRECTORY}/deploy/nginx.conf" \
  "${NGINX_CONTAINER_NAME}:/etc/nginx/conf.d/peersend.io.conf"
docker exec "$NGINX_CONTAINER_NAME" nginx -s reload
