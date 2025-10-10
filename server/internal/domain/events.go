package domain

import "context"

type EventPublisher interface {
	PublishSyncClientsEvent(ctx context.Context, sessionID string, clientIDs []string) error
	PublishHostTransferredEvent(ctx context.Context, sessionID string, newHostID string) error
}
