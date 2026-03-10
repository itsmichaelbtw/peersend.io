// Package events provides the event dispatch infrastructure for the peersend
// signaling server. It defines EventHandler, the generic handler interface,
// EventContext (which carries shared dependencies into handlers), EventEnvelope
// (used to route raw messages to the correct handler), and the Dispatcher that
// ties them together.
package events

import (
	"peersend/internal/broadcast"
	"peersend/internal/domain"
	"peersend/internal/service"
)

// EventEnvelope is a minimal JSON structure used solely to extract the Type
// field from a raw incoming WebSocket message so the Dispatcher can route it
// to the correct EventHandler without fully unmarshalling the payload.
type EventEnvelope struct {
	// Type corresponds to the "type" field in all client-sent Message payloads
	// (e.g. domain.MessageInPing, domain.MessageInTransferHost).
	Type string `json:"type"`
}

// EventContext bundles the shared application dependencies that every
// EventHandler may need. A single instance is created at startup and passed
// to each handler invocation, avoiding global state.
type EventContext struct {
	// SessionService provides session and client management operations.
	SessionService *service.SessionService

	// ClientService provides client lifecycle operations.
	ClientService *service.ClientService

	// Broadcaster delivers outbound messages to connected WebSocket clients.
	Broadcaster *broadcast.Broadcaster
}

// EventHandler is the generic interface implemented by every inbound-message
// handler. T is the expected payload type of the handled message, though
// handlers receive the full raw bytes and are responsible for unmarshalling.
//
// Handlers registered with the Dispatcher must satisfy EventHandler[any].
type EventHandler[T any] interface {
	// Handle processes an inbound message from client. incomingData contains
	// the complete raw JSON WebSocket frame. Returns an error if handling
	// fails; the Dispatcher logs the error but does not close the connection.
	Handle(ctx *EventContext, client *domain.Client, incomingData []byte) error
}
