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
