package events

import (
	"peersend/internal/broadcast"
	"peersend/internal/domain"
	"peersend/internal/service"
)

type EventEnvelope struct {
	Type string `json:"type"`
}

type EventContext struct {
	SessionService *service.SessionService
	ClientService  *service.ClientService
	Broadcaster    *broadcast.Broadcaster
}

type EventHandler[T any] interface {
	Handle(ctx *EventContext, client *domain.Client, incomingData T) error
}
