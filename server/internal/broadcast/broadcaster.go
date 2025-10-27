package broadcast

import (
	"context"
	"errors"
	"fmt"

	"github.com/rs/zerolog"

	"peersend/internal/config"
	"peersend/internal/domain"
)

type Broadcaster struct {
	sessionRepo domain.SessionRepository
	logger      zerolog.Logger
}

func NewBroadcaster(sessionRepo domain.SessionRepository) *Broadcaster {
	return &Broadcaster{
		sessionRepo: sessionRepo,
		logger:      config.WithComponent("broadcaster"),
	}
}

func (b *Broadcaster) broadcastToSession(ctx context.Context, session *domain.Session, message any) error {
	if session == nil {
		return errors.New("cannot broadcast to session as the session is nil")
	}

	// need to lock the session
	for _, client := range session.Clients {
		go func(c *domain.Client) {
			if err := b.MessageClient(ctx, c, message); err != nil {
				b.logger.Warn().
					Err(err).
					Str("client_id", c.ID).
					Msg("failed to broadcast to client")
			}
		}(client)
	}

	return nil
}

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
