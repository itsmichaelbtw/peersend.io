FROM golang:1.24-alpine AS base

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

FROM base AS development

ENV CGO_ENABLED=1

RUN apk add --no-cache gcc musl-dev

WORKDIR /usr/src/app

COPY . .

ENV PATH="/usr/bin:${PATH}"

CMD ["go", "run", "-race", "./cmd/peersend/main.go"]

FROM base AS build

WORKDIR /usr/src/app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/peersend/main.go

FROM alpine:latest AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/server /usr/src/app/
COPY --from=build /usr/src/app/configs /usr/src/app/configs/

RUN adduser -D -H -h /usr/src/app appuser && \
    chown -R appuser:appuser /usr/src/app

USER appuser

ENV SERVER_CONFIG_PATH=/usr/src/app/configs/peersend.yml

EXPOSE 8080

CMD ["./server"]
