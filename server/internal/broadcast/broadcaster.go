// Package broadcast provides the Broadcaster, which delivers JSON-encoded
// WebSocket messages to individual clients or to all clients within a session.
// All write operations are serialised per-client via the client's mutex so
// that the gorilla/websocket library's single-writer constraint is respected.
package broadcast

import (
	"context"
	"errors"
	"fmt"

	"github.com/rs/zerolog"

	"peersend/internal/config"
	"peersend/internal/domain"
)

// Broadcaster delivers outbound messages to connected WebSocket clients.
// It uses the SessionRepository to look up session membership and dispatches
// per-client writes in separate goroutines when broadcasting to a whole session.
type Broadcaster struct {
	sessionRepo domain.SessionRepository
	logger      zerolog.Logger
}

func NewBroadcaster(sessionRepo domain.SessionRepository) *Broadcaster {
	return &Broadcaster{
		sessionRepo: sessionRepo,
		logger:      config.WithLogComponent("broadcaster"),
	}
}

// broadcastToSession sends message to every client in session concurrently.
// Each client write is performed in its own goroutine; failures are logged as
// warnings but do not abort delivery to other clients. Returns an error only
// if session is nil or the client list cannot be retrieved.
func (b *Broadcaster) broadcastToSession(ctx context.Context, session *domain.Session, message any) error {
	if session == nil {
		return errors.New("cannot broadcast to session as the session is nil")
	}

	clients, err := b.sessionRepo.GetClients(session.ID)
	if err != nil {
		return fmt.Errorf("failed to get clients for session %s during broadcast: %w", session.ID, err)
	}

	for _, client := range clients {
		go func(c *domain.Client) {
			if err := b.MessageClient(ctx, c, message); err != nil {
				b.logger.Warn().Err(err).Str("client_id", c.ID).Msg("failed to broadcast to client")
			}
		}(client)
	}

	return nil
}

// BroadcastSyncClients sends a domain.MessageOutSyncClients message carrying
// clientIDs to every client in the session identified by sessionID.
// Returns an error if the session cannot be found.
func (b *Broadcaster) BroadcastSyncClients(ctx context.Context, sessionID string, clientIDs []string) error {
	session, err := b.sessionRepo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session %s for sync broadcast: %w", sessionID, err)
	}

	message := domain.NewMessage(domain.MessageOutSyncClients, domain.SyncClientsData{
		Clients: clientIDs,
	})

	return b.broadcastToSession(ctx, session, message)
}

// BroadcastHostTransferred sends a domain.MessageOutHostTransferred message
// carrying newHostID to every client in the session identified by sessionID.
// Returns an error if the session cannot be found.
func (b *Broadcaster) BroadcastHostTransferred(ctx context.Context, sessionID string, newHostID string) error {
	session, err := b.sessionRepo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session %s for host transfer broadcast: %w", sessionID, err)
	}

	message := domain.NewMessage(domain.MessageOutHostTransferred, domain.HostTransferData{
		HostID: newHostID,
	})

	return b.broadcastToSession(ctx, session, message)
}

// MessageClient sends msg as a JSON-encoded WebSocket text frame to client.
// The write is serialised via client.Mu so concurrent callers do not race.
// If ctx carries a deadline, it is applied as the WebSocket write deadline.
// Returns an error if client or its connection is nil, the deadline cannot
// be set, or the JSON write fails.
func (b *Broadcaster) MessageClient(ctx context.Context, client *domain.Client, msg any) error {
	if client == nil {
		return errors.New("cannot message client has the client is nil")
	}

	if client.Conn == nil {
		return errors.New("cannot message client as the connection is closed")
	}

	client.Mu.Lock()
	defer client.Mu.Unlock()

	if deadline, ok := ctx.Deadline(); ok {
		if err := client.Conn.SetWriteDeadline(deadline); err != nil {
			return fmt.Errorf("failed to set write deadline: %w", err)
		}
	}

	if err := client.Conn.WriteJSON(msg); err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}

	return nil
}
