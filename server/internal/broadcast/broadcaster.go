package broadcast

import (
	"context"
	"errors"
	"fmt"
	"log"

	"peersend/internal/domain"
)

type Broadcaster struct {
	sessionRepo domain.SessionRepository
}

func NewBroadcaster(sessionRepo domain.SessionRepository) *Broadcaster {
	return &Broadcaster{
		sessionRepo: sessionRepo,
	}
}

func (b *Broadcaster) BroadcastSyncClients(ctx context.Context, sessionID string, clientIDs []string) error {
	session, err := b.sessionRepo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("get session for sync clients broadcast: %w", err)
	}

	message := domain.NewMessage(domain.MessageOutSyncClients, domain.SyncClientsData{
		Clients: clientIDs,
	})

	return b.broadcastToSession(ctx, session, message)
}

func (b *Broadcaster) BroadcastHostTransferred(ctx context.Context, sessionID string, newHostID string) error {
	session, err := b.sessionRepo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("get session for host transfer broadcast: %w", err)
	}

	message := domain.NewMessage(domain.MessageOutHostTransferred, domain.HostTransferData{
		HostID: newHostID,
	})

	return b.broadcastToSession(ctx, session, message)
}

func (b *Broadcaster) MessageClient(ctx context.Context, client *domain.Client, msg any) error {
	if client == nil || client.Conn == nil {
		return errors.New("client or connection is nil")
	}

	select {
	case <-ctx.Done():
		return fmt.Errorf("context cancelled: %w", ctx.Err())
	default:
		if err := client.Conn.WriteJSON(msg); err != nil {
			return fmt.Errorf("failed to send message to client %s: %w", client.ID, err)
		}
	}

	return nil
}

func (b *Broadcaster) broadcastToSession(ctx context.Context, session *domain.Session, message any) error {
	if session == nil {
		return fmt.Errorf("session is nil")
	}

	for _, client := range session.Clients {
		go func(c *domain.Client) {
			if err := b.MessageClient(ctx, c, message); err != nil {
				log.Printf("failed to broadcast to client %s: %v", c.ID, err)
			}
		}(client)
	}

	return nil
}

func (b *Broadcaster) Start(session *domain.Session) {
	for message := range session.Broadcast {
		ctx := context.Background()
		_ = b.broadcastToSession(ctx, session, message)
	}
}
