package server

import (
	"context"
	"errors"

	"github.com/rs/zerolog"

	"peersend/internal/broadcast"
	"peersend/internal/config"
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
	logger         zerolog.Logger
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
		logger: config.WithComponent("connection").With().
			Str("client_id", client.ID).
			Str("session_id", session.ID).
			Logger(),
	}
}

func (c *Connection) destroyConnection(ctx context.Context) {
	if c.client.Conn != nil {
		_ = c.client.Conn.Close()
	}

	if err := c.sessionService.RemoveClient(ctx, c.session.ID, c.client.ID); err != nil {
		c.logger.Error().
			Err(err).
			Str("session_id", c.session.ID).
			Str("client_id", c.client.ID).
			Msg("failed to clean up client from session")
	}
}

func (c *Connection) passMessage(rawMessage []byte) {
	otherClient, err := c.sessionService.GetOtherClient(c.client.SessionID, c.client.ID)
	if err != nil || otherClient == nil {
		return
	}

	otherClient.Mu.Lock()
	defer otherClient.Mu.Unlock()

	if err := otherClient.Conn.WriteMessage(1, rawMessage); err != nil {
		c.logger.Warn().
			Err(err).
			Str("to_client_id", otherClient.ID).
			Str("session_id", c.session.ID).
			Msg("failed to relay message to peer")
	}
}

func (c *Connection) Listen(ctx context.Context) {
	defer c.destroyConnection(ctx)

	for {
		select {
		case <-ctx.Done():
			c.logger.Debug().
				Err(ctx.Err()).
				Msg("connection terminated by context cancellation")
			return

		default:
			messageType, rawMessage, err := c.client.Conn.ReadMessage()
			if err != nil {
				c.logger.Info().
					Err(err).
					Msg("websocket read failed, terminating connection")
				return
			}

			if messageType != 1 {
				c.logger.Warn().
					Int("message_type", messageType).
					Msg("received non-text message, ignoring")
				continue
			}

			if err := c.dispatcher.Dispatch(c.client, rawMessage); err != nil {
				if errors.Is(err, events.ErrNoHandlerRegistered) {
					c.passMessage(rawMessage)
					continue
				}

				c.logger.Error().
					Err(err).
					Msg("message dispatch failed")
			}
		}
	}
}
