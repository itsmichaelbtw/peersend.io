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
	if err := s.repo.AddClient(sessionID, client); err != nil {
		return fmt.Errorf("failed to add client %s to session %s: %w", client.ID, sessionID, err)
	}

	hostID, err := s.repo.GetHostID(sessionID)
	if err != nil {
		return fmt.Errorf("failed to check host status for session %s: %w", sessionID, err)
	}

	if hostID == "" {
		if err := s.repo.SetHost(sessionID, client.ID); err != nil {
			return fmt.Errorf("failed to set host for session %s: %w", sessionID, err)
		}
	}

	if err := s.repo.SetClientSessionID(sessionID, client.ID); err != nil {
		return fmt.Errorf("failed to set session ID for client %s in session %s: %w", client.ID, sessionID, err)
	}

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get client IDs for session %s after adding client %s: %w", sessionID, client.ID, err)
	}

	if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
		s.logger.Warn().Err(err).Str("session_id", sessionID).Msg("failed to publish sync clients event")
	}

	s.logger.Info().Str("session_id", sessionID).Str("client_id", client.ID).Int("client_count", len(clientIDs)).Msg("client joined session")

	return nil
}

func (s *SessionService) RemoveClient(ctx context.Context, sessionID, clientID string) error {
	if isHost, _ := s.repo.IsHost(sessionID, clientID); isHost {
		if otherClient, err := s.repo.GetOtherClient(sessionID, clientID); err == nil && otherClient != nil {
			if err := s.TransferHost(ctx, sessionID, clientID, otherClient.ID); err != nil {
				s.logger.Warn().Err(err).Str("session_id", sessionID).Str("client_id", clientID).Msg("failed to transfer host on disconnect")
			}
		}
	}

	if err := s.repo.RemoveClient(sessionID, clientID); err != nil {
		return fmt.Errorf("failed to remove client %s from session %s: %w", clientID, sessionID, err)
	}

	if isEmpty, _ := s.repo.IsEmpty(sessionID); isEmpty {
		return s.CleanupSession(ctx, sessionID)
	}

	clientIDs, err := s.repo.GetClientIDs(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get remaining client IDs for session %s: %w", sessionID, err)
	}

	if err := s.publisher.PublishSyncClientsEvent(ctx, sessionID, clientIDs); err != nil {
		s.logger.Warn().Err(err).Str("session_id", sessionID).Msg("failed to publish sync clients event")
	}

	s.logger.Info().Str("session_id", sessionID).Str("client_id", clientID).Int("remaining_clients", len(clientIDs)).Msg("client left session")

	return nil
}

func (s *SessionService) CleanupSession(ctx context.Context, sessionID string) error {
	// check if clients exist and if so just close the connection
	s.repo.DeleteSession(sessionID)
	s.logger.Info().Str("session_id", sessionID).Msg("session destroyed")
	return nil
}

func (s *SessionService) TransferHost(ctx context.Context, sessionID, fromClientID, toClientID string) error {
	isHost, err := s.repo.IsHost(sessionID, fromClientID)
	if err != nil {
		return fmt.Errorf("failed to check host status for session %s: %w", sessionID, err)
	}

	if !isHost {
		return ErrOnlyHostCanTransfer
	}

	client, err := s.repo.GetClient(sessionID, toClientID)
	if err != nil {
		return fmt.Errorf("failed to check if target client exists in session %s: %w", sessionID, err)
	}

	if client == nil {
		return ErrNoTargetForHostTransfer
	}

	if err := s.repo.SetHost(sessionID, toClientID); err != nil {
		return fmt.Errorf("failed to set host for session %s: %w", sessionID, err)
	}

	if err := s.publisher.PublishHostTransferredEvent(ctx, sessionID, toClientID); err != nil {
		s.logger.Warn().Err(err).Str("session_id", sessionID).Str("new_host_id", toClientID).Msg("failed to publish host transferred event")
	}

	s.logger.Info().Str("session_id", sessionID).Str("from_client_id", fromClientID).Str("to_client_id", toClientID).Msg("host transferred")

	return nil
}

func (s *SessionService) GetSessionData(sessionID, clientID string) (*domain.SessionData, error) {
	session, err := s.repo.GetSession(sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session %s: %w", sessionID, err)
	}

	hostID, err := s.repo.GetHostID(sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get host ID for session %s: %w", sessionID, err)
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
			HostID: hostID,
		},
		SyncClientsData: domain.SyncClientsData{
			Clients: clientIDs,
		},
	}, nil
}

func (s *SessionService) GetOtherClient(sessionID, clientID string) (*domain.Client, error) {
	return s.repo.GetOtherClient(sessionID, clientID)
}
