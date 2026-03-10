package events

import (
	"context"
	"fmt"

	"github.com/rs/zerolog"

	"peersend/internal/broadcast"
	"peersend/internal/config"
	"peersend/internal/domain"
)

// EventPublisherImpl implements domain.EventPublisher by translating domain
// events into targeted broadcast calls via the Broadcaster.
type EventPublisherImpl struct {
	// Broadcaster is the underlying message delivery mechanism. It is exported
	// to allow the server layer to use it directly for one-off messages.
	Broadcaster *broadcast.Broadcaster
	logger      zerolog.Logger
}

// compile-time assertion: EventPublisherImpl must satisfy domain.EventPublisher.
var _ domain.EventPublisher = (*EventPublisherImpl)(nil)

func NewEventPublisher(broadcaster *broadcast.Broadcaster) *EventPublisherImpl {
	return &EventPublisherImpl{
		Broadcaster: broadcaster,
		logger:      config.WithLogComponent("event_publisher"),
	}
}

// PublishSyncClientsEvent broadcasts a sync_clients message containing
// clientIDs to all clients currently in the session identified by sessionID.
// It wraps any broadcaster error with session context.
//
// Additional logic can be added here in the future if the sync clients event requires more complex handling.
func (e *EventPublisherImpl) PublishSyncClientsEvent(ctx context.Context, sessionID string, clientIDs []string) error {
	if err := e.Broadcaster.BroadcastSyncClients(ctx, sessionID, clientIDs); err != nil {
		return fmt.Errorf("failed to broadcast sync clients event to session %s: %w", sessionID, err)
	}
	return nil
}

// PublishHostTransferredEvent broadcasts a host_transferred message carrying
// newHostID to all clients currently in the session identified by sessionID.
// It wraps any broadcaster error with session context.
//
// Additional logic can be added here in the future if the host transfer event requires more complex handling.
func (e *EventPublisherImpl) PublishHostTransferredEvent(ctx context.Context, sessionID string, newHostID string) error {
	if err := e.Broadcaster.BroadcastHostTransferred(ctx, sessionID, newHostID); err != nil {
		return fmt.Errorf("failed to broadcast host transfer event to session %s: %w", sessionID, err)
	}
	return nil
}
