package service

import (
	"context"
	"fmt"

	"github.com/rs/zerolog"

	"peersend/internal/config"
	"peersend/internal/domain"
)

type SessionService struct {
	repo      domain.SessionRepository
	publisher domain.EventPublisher
	logger    zerolog.Logger
}

func NewSessionService(repo domain.SessionRepository, publisher domain.EventPublisher) *SessionService {
	return &SessionService{
		repo:      repo,
		publisher: publisher,
		logger:    config.WithComponent("session_service"),
	}
}

func (s *SessionService) CreateSession() (*domain.Session, error) {
	session, err := s.repo.CreateSession()
	if err != nil {
		return nil, fmt.Errorf("failed to create new session in repository: %w", err)
	}
	s.logger.Info().Str("session_id", session.ID).Msg("new session created")
	return session, nil
}

func (s *SessionService) GetSession(id string) (*domain.Session, error) {
	session, err := s.repo.GetSession(id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve session %s: %w", id, err)
	}
	return session, nil
}

func (s *SessionService) AddClient(ctx context.Context, sessionID string, client *domain.Client) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session %s when adding client: %w", sessionID, err)
	}

	if err := s.repo.AddClient(sessionID, client); err != nil {
		return fmt.Errorf("failed to add client %s to session %s: %w", client.ID, sessionID, err)
	}

	if session.HostID == "" {
		if err := s.repo.SetHost(sessionID, client.ID); err != nil {
			return fmt.Errorf("failed to set host for session %s: %w", sessionID, err)
		}
	}

	client.SessionID = sessionID

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get client IDs for session %s after adding client %s: %w", sessionID, client.ID, err)
	}

	if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
		s.logger.Warn().
			Err(err).
			Str("session_id", sessionID).
			Msg("failed to publish sync clients event")
	}

	s.logger.Info().
		Str("session_id", sessionID).
		Str("client_id", client.ID).
		Int("client_count", len(clientIDs)).
		Msg("client joined session")

	return nil
}

func (s *SessionService) RemoveClient(ctx context.Context, sessionID, clientID string) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session %s for client removal: %w", sessionID, err)
	}

	if session.HostID == clientID {
		otherClient, err := s.repo.GetOtherClient(sessionID, clientID)
		if err == nil && otherClient != nil {
			if err := s.TransferHost(ctx, sessionID, clientID, otherClient.ID); err != nil {
				s.logger.Warn().
					Err(err).
					Str("session_id", sessionID).
					Str("client_id", clientID).
					Msg("failed to transfer host on disconnect")
			}
		}
	}

	if err := s.repo.RemoveClient(sessionID, clientID); err != nil {
		return fmt.Errorf("failed to remove client %s from session %s: %w", clientID, sessionID, err)
	}

	isEmpty, _ := s.repo.IsEmpty(sessionID)
	if isEmpty {
		return s.CleanupSession(ctx, sessionID)
	}

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get remaining client IDs for session %s: %w", sessionID, err)
	}

	if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
		s.logger.Warn().
			Err(err).
			Str("session_id", sessionID).
			Msg("failed to publish sync clients event")
	}

	s.logger.Info().
		Str("session_id", sessionID).
		Str("client_id", clientID).
		Int("remaining_clients", len(clientIDs)).
		Msg("client left session")

	return nil
}

func (s *SessionService) CleanupSession(ctx context.Context, sessionID string) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session %s for cleanup: %w", sessionID, err)
	}

	if session.Broadcast != nil {
		close(session.Broadcast)
	}

	s.repo.DeleteSession(sessionID)
	s.logger.Info().Str("session_id", sessionID).Msg("session destroyed")

	return nil
}

func (s *SessionService) TransferHost(ctx context.Context, sessionID, fromClientID, toClientID string) error {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session %s for host transfer: %w", sessionID, err)
	}

	if session.HostID != fromClientID {
		return ErrOnlyHostCanTransfer
	}

	if _, exists := session.Clients[toClientID]; !exists {
		return ErrNoTargetForHostTransfer
	}

	if err := s.repo.SetHost(sessionID, toClientID); err != nil {
		return fmt.Errorf("failed to set host for session %s: %w", sessionID, err)
	}

	if err := s.publisher.PublishHostTransferredEvent(ctx, sessionID, toClientID); err != nil {
		s.logger.Warn().
			Err(err).
			Str("session_id", sessionID).
			Str("new_host_id", toClientID).
			Msg("failed to publish host transferred event")
	}

	s.logger.Info().
		Str("session_id", sessionID).
		Str("from_client_id", fromClientID).
		Str("to_client_id", toClientID).
		Msg("host transferred")

	return nil
}

func (s *SessionService) GetSessionData(sessionID, clientID string) (*domain.SessionData, error) {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session %s: %w", sessionID, err)
	}

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get client IDs for session %s: %w", sessionID, err)
	}

	cfg := config.Get()

	return &domain.SessionData{
		SessionCode:    session.ID,
		ClientID:       clientID,
		MaximumClients: cfg.Server.MaxClients,
		ConnectionType: domain.WebSocketConnectionType,
		EncryptionMode: cfg.Server.EncryptionMode,
		AutoWebRTC:     cfg.Server.AutoWebRTCEnabled,
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
