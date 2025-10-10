package websocket_api

import (
	"net/http"
	"peersend/internal/server"
)

type Handler struct {
	Server *server.Server
}

func NewHandler(server *server.Server) *Handler {
	return &Handler{
		Server: server,
	}
}

func (h *Handler) ServeWebSocket(w http.ResponseWriter, r *http.Request) {
	h.Server.ServeWebSocket(w, r)
}
