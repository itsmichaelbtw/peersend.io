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
	log.Printf("broadcasting client sync for session %s", sessionID)

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
	log.Printf("broadcasting host transfer for session %s", sessionID)

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

	if deadline, ok := ctx.Deadline(); ok {
		if err := client.Conn.SetWriteDeadline(deadline); err != nil {
			return fmt.Errorf("failed to set write deadline: %w", err)
		}
	}

	if err := client.Conn.WriteJSON(msg); err != nil {
		return fmt.Errorf("failed to send message to client %s: %w", client.ID, err)
	}

	return nil
}

func (b *Broadcaster) broadcastToSession(ctx context.Context, session *domain.Session, message any) error {
	if session == nil {
		return fmt.Errorf("session is nil")
	}

	// need to lock the session
	for _, client := range session.Clients {
		go func(c *domain.Client) {
			if err := b.MessageClient(ctx, c, message); err != nil {
				log.Printf("failed to broadcast to client %s: %v", c.ID, err)
			}
		}(client)
	}

	return nil
}

func (b *Broadcaster) Start(ctx context.Context, session *domain.Session) {
	for {
		select {
		case <-ctx.Done():
			log.Printf("stopping broadcaster for session %s: context done", session.ID)
			return
		case message, ok := <-session.Broadcast:
			if !ok {
				log.Printf("stopping broadcaster for session %s: broadcast channel closed", session.ID)
				return
			}

			if err := b.broadcastToSession(ctx, session, message); err != nil {
				log.Printf("failed to broadcast message to session %s: %v", session.ID, err)
			}
		}
	}
}
