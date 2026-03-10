package domain

import "context"

// EventPublisher is the domain-level contract for broadcasting named events to
// session participants. Implementations translate these high-level calls into
// concrete WebSocket messages sent via the Broadcaster.
type EventPublisher interface {
	// This event is used to handle a client synchronization event, which is
	// triggered when a client connects or disconnects.
	PublishSyncClientsEvent(ctx context.Context, sessionID string, clientIDs []string) error

	// This event is triggered when the current host disconnects or voluntarily
	// transfers host privileges to another client. The server may also decide
	// to transfer host privileges to another client under certain conditions.
	PublishHostTransferredEvent(ctx context.Context, sessionID string, newHostID string) error
}
