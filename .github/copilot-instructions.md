# PeerSend.io AI Agent Instructions

Group code by **feature** when it improves clarity.

## Project Overview

---

**PeerSend** is a peer-to-peer file sharing application with:

- **Go WebSocket server** (`server/`) for session management and signaling## Development Best Practices

- **React/TypeScript web app** (`web/`) with WebSocket/WebRTC communication

- **Architecture**: Event-driven, domain-isolated, repository pattern with in-memory state- Each function should have **one clear responsibility**.

- Handle all errors explicitly using wrapped errors:  

### Key Components  `fmt.Errorf("context: %w", err)`

- Avoid global state. Use **constructor functions** to inject dependencies.

- **Sessions**: Two-client peer-to-peer rooms with unique codes (e.g., `X-4FGS6H`)- Always propagate **context.Context** in public functions.

- **Signaling**: WebSocket server brokers WebRTC negotiation; actual file transfer via WebRTC- Manage **goroutines** safely; cancel via context to avoid leaks.

- **Message Flow**: Client → WebSocket → Dispatcher → Event Handlers → Broadcaster → Clients- Use **defer** to close resources properly.

- Use **standard library first**; minimize third-party dependencies.

## Go Server Architecture (`server/`)

---

### Dependency Injection Chain

```## Security & Resilience

main.go → app.Initialise() → Constructs:

  Repository → Broadcaster → EventPublisher → Services → Server → Handlers- Validate and sanitize all external inputs.

```- Use secure defaults for JWT, cookies, and configs.

- Isolate sensitive operations behind interfaces.

**No global state** except singleton config via `config.Load()` then `config.Get()`.- Apply retries, exponential backoff, and timeouts to all external calls.

- Implement circuit breakers and rate limiting (prefer Redis for distributed rate limiting).

### Core Patterns

---

1. **Domain Interfaces** (`internal/domain/`)  

   - Define contracts: `SessionRepository`, `EventPublisher`## Testing Guidelines

   - Implementations in `repository/`, `events/publisher.go`

- Write **table-driven unit tests**.

2. **Event Dispatching** (`internal/events/`)- Use **mocks for external interfaces**.

   - `Dispatcher` routes typed messages to handlers- Run tests in parallel where safe.

   - Handlers in `events/handlers/` (e.g., `ping_event.go`, `transfer_host_event.go`)- Maintain test coverage for all exported functions.

   - Unhandled events pass through to peer client (relay mode)- Separate **unit**, **integration**, and **E2E** tests.

- Prefer Go’s built-in testing tools: `testing`, `testify`, `mockgen`.

3. **Connection Lifecycle** (`internal/server/connection.go`)

   - Each WebSocket spawns a goroutine via `connection.Listen(ctx)`---

   - `defer c.destroyConnection(ctx)` ensures cleanup

   - Reads messages → dispatch or relay to other client## Observability (OpenTelemetry)



4. **Session Management** (`internal/service/session.go`)- Use **OpenTelemetry** for tracing, metrics, and logs.

   - Max 2 clients per session (configured in `configs/peersend.yml`)- Propagate spans and context through all layers (HTTP/gRPC/DB).

   - Auto host transfer when host disconnects- Record attributes: request params, user IDs, errors.

   - Cleanup when last client leaves (closes broadcast channel)- Inject trace IDs into logs for correlation.

- Export data to **OpenTelemetry Collector**, **Jaeger**, or **Prometheus**.

5. **Broadcasting** (`internal/broadcast/broadcaster.go`)

   - Dedicated goroutine per session via `broadcaster.Start(ctx, session)`---

   - Listens on `session.Broadcast` channel

   - Sends `sync_clients` and `host_transferred` events## Tracing & Monitoring



### Critical Go Conventions- Trace all inbound requests and internal operations.

- Instrument middleware for automatic tracing.

- **Error handling**: Always wrap errors: `fmt.Errorf("context: %w", err)`- Define and monitor key metrics:

- **Context propagation**: All public service methods accept `context.Context`  - Request latency

