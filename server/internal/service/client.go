package service

import (
	"peersend/internal/domain"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

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

func (c *ClientService) CloseConnection(client *domain.Client) error {
	if client == nil || client.Conn == nil {
		return nil
	}

	return client.Conn.Close()
}
