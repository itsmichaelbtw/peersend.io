package server

import (
	"context"
	"errors"
	"log"

	"peersend/internal/broadcast"
	"peersend/internal/domain"
	"peersend/internal/events"
	"peersend/internal/service"
)

type Connection struct {
	client         *domain.Client
	session        *domain.Session
	sessionService *service.SessionService
	dispatcher     *events.Dispatcher
	broadcaster    *broadcast.Broadcaster
}

func NewConnection(
	client *domain.Client,
	session *domain.Session,
	sessionService *service.SessionService,
	dispatcher *events.Dispatcher,
	broadcaster *broadcast.Broadcaster,
) *Connection {
	return &Connection{
		client:         client,
		session:        session,
		sessionService: sessionService,
		dispatcher:     dispatcher,
		broadcaster:    broadcaster,
	}
}

func (c *Connection) destroyConnection(ctx context.Context) {
	log.Printf("destroying connection for client %s in session %s", c.client.ID, c.session.ID)

	if c.client.Conn != nil {
		c.client.Conn.Close()
	}

	if err := c.sessionService.RemoveClient(ctx, c.session.ID, c.client.ID); err != nil {
		log.Printf("failed to remove client %s from session %s: %v", c.client.ID, c.session.ID, err)
	}
}

func (c *Connection) passMessage(rawMessage []byte) {
	otherClient, err := c.sessionService.GetOtherClient(c.client.SessionID, c.client.ID)
	if err != nil {
		log.Printf("failed to get other client: %v", err)
		return
	}

	if otherClient == nil {
		log.Printf("no other client to pass message to")
		return
	}

	if err := otherClient.Conn.WriteMessage(1, rawMessage); err != nil {
		log.Printf("pass message failed %s: %v", otherClient.ID, err)
	}
}

func (c *Connection) Listen(ctx context.Context) {
	defer c.destroyConnection(ctx)

	for {
		select {
		case <-ctx.Done():
			log.Printf("connection closed for client %s: %v", c.client.ID, ctx.Err())
			return

		default:
			_, rawMessage, err := c.client.Conn.ReadMessage()
			if err != nil {
				return
			}

			if err := c.dispatcher.Dispatch(c.client, rawMessage); err != nil {
				if errors.Is(err, events.ErrNoHandlerRegistered) {
					c.passMessage(rawMessage)
					continue
				}

				log.Printf("failed to dispatch message from client %s: %v", c.client.ID, err)
			}
		}
	}
}
