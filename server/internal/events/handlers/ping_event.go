// Package handlers contains concrete EventHandler implementations for each
// recognised inbound WebSocket message type. Each handler is registered with
// the Dispatcher at server startup.
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"peersend/internal/config"
	"peersend/internal/domain"
	"peersend/internal/events"
	"time"

	"github.com/rs/zerolog"
)

// compile-time assertion: PingEventHandler must satisfy EventHandler[domain.PingData].
var _ events.EventHandler[domain.PingData] = (*PingEventHandler)(nil)

type PingEventHandler struct {
	logger zerolog.Logger
}

func NewPingEventHandler() *PingEventHandler {
	return &PingEventHandler{
		logger: config.WithLogComponent("ping_event_handler"),
	}
}

// Handle parses the incoming ping message, records the server timestamp, and
// sends a domain.MessageOutPong response directly to client. Returns an error
// if the message cannot be parsed or the response cannot be delivered.
func (h *PingEventHandler) Handle(eventContext *events.EventContext, client *domain.Client, incomingData []byte) error {
	var message domain.Message[domain.PingData]
	if err := json.Unmarshal(incomingData, &message); err != nil {
		return fmt.Errorf("failed to parse incoming data: %w", err)
	}

	return eventContext.Broadcaster.MessageClient(context.Background(), client, domain.NewMessage(domain.MessageOutPong, domain.PongData{
		ServerTimestamp: time.Now().UnixMilli(),
		PingData:        message.Data,
	}))
}
