package events

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/rs/zerolog"

	"peersend/internal/config"
	"peersend/internal/domain"
)

// Dispatcher routes incoming WebSocket messages to their registered
// EventHandler based on the message's "type" field. It is safe for concurrent
// use; handler registration and dispatch are both guarded by an RWMutex.
type Dispatcher struct {
	// handlers maps message type strings to their registered EventHandler.
	handlers map[string]EventHandler[any]

	// eventContext is passed to every handler invocation.
	eventContext *EventContext

	logger zerolog.Logger

	mu sync.RWMutex
}

func NewDispatcher(eventContext *EventContext) *Dispatcher {
	return &Dispatcher{
		handlers:     make(map[string]EventHandler[any]),
		eventContext: eventContext,
		logger:       config.WithLogComponent("dispatcher"),
	}
}

// RegisterHandler associates handler with the given messageType string. If a
// handler is already registered for the type it is silently replaced.
// RegisterHandler is safe to call concurrently.
func (d *Dispatcher) RegisterHandler(messageType string, handler EventHandler[any]) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.handlers[messageType] = handler
}

// Dispatch unmarshals the Type field from rawMessage, looks up the registered
// handler for that type, and invokes it. It returns ErrNoHandlerRegistered
// when no handler is found, allowing the caller to fall back to transparent
// message relay. Any other returned error originates from the handler itself.
//
// Ping messages are dispatched silently (no info log) to avoid log spam.
func (d *Dispatcher) Dispatch(client *domain.Client, rawMessage []byte) error {
	var envelope EventEnvelope
	if err := json.Unmarshal(rawMessage, &envelope); err != nil {
		return fmt.Errorf("failed to unmarshal message type: %w", err)
	}

	d.mu.RLock()
	handler, exists := d.handlers[envelope.Type]
	d.mu.RUnlock()
	if !exists {
		return ErrNoHandlerRegistered
	}

	switch h := handler.(type) {
	case EventHandler[any]:
		if envelope.Type != "ping" {
			d.logger.Info().Str("event_type", envelope.Type).Str("client_id", client.ID).Msg("dispatching event")
		}

		return h.Handle(d.eventContext, client, rawMessage)
	default:
		return fmt.Errorf("handler type assertion failed for %s", envelope.Type)
	}
}
