package events

import (
	"encoding/json"
	"fmt"
	"peersend/internal/domain"
	"sync"
)

type Dispatcher struct {
	handlers     map[string]EventHandler[any]
	eventContext *EventContext
	mu           sync.RWMutex
}

func NewDispatcher(eventContext *EventContext) *Dispatcher {
	return &Dispatcher{
		handlers:     make(map[string]EventHandler[any]),
		eventContext: eventContext,
	}
}

func (d *Dispatcher) RegisterHandler(messageType string, handler EventHandler[any]) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.handlers[messageType] = handler
}

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
		var message domain.Message[any]
		if err := json.Unmarshal(rawMessage, &message); err != nil {
			return fmt.Errorf("failed to unmarshal message payload: %w", err)
		}

		return h.Handle(d.eventContext, client, message.Data)
	default:
		return fmt.Errorf("handler type assertion failed for %s", envelope.Type)
	}
}
