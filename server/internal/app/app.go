// Package app wires together all application dependencies and registers HTTP
// routes on the provided ServeMux. It acts as the composition root, connecting
// the repository, broadcast, event, service, and handler layers.
package app

import (
	"net/http"

	"github.com/rs/zerolog/log"

	http_api "peersend/internal/api/http"
	websocket_api "peersend/internal/api/websocket"
	"peersend/internal/broadcast"
	"peersend/internal/config"
	"peersend/internal/events"
	"peersend/internal/repository"
	"peersend/internal/server"
	"peersend/internal/service"
)

// Initialise constructs and connects all application components, then registers
// the WebSocket signaling endpoint at /exchange and the health check endpoint
// at /health on the given mux.
//
// Dependency construction order:
//  1. InMemorySessionRepo — holds all live session state.
//  2. Broadcaster — delivers messages to connected clients via the repo.
//  3. EventPublisher — wraps the broadcaster to emit named domain events.
//  4. SessionService / ClientService — core business logic.
//  5. Server — upgrades HTTP connections to WebSocket and manages sessions.
//  6. HTTP & WebSocket handlers — adapt the net/http layer to the above.
func Initialise(mux *http.ServeMux, cfg *config.Config) {
	repo := repository.NewInMemorySessionRepo(cfg.Server.MaxClients)
	broadcaster := broadcast.NewBroadcaster(repo)
	eventPublisher := events.NewEventPublisher(broadcaster)

	sessionService := service.NewSessionService(repo, eventPublisher)
	clientService := service.NewClientService()

	srv := server.NewServer(sessionService, clientService, broadcaster)

	wsHandler := websocket_api.NewHandler(srv)
	httpHandler := http_api.NewHandler(cfg.Environment)

	mux.HandleFunc("/exchange", wsHandler.ServeWebSocket)
	mux.HandleFunc("/health", httpHandler.Health)

	log.Info().Msg("app has been initialised")
}