- **Goroutine safety**: Guard `session.Clients` map with `sync.RWMutex`  - Throughput

- **Resource cleanup**: Use `defer` for `conn.Close()`, channel close, session cleanup  - Error rate

- **Config**: Singleton loaded once in `main.go`, accessed via `config.Get()`  - Resource usage

- Avoid high-cardinality labels.

### Example: Adding a New Event Handler- Use JSON-structured logs with `request_id` and trace context.



1. Define message constant in `internal/domain/messages.go`:---

   ```go

   MessageInNewFeature string = "new_feature"## Performance

   ```

2. Create handler in `internal/events/handlers/`:- Use **benchmarks** to track performance regressions.

   ```go- Profile before optimizing.

   type NewFeatureEventHandler struct{}- Minimize allocations.

   - Instrument heavy computations and external calls.

   func (h *NewFeatureEventHandler) Handle(ctx *events.EventContext, client *domain.Client, data any) error {

       // Use ctx.SessionService, ctx.Broadcaster, etc.---

       return nil

   }## Concurrency

   ```

3. Register in `internal/server/server.go`:- Guard shared state with **sync primitives** or **channels**.

   ```go- Always propagate **context cancellation** in goroutines.

   dispatcher.RegisterHandler(domain.MessageInNewFeature, &handlers.NewFeatureEventHandler{})- Avoid goroutine leaks or blocking calls without timeouts.

   ```

---

## TypeScript Web App (`web/`)

## Tooling & CI/CD

### State Management (`src/state/`)

- Use **Go modules** with version locking.

- **Custom store pattern** (`store.ts`): Abstract `StateStore<S, M>` with reducer + pub-sub- Enforce formatting with:

- **Three stores**: `appState`, `fileTransferState`, `webrtcState` (index exports)  - `go fmt`

- **Dispatch actions**: `appState.dispatch("UPDATE", { sessionState: {...} })`  - `goimports`

- **Subscribe**: React hooks via `use-app-state.ts`, `use-file-transfer-state.ts`  - `golangci-lint`

- Integrate linting, testing, and security checks in CI.

### Network Layer (`src/lib/networking/`)

---

1. **Base Client** (`network-client.ts`)  

   - Abstract class with `MessageBus` for event routing## Documentation & Standards

   - Extended by `WebSocketClient` and `WebRTCClient`

- Document public types and functions with **GoDoc** comments.

2. **WebSocket** (`websocket/client.ts`)- Write concise **README**, **CONTRIBUTING.md**, and **ARCHITECTURE.md**.

   - Connects with `mode=host|join` and optional `session_code`- Use consistent naming and conventions across services.

   - Events registered in `events.ts`: `session_information`, `sync_clients`, etc.

   - Custom `CustomWebSocket` wrapper in `websocket.ts`---



3. **WebRTC** (`webrtc/`)## Key Conventions

   - Peer connection managed via `PeerConnection` class

   - Data channels for file transfer1. Prioritize **readability, simplicity, and maintainability**.

   - Uses WebSocket for SDP/ICE signaling2. Design for **change and isolation** — avoid framework lock-in.

3. Emphasize **dependency inversion** and clear boundaries.

### File Transfer (`src/lib/file-transfer/`)4. Ensure all code is **observable, testable, and documented**.

5. **Automate builds, tests, and deployments**.

- **Transports**: `websocket-transport.ts`, `webrtc-transport.ts`

- **Chunking**: Files split into chunks, progress throttled---

- **Download**: Browser blob creation via `download.ts`

### Examples of Copilot Behavior

### Key TypeScript Patterns

✅ **Good suggestions**:

- **Logger**: `createLogger(name)` for scoped console logs- Suggest repository interfaces rather than concrete DB calls.

- **Types**: Use `WithNullable<T>` for `T | null`, network message generics in `types.ts`- Inject dependencies in constructors.

- **Constants**: `config/constants.ts` has default states, endpoints- Use context-aware functions and timeouts.

- **Routing**: React Router v7 in `router/index.tsx`- Write tests using table-driven style.



