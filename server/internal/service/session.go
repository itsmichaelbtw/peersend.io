// Package service contains the business logic layer of the peersend signaling
// server. It sits between the HTTP/WebSocket transport layer and the
// repository, coordinating session lifecycle, client membership, and domain
// event publication.
package service

import (
	"context"
	"fmt"

	"github.com/rs/zerolog"

	"peersend/internal/config"
	"peersend/internal/domain"
)

// SessionService orchestrates all session-related operations including
// creation, client join/leave, host management, and session teardown. It
// publishes domain events via an EventPublisher after state-changing operations
// so that connected clients receive real-time updates.
type SessionService struct {
	repo      domain.SessionRepository
	publisher domain.EventPublisher
	logger    zerolog.Logger
}

func NewSessionService(repo domain.SessionRepository, publisher domain.EventPublisher) *SessionService {
	return &SessionService{
		repo:      repo,
		publisher: publisher,
		logger:    config.WithLogComponent("session_service"),
	}
}

// CreateSession allocates a new session in the repository and returns it.
// Returns an error if the repository cannot generate a unique session ID.
func (s *SessionService) CreateSession() (*domain.Session, error) {
	session, err := s.repo.CreateSession()
	if err != nil {
		return nil, fmt.Errorf("failed to create new session in repository: %w", err)
	}
	s.logger.Info().Str("session_id", session.ID).Msg("new session created")
	return session, nil
}

// GetSession retrieves the session identified by id from the repository.
// Returns an error if the session does not exist.
func (s *SessionService) GetSession(id string) (*domain.Session, error) {
	session, err := s.repo.GetSession(id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve session %s: %w", id, err)
	}
	return session, nil
}

// AddClient registers client in the session identified by sessionID.
// It performs the following steps in order:
//  1. Adds the client to the repository (returns an error if the session is full).
//  2. If the session has no host yet, designates client as the host.
//  3. Stores sessionID on the client record via SetClientSessionID.
//  4. Publishes a sync_clients event so all peers receive the updated roster.
//
// A failed sync_clients publication is logged as a warning but does not cause
// AddClient to return an error.
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

// RemoveClient removes the client identified by clientID from the session.
// Before removal, if the departing client is the host, host privileges are
// automatically transferred to the remaining peer (if one exists). After
// removal, if the session is empty it is destroyed via CleanupSession;
// otherwise a sync_clients event is published to notify remaining peers.
//
// Failed host-transfer attempts are logged as warnings. Failed sync_clients
// publications are also logged as warnings.
func (s *SessionService) RemoveClient(ctx context.Context, sessionID, clientID string) error {
	// clean this up as a double IsHost is checked
	// maybe add a sentineal error
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

// CleanupSession deletes the session identified by sessionID from the
// repository. It is called automatically by RemoveClient when the last client
// leaves. Returns nil in all cases; the error return is reserved for future
// use.
func (s *SessionService) CleanupSession(ctx context.Context, sessionID string) error {
	// check if clients exist and if so just close the connection
	s.repo.DeleteSession(sessionID)
	s.logger.Info().Str("session_id", sessionID).Msg("session destroyed")
	return nil
}

// TransferHost transfers host privileges in sessionID from fromClientID to
// toClientID. It verifies that fromClientID is currently the host and that
// toClientID exists in the session before updating the stored host and
// publishing a host_transferred event.
//
// Returns ErrOnlyHostCanTransfer if fromClientID is not the host, or
// ErrNoTargetForHostTransfer if toClientID is not found in the session.
// A failed host_transferred publication is logged as a warning.
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

// GetSessionData assembles a domain.SessionData snapshot for the client
// identified by clientID in session sessionID. The snapshot includes the
// session code, the client's own ID, server capability flags, the current
// host, and the full client roster. It is sent to the client immediately after
// it joins.
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
		MaximumClients:  cfg.Server.MaxClients,
		FileTransferCapacity: cfg.Server.FileTransferCapacityBytes,
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

// GetOtherClient returns the peer of clientID in the session identified by
// sessionID. It delegates directly to the repository and is provided as a
// convenience method for the server and event-handler layers.
func (s *SessionService) GetOtherClient(sessionID, clientID string) (*domain.Client, error) {
	return s.repo.GetOtherClient(sessionID, clientID)
}
