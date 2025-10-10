package events

import (
	"context"
	"fmt"
	"log"

	"peersend/internal/broadcast"
	"peersend/internal/domain"
)

type EventPublisherImpl struct {
	Broadcaster *broadcast.Broadcaster
}

var _ domain.EventPublisher = (*EventPublisherImpl)(nil)

func NewEventPublisher(broadcaster *broadcast.Broadcaster) *EventPublisherImpl {
	return &EventPublisherImpl{
		Broadcaster: broadcaster,
	}
}

func (e *EventPublisherImpl) PublishSyncClientsEvent(ctx context.Context, sessionID string, clientIDs []string) error {
	log.Printf("[EventPublisher] Syncing clients for session %s: %d clients", sessionID, len(clientIDs))

	if err := e.Broadcaster.BroadcastSyncClients(ctx, sessionID, clientIDs); err != nil {
		return fmt.Errorf("failed to broadcast sync clients: %w", err)
	}

	return nil
}

func (e *EventPublisherImpl) PublishHostTransferredEvent(ctx context.Context, sessionID string, newHostID string) error {
	log.Printf("[EventPublisher] Host transferred for session %s: new host %s", sessionID, newHostID)

	if err := e.Broadcaster.BroadcastHostTransferred(ctx, sessionID, newHostID); err != nil {
		return fmt.Errorf("failed to broadcast host transferred: %w", err)
	}

	return nil
}