## Development Workflows🚫 **Avoid**:

- Global variables or stateful singletons.

### Local Development- Framework-tied business logic.

```bash- Unhandled errors or ignored `context.Context`.

# Start both services- Direct dependencies on external packages without abstraction.

docker-compose up

---

# Go server: localhost:3600

# Web app: localhost:3500**End of Instructions**

```

### Server-Only Development
```bash
cd server
go run cmd/peersend/main.go
# Uses configs/peersend.yml
```

### Web-Only Development  
```bash
cd web
npm run dev
# Set VITE_SERVER_ENDPOINT for custom server
```

### Testing
- **Go**: No tests currently exist (TODO: add table-driven tests)
- **Web**: `npm run lint` (ESLint config in `eslint.config.js`)

## Configuration

**Server** (`server/configs/peersend.yml`):
- `session_code_length`, `session_code_chars`, `session_code_prefix`
- `max_clients: 2` (p2p constraint)
- `auto_webrtc_enabled`, `encryption_mode`

**Web** (env vars in `docker-compose.yml`):
- `VITE_SERVER_ENDPOINT`: WebSocket URL
- `VITE_SESSION_CODE_EXAMPLE`: UI placeholder

## Code Organization Principles

### Go Server
- Group by **domain layer**: `domain/`, `repository/`, `service/`, `events/`, `api/`
- **One responsibility per file**: `session_memory.go`, `broadcaster.go`
- **Interfaces in domain**: Implementations outside (e.g., `SessionRepository` → `InMemorySessionRepo`)

### TypeScript Web
- **Feature-based** in `components/`: `session/`, `collaboration/`, `connection-status/`
- **Layered lib**: `networking/`, `file-transfer/` with clear transport abstraction
- **State separate**: `state/app-state/`, `state/file-transfer-state/`

## Common Patterns

### Adding a Server Endpoint
1. Create handler in `internal/api/http/` or `internal/api/websocket/`
2. Register route in `internal/app/app.go`: `mux.HandleFunc("/path", handler.Method)`

### Adding a WebSocket Message Type
1. **Server**: Add constant in `domain/messages.go` + struct if needed
2. **Client**: Add type in `web/src/lib/networking/websocket/types.ts`
3. **Handler**: Create in `events/handlers/` and register in `server.go`
4. **Web listener**: Add event in `websocket/events.ts`

### Extending State
1. Update `state/types.ts` with new state slice
2. Add action type to relevant `ActionMap` in state file
3. Implement in `reducer()` method
4. Update defaults in `config/constants.ts`

## Constraints & Known Issues

- **Max 2 clients per session** by design (see `max_clients` config)
- **In-memory only**: Sessions lost on restart (future: Redis/persistent storage)
- **No authentication**: Public WebSocket endpoint (future: auth layer)
- **Pass-through relay**: Server relays unknown events between clients for WebRTC signaling

## General Go Best Practices

- Each function should have **one clear responsibility**
- Handle all errors explicitly using wrapped errors: `fmt.Errorf("context: %w", err)`
- Avoid global state; use **constructor functions** to inject dependencies
- Always propagate **context.Context** in public functions
- Manage **goroutines** safely; cancel via context to avoid leaks
- Use **defer** to close resources properly
- Use **standard library first**; minimize third-party dependencies
- Document public types and functions with **GoDoc** comments

## AI Agent Best Practices

✅ **Do**:
- Use repository interfaces (`SessionRepository`) not concrete types in services
- Propagate `context.Context` in new Go functions
- Follow `StateStore` pattern for new TypeScript state
- Add type constants to `domain/messages.go` and TypeScript `types.ts`
- Use `defer` for Go resource cleanup
- Inject dependencies via constructors (see `app.Initialise()`)

🚫 **Avoid**:
- Direct `sessions` map access (use `SessionService` methods)
- Blocking WebSocket reads without context cancellation
- Mutating state outside `dispatch()` in TypeScript
- Adding global state in Go (except singleton config)
- Framework-tied business logic (keep domain pure)

---

*Last updated: October 2025*
