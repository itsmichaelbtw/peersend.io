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

// Connection represents the active WebSocket session for a single connected
// client. It owns the read loop, message dispatch, and peer relay logic for
// that client's lifetime. When the loop exits the connection is torn down and
// the client is removed from the session.
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
		logger: config.WithLogComponent("connection").With().
			Str("client_id", client.ID).
			Str("session_id", session.ID).
			Logger(),
	}
}

// destroyConnection closes the client's WebSocket connection and removes the
// client from the session, triggering host transfer and session cleanup as
// needed. Errors during removal are logged but do not propagate, as the
// connection is already being torn down.
func (c *Connection) destroyConnection(ctx context.Context) {
	if c.client.Conn != nil {
		_ = c.client.Conn.Close()
	}

	if err := c.sessionService.RemoveClient(ctx, c.session.ID, c.client.ID); err != nil {
		c.logger.Error().Err(err).Str("session_id", c.session.ID).Str("client_id", c.client.ID).Msg("failed to clean up client from session")
	}
}

// passMessage forwards rawMessage as a raw WebSocket text frame (opcode 1)
// directly to the other client in the session, bypassing JSON serialisation.
// This enables transparent relay of peer-to-peer signaling payloads (e.g.
// SDP offers/answers, ICE candidates) whose structure is unknown to the server.
// The call is a no-op if no other client is present.
func (c *Connection) passMessage(rawMessage []byte) {
	otherClient, err := c.sessionService.GetOtherClient(c.client.SessionID, c.client.ID)
	if err != nil || otherClient == nil {
		return
	}

	otherClient.Mu.Lock()
	defer otherClient.Mu.Unlock()

	if err := otherClient.Conn.WriteMessage(1, rawMessage); err != nil {
		c.logger.Warn().Err(err).Str("to_client_id", otherClient.ID).Str("session_id", c.session.ID).Msg("failed to relay message to peer")
	}
}

// Listen runs the blocking read loop for the connection. It reads text frames
// from the client's WebSocket and dispatches them through the Dispatcher. If
// no handler is registered for a message type (ErrNoHandlerRegistered), the
// message is transparently relayed to the other peer via passMessage. The loop
// exits when ctx is cancelled, the WebSocket read returns an error (including
// normal closure), or a non-text frame is received.
//
// Listen always calls destroyConnection via defer when it returns.
func (c *Connection) Listen(ctx context.Context) {
	defer c.destroyConnection(ctx)

	for {
		select {
		case <-ctx.Done():
			c.logger.Debug().Err(ctx.Err()).Msg("connection terminated by context cancellation")
			return

		default:
			messageType, rawMessage, err := c.client.Conn.ReadMessage()
			if err != nil {
				c.logger.Info().Err(err).Msg("websocket read failed, terminating connection")
				return
			}

			// Only text frames (opcode 1) are processed; binary and control
			// frames are ignored.
			if messageType != 1 {
				c.logger.Warn().Int("message_type", messageType).Msg("received non-text message, ignoring")
				continue
			}

			if err := c.dispatcher.Dispatch(c.client, rawMessage); err != nil {
				if errors.Is(err, events.ErrNoHandlerRegistered) {
					c.passMessage(rawMessage)
					continue
				}

				// need to understand when to send errors to the client
				c.logger.Error().Err(err).Bytes("raw_message", rawMessage).Msg("message dispatch failed")
			}
		}
	}
}
