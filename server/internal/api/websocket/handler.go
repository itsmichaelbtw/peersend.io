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

// ServeWebSocket is the net/http handler func for the /exchange endpoint.
// It delegates directly to Server.ServeWebSocket, which validates the upgrade
// request and starts the connection goroutine.
func (h *Handler) ServeWebSocket(w http.ResponseWriter, r *http.Request) {
	h.Server.ServeWebSocket(w, r)
}
