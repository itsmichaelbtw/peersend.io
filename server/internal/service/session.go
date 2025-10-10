package service

import (
	"context"
	"fmt"
	"log"

	"peersend/internal/config"
	"peersend/internal/domain"
)

type SessionService struct {
	repo      domain.SessionRepository
	publisher domain.EventPublisher
}

func NewSessionService(repo domain.SessionRepository, publisher domain.EventPublisher) *SessionService {
	return &SessionService{
		repo:      repo,
		publisher: publisher,
	}
}

func (s *SessionService) CreateSession() (*domain.Session, error) {
	return s.repo.CreateSession()
}

func (s *SessionService) GetSession(id string) (*domain.Session, error) {
	return s.repo.GetSession(id)
}

func (s *SessionService) AddClient(ctx context.Context, sessionID string, client *domain.Client) error {
	if err := s.repo.AddClient(sessionID, client); err != nil {
		return fmt.Errorf("add client: %w", err)
	}

	client.SessionID = sessionID

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return fmt.Errorf("get client ids: %w", err)
	}

	if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
		log.Printf("failed to publish sync clients event: %v", err)
	}

	return nil
}

func (s *SessionService) RemoveClient(ctx context.Context, sessionID, clientID string) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("get session: %w", err)
	}

	if session.HostID == clientID {
		otherClient, err := s.repo.GetOtherClient(sessionID, clientID)
		if err == nil && otherClient != nil {
			if err := s.TransferHost(ctx, sessionID, clientID, otherClient.ID); err != nil {
				log.Printf("failed to transfer host on disconnect: %v", err)
			}
		}
	}

	if err := s.repo.RemoveClient(sessionID, clientID); err != nil {
		return fmt.Errorf("remove client: %w", err)
	}

	if isEmpty, _ := s.repo.IsEmpty(sessionID); isEmpty {
		return s.CleanupSession(ctx, sessionID)
	}

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return fmt.Errorf("get client ids: %w", err)
	}

	if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
		log.Printf("failed to publish sync clients event: %v", err)
	}

	return nil
}

func (s *SessionService) CleanupSession(ctx context.Context, sessionID string) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("get session for cleanup: %w", err)
	}

	log.Printf("cleaning up empty session %s", sessionID)

	if session.Broadcast != nil {
		close(session.Broadcast)
	}

	s.repo.DeleteSession(sessionID)

	return nil
}

func (s *SessionService) TransferHost(ctx context.Context, sessionID, fromClientID, toClientID string) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("get session: %w", err)
	}

	if session.HostID != fromClientID {
		return ErrOnlyHostCanTransfer
	}

	if _, exists := session.Clients[toClientID]; !exists {
		return ErrNoTargetForHostTransfer
	}

	session.HostID = toClientID

	if err := s.publisher.PublishHostTransferredEvent(ctx, sessionID, toClientID); err != nil {
		log.Printf("failed to publish host transferred event: %v", err)
	}

	return nil
}

func (s *SessionService) GetSessionData(sessionID, clientID string) (*domain.SessionData, error) {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return nil, fmt.Errorf("get session: %w", err)
	}

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return nil, fmt.Errorf("get client ids: %w", err)
	}

	return &domain.SessionData{
		SessionCode:    session.ID,
		ClientID:       clientID,
		MaximumClients: config.Get().Server.MaxClients,
		ConnectionType: "webrtc",
		EncryptionMode: "end_to_end",
		AutoWebRTC:     true,
		HostTransferData: domain.HostTransferData{
			HostID: session.HostID,
		},
		SyncClientsData: domain.SyncClientsData{
			Clients: clientIDs,
		},
	}, nil
}

func (s *SessionService) GetOtherClient(sessionID, clientID string) (*domain.Client, error) {
	return s.repo.GetOtherClient(sessionID, clientID)
}
