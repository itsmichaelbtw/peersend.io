package events

import (
	"context"
	"fmt"

	"github.com/rs/zerolog"

	"peersend/internal/broadcast"
	"peersend/internal/config"
	"peersend/internal/domain"
)

type EventPublisherImpl struct {
	Broadcaster *broadcast.Broadcaster
	logger      zerolog.Logger
}

var _ domain.EventPublisher = (*EventPublisherImpl)(nil)

func NewEventPublisher(broadcaster *broadcast.Broadcaster) *EventPublisherImpl {
	return &EventPublisherImpl{
		Broadcaster: broadcaster,
		logger:      config.WithComponent("event_publisher"),
	}
}

func (e *EventPublisherImpl) PublishSyncClientsEvent(ctx context.Context, sessionID string, clientIDs []string) error {
	if err := e.Broadcaster.BroadcastSyncClients(ctx, sessionID, clientIDs); err != nil {
		return fmt.Errorf("failed to broadcast sync clients event to session %s: %w", sessionID, err)
	}
	return nil
}

func (e *EventPublisherImpl) PublishHostTransferredEvent(ctx context.Context, sessionID string, newHostID string) error {
	if err := e.Broadcaster.BroadcastHostTransferred(ctx, sessionID, newHostID); err != nil {
		return fmt.Errorf("failed to broadcast host transfer event to session %s: %w", sessionID, err)
	}
	return nil
}
