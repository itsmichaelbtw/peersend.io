package handlers

import (
	"context"
	"errors"
	"fmt"
	"peersend/internal/domain"
	"peersend/internal/events"
)

type TransferHostEventHandler struct{}

func (h *TransferHostEventHandler) Handle(eventContext *events.EventContext, client *domain.Client, incomingData any) error {
	if client.SessionID == "" {
		return errors.New("client has no session")
	}

	otherClient, err := eventContext.SessionService.GetOtherClient(client.SessionID, client.ID)
	if err != nil {
		return fmt.Errorf("get other client: %w", err)
	}

	if otherClient == nil {
		return errors.New("no other client found in session")
	}

	if err := eventContext.SessionService.TransferHost(context.Background(), client.SessionID, client.ID, otherClient.ID); err != nil {
		return fmt.Errorf("transfer host: %w", err)
	}

	return nil
}
