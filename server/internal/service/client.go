package service

import (
	"peersend/internal/domain"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// ClientService handles client-level operations such as creating new client
// instances and closing their connections. It carries no state of its own;
// session membership is managed by SessionService.
type ClientService struct{}

func NewClientService() *ClientService {
	return &ClientService{}
}

func (c *ClientService) NewClient(conn *websocket.Conn) *domain.Client {
	return &domain.Client{
		ID:   uuid.NewString(),
		Conn: conn,
	}
}

// CloseConnection closes the WebSocket connection of client. It returns nil
// if client or its connection is already nil, making it safe to call during
// cleanup regardless of connection state.
func (c *ClientService) CloseConnection(client *domain.Client) error {
	if client == nil || client.Conn == nil {
		return nil
	}

	return client.Conn.Close()
}
