package handlers

import (
	"context"
	"peersend/internal/domain"
	"peersend/internal/events"
	"time"
)

type PingEventHandler struct {
}

func (h *PingEventHandler) Handle(eventContext *events.EventContext, client *domain.Client, incomingData any) error {
	data, ok := incomingData.(domain.PingData)
	if !ok {
		return nil
	}

	message := domain.NewMessage(domain.MessageOutPong, domain.PongData{
		ServerTimestamp: time.Now().UnixMilli(),
		PingData:        data,
	})

	return eventContext.Broadcaster.MessageClient(context.Background(), client, message)
}
