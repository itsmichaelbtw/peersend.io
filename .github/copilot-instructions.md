# Copilot Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

## Project Overview

PeerSend.io is a peer-to-peer file sharing application. The backend is a Go WebSocket signaling server; the frontend is a React/TypeScript SPA. These are independent codebases coordinated via Docker Compose for local development.

## Commands

```bash
docker compose up          # Start both services (web :3500, server :3600)
docker compose up web      # Start frontend only
docker compose up go_server # Start backend only

cd web
npm install | run dev | run build | run lint | run lint:fix | run type-check | run format

cd server
go run ./cmd/peersend | go build ./cmd/peersend | go test ./
```

When debugging either the web or go_server, always use the `docker compose` commands to ensure the full environment is available (e.g. backend config, CORS, etc). Use `go run` or `npm run dev` for hot reload during development within the containers. Never run the services directly on the host machine to avoid environment discrepancies.

## Architecture

### Backend (`server/`) — Go 1.24

Clean architecture with manual constructor-based dependency injection wired in `internal/app/app.go`. The flow is: `repository` → `broadcaster` → `eventPublisher` → `services` → `server` → `API handlers`.

The server reads config from the path in `SERVER_CONFIG_PATH` env var (default config at `server/configs/peersend.yml`).

- **`cmd/peersend/`** — Entry point. Creates HTTP server with read/write/idle timeouts, wires DI via `app.Initialise()`, handles graceful shutdown on SIGTERM/SIGINT with a 10s timeout
- **`internal/domain/`** — Core entities (`Session`, `Client`) and interfaces (`SessionRepository`, `EventPublisher`). Message types use Go generics: `Message[T]` with JSON serialization. Message constants prefixed `MessageIn`/`MessageOut` for directionality
- **`internal/service/`** — Business logic. `SessionService` manages session lifecycle (create, join, leave). `ClientService` manages client state. Services receive repository and publisher interfaces via constructors
- **`internal/repository/`** — `InMemorySessionRepo` implements `SessionRepository` using a `map[string]*Session` protected by `sync.RWMutex`. Enforces `maxClients` capacity
- **`internal/server/`** — `Server` handles WebSocket upgrades via gorilla/websocket. Each connection spawns a goroutine with panic recovery. `Connection` runs a read loop that dispatches messages or relays unhandled ones to the peer client
- **`internal/events/`** — Generic event dispatcher. Handlers implement `EventHandler[T]` interface and are registered by message type string. Unregistered message types fall through to peer relay (passthrough). `EventContext` provides shared services to handlers
- **`internal/broadcast/`** — `Broadcaster` sends messages to session clients. Per-client sends use goroutines. Client writes are mutex-protected (`Client.Mu`)
- **`internal/api/`** — Thin HTTP/WebSocket handlers. `http/` has health endpoint; `websocket/` delegates to `Server`
- **`internal/config/`** — YAML config loaded via `sync.Once` singleton. `WithLogComponent()` helper creates scoped zerolog loggers

### Frontend (`web/`) — React 19, TypeScript 5.9, Vite 7

- **UI:** Mantine v8 (primary color: teal, font: Geist, forced light scheme) + TailwindCSS v4 + Framer Motion for animations
- **State:** Custom `StateStore<S, M>` abstract class with pub-sub pattern and type-safe dispatch/reducer. Stores are singleton instances (`appState`, `fileTransferState`) consumed in React via `useSyncExternalStore`. Not using Context API for state — the stores are external to React
- **Routing:** React Router v7 with loader-based guards. Loaders validate session state and `throw redirect()` for unauthorized access. Routes: `/session/create`, `/session/:session_code`, `/compatibility`
- **Networking:** `lib/networking/` contains WebSocket and WebRTC client implementations. `lib/file-transfer/` handles file chunking and transfer logic
- **Components:** Organized as `layouts/` (page shells with `<Outlet />`), `views/` (full pages), `containers/` (stateful sections), `elements/` (reusable UI pieces)
- **Path alias:** `@/*` maps to `src/*`
- **Env vars:** Accessed via `envVar` from `config/constants.ts` — never use `import.meta.env` directly

## Code Conventions

For detailed conventions, patterns, and examples, refer to the agent skills:

- **TypeScript/React** (`web/`) — see `.github/skills/typescript-design/SKILL.md`
- **Go** (`server/`) — see `.github/skills/golang-design/SKILL.md`
