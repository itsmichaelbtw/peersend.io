FROM golang:1.24-alpine AS base

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

FROM base AS development

WORKDIR /usr/src/app

COPY . .

CMD ["go", "run", "./cmd/peersend/main.go"]

FROM base AS build

WORKDIR /usr/src/app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/peersend/main.go

FROM alpine:latest AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/server /usr/src/app/

RUN adduser -D -H -h /usr/src/app appuser && \
    chown -R appuser:appuser /usr/src/app

USER appuser

CMD ["./server"]
