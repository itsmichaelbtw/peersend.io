package handlers

import (
	"context"
	"errors"
	"fmt"
	"peersend/internal/config"
	"peersend/internal/domain"
	"peersend/internal/events"

	"github.com/rs/zerolog"
)

var _ events.EventHandler[any] = (*TransferHostEventHandler)(nil)

type TransferHostEventHandler struct {
	logger zerolog.Logger
}

func NewTransferHostEventHandler() *TransferHostEventHandler {
	return &TransferHostEventHandler{
		logger: config.WithComponent("transfer_host_event_handler"),
	}
}

func (h *TransferHostEventHandler) Handle(eventContext *events.EventContext, client *domain.Client, incomingData []byte) error {
	if client.SessionID == "" {
		return errors.New("cannot transfer host: client is not in a session")
	}

	otherClient, err := eventContext.SessionService.GetOtherClient(client.SessionID, client.ID)
	if err != nil {
		return fmt.Errorf("failed to find transfer target in session %s: %w", client.SessionID, err)
	}

	if otherClient == nil {
		return fmt.Errorf("cannot transfer host in session %s: no other client available", client.SessionID)
	}

	if err := eventContext.SessionService.TransferHost(context.Background(), client.SessionID, client.ID, otherClient.ID); err != nil {
		return fmt.Errorf("failed to transfer host from %s to %s in session %s: %w", client.ID, otherClient.ID, client.SessionID, err)
	}

	return nil
}
