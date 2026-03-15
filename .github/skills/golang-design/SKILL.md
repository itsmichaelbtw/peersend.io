---
name: golang-design
description: Go design conventions for the PeerSend.io backend server. Use when writing, reviewing, or modifying any Go code in the server/ directory.
---

You are writing Go code for PeerSend.io. Follow these conventions exactly.

## Code Style

### Naming

| Entity                | Convention                     | Example                                                  |
| --------------------- | ------------------------------ | -------------------------------------------------------- |
| Exported types        | PascalCase                     | `SessionService`, `InMemorySessionRepo`                  |
| Unexported types      | camelCase                      | (rare — most types are exported)                         |
| Constructors          | `NewXxx` returning `*Xxx`      | `NewSessionService(...) *SessionService`                 |
| Private struct fields | Short, abbreviated             | `repo`, `logger`, `mu`, `cfg`                            |
| Public struct fields  | Descriptive                    | `ID`, `SessionID`, `CreatedAt`                           |
| Constants             | PascalCase, grouped by prefix  | `MessageInPing`, `MessageOutPong`                        |
| Sentinel errors       | `Err` prefix                   | `ErrSessionNotFound`, `ErrNoHandlerRegistered`           |
| Interfaces            | Descriptive, role-based suffix | `SessionRepository`, `EventPublisher`, `EventHandler[T]` |

### Struct Layout

Services hold dependencies as private fields and always include a `logger`. Accept interfaces in constructors, return concrete pointer types. Always initialise a scoped logger via `config.WithLogComponent("name")`.

### Interface Compliance

Assert interface implementation at compile time at the top of the file:

```go
var _ events.EventHandler[domain.PingData] = (*PingEventHandler)(nil)
```

### Message Constants

Prefix inbound types with `MessageIn`, outbound with `MessageOut`. Use Go generics (`Message[T]`) for type-safe message handling. Use struct embedding for flat JSON composition.

### Package Principles

- Each package has a focused, single responsibility
- One or two main files per package, plus a dedicated `errors.go` if the package defines sentinel errors
- Domain interfaces live in `internal/domain/` — implementations live in their respective packages
- New event handlers go in `internal/events/handlers/` as separate files
- Prefer internal implementations over using a Go package (unless there is a reason to, such as complexity or time to write)

## Architecture & Patterns

### Dependency Injection

Manual constructor-based DI with no framework. All wiring happens in `internal/app/app.go`. The DI flow is: `repository` -> `broadcaster` -> `eventPublisher` -> `services` -> `server` -> `API handlers`. When adding new dependencies, follow this bottom-up order.

### Event System

The dispatcher routes messages by type string to registered handlers. Unregistered types fall through to peer relay (passthrough). New event handlers implement `EventHandler[T]` and are registered in the server setup.

### WebSocket Connection Lifecycle

Each connection spawns a goroutine with panic recovery. `Connection` runs a blocking read loop with context cancellation and deferred cleanup via `destroyConnection()` which closes the WebSocket, removes the client, and triggers session cleanup if empty.

### Configuration

YAML config loaded once via `sync.Once` singleton. Access via `config.Load(path)` at startup and `config.Get()` everywhere else.

## Error Handling

- Sentinel errors defined per package in dedicated `errors.go` files using `errors.New()`

```go
package repository

import "errors"

var (
    ErrSessionNotFound = errors.New("session not found")
    ErrSessionFull     = errors.New("session is full")
    ErrNoOtherClient   = errors.New("no other client found")
    ErrClientNotFound  = errors.New("client not found in session")
)
```

- Always wrap errors with `fmt.Errorf("context: %w", err)` including relevant IDs for tracing

```go
// Always include context and relevant IDs
return fmt.Errorf("failed to add client %s to session %s: %w", client.ID, sessionID, err)
```

- Use `errors.Is()` for sentinel error comparison
- **Critical errors** are returned up the call stack; **non-critical errors** (e.g., failed event publish) are logged as warnings and swallowed

```go
// Critical — return it
if err := s.repo.AddClient(sessionID, client); err != nil {
    return fmt.Errorf("failed to add client %s to session %s: %w", client.ID, sessionID, err)
}

// Non-critical — log and continue
if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
    s.logger.Warn().Err(err).Str("session_id", sessionID).Msg("failed to publish sync clients event")
}
```

## Concurrency

- `sync.RWMutex` on repository maps (read-heavy). `sync.Mutex` on `Client.Mu` for WebSocket write safety
- Always use `defer` for unlock
- Per-client broadcast sends use goroutines with proper closure variable capture
- Use `context.WithCancel` for connection lifecycle

## Logging

Use zerolog with component-scoped loggers. Never use `fmt.Println` or `log.Println`.

- **Info** — normal operations (session created, client joined, host transferred)
- **Warn** — non-critical failures that don't stop the operation
- **Error** — critical failures, panics, unrecoverable situations
- **Debug** — detailed flow traces (context cancellation, message routing)
