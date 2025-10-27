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

var _ events.EventHandler[domain.PingData] = (*PingEventHandler)(nil)

type PingEventHandler struct {
	logger zerolog.Logger
}

func NewPingEventHandler() *PingEventHandler {
	return &PingEventHandler{
		logger: config.WithComponent("ping_event_handler"),
	}
}

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
