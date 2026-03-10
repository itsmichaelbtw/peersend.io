// Package repository provides the data-persistence layer for the peersend
// signaling server. Currently the only implementation is InMemorySessionRepo,
// which stores all session and client state in process memory protected by a
// sync.RWMutex. All exported methods satisfy the domain.SessionRepository
// interface.
package repository

import (
	"sync"
	"time"

	"peersend/internal/config"
	"peersend/internal/domain"
	"peersend/internal/util"
)

// compile-time assertion: InMemorySessionRepo must satisfy domain.SessionRepository.
var _ domain.SessionRepository = (*InMemorySessionRepo)(nil)

// InMemorySessionRepo is a thread-safe, in-process implementation of
// domain.SessionRepository. Session data is lost when the process exits.
// All public methods acquire the appropriate lock before accessing the sessions
// map.
type InMemorySessionRepo struct {
	// sessions holds all live sessions keyed by session ID.
	sessions map[string]*domain.Session

	mu sync.RWMutex

	// configured via server settings.
	maxClients int
}

func NewInMemorySessionRepo(maxClients int) *InMemorySessionRepo {
	return &InMemorySessionRepo{
		sessions:   make(map[string]*domain.Session),
		maxClients: maxClients,
	}
}

// getSession retrieves the session with the given id from the map without
// acquiring a lock. Callers must hold at least a read lock before calling this.
func (r *InMemorySessionRepo) getSession(id string) (*domain.Session, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, ErrSessionNotFound
	}
	return session, nil
}

// isSessionFull reports whether session has reached the configured client
// limit. Callers must hold at least a read lock before calling this.
func (r *InMemorySessionRepo) isSessionFull(session *domain.Session) bool {
	return len(session.Clients) >= r.maxClients
}

// CreateSession generates a unique session code and stores a new empty
// Session. Returns an error if a unique code cannot be generated within the
// configured number of attempts (util.SessionIdentifier.GenerateUnique).
func (r *InMemorySessionRepo) CreateSession() (*domain.Session, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	cfg := config.Get()

	sessionIdentifier := &util.SessionIdentifier{
		Length: cfg.Server.SessionCodeLength,
		Chars:  cfg.Server.SessionCodeChars,
		Prefix: cfg.Server.SessionCodePrefix,
	}

	id, err := sessionIdentifier.GenerateUnique(func(id string) bool {
		_, exists := r.sessions[id]
		return exists
	}, cfg.Server.MaxGenerationAttempts)

	if err != nil {
		return nil, err
	}

	session := &domain.Session{
		ID:        id,
		Clients:   make(map[string]*domain.Client),
		CreatedAt: time.Now().Unix(),
	}
	r.sessions[id] = session
	return session, nil
}

// GetSession returns the session with the given id.
// Returns ErrSessionNotFound if no session exists for id.
func (r *InMemorySessionRepo) GetSession(id string) (*domain.Session, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.getSession(id)
}

// DeleteSession removes the session identified by id. It is a no-op if the
// session does not exist.
func (r *InMemorySessionRepo) DeleteSession(id string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.sessions, id)
}

// AddClient adds client to the session identified by sessionID.
// Returns ErrSessionNotFound if the session does not exist, or ErrSessionFull
// if the session has already reached maxClients.
func (r *InMemorySessionRepo) AddClient(sessionID string, client *domain.Client) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return err
	}

	if r.isSessionFull(session) {
		return ErrSessionFull
	}
	session.Clients[client.ID] = client
	return nil
}

// RemoveClient removes the client identified by clientID from the session
// identified by sessionID. Returns ErrSessionNotFound if the session does not
// exist. Removing a client that is not in the session is a no-op.
func (r *InMemorySessionRepo) RemoveClient(sessionID, clientID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return err
	}
	delete(session.Clients, clientID)
	return nil
}

// GetClient returns the client identified by clientID within the session
// identified by sessionID. Returns ErrSessionNotFound or ErrClientNotFound
// if either does not exist.
func (r *InMemorySessionRepo) GetClient(sessionID, clientID string) (*domain.Client, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return nil, err
	}
	client, exists := session.Clients[clientID]
	if !exists {
		return nil, ErrClientNotFound
	}
	return client, nil
}

// GetOtherClient returns any client in the session other than the one
// identified by clientID. Returns ErrSessionNotFound if the session does not
// exist, or ErrNoOtherClient if no other peer is currently in the session.
func (r *InMemorySessionRepo) GetOtherClient(sessionID, clientID string) (*domain.Client, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return nil, err
	}
	for id, client := range session.Clients {
		if id != clientID {
			return client, nil
		}
	}
	return nil, ErrNoOtherClient
}

// GetClients returns all clients currently in the session identified by
// sessionID. Returns ErrSessionNotFound if the session does not exist.
func (r *InMemorySessionRepo) GetClients(sessionID string) ([]*domain.Client, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return nil, err
	}

	clients := make([]*domain.Client, 0, len(session.Clients))
	for _, client := range session.Clients {
		clients = append(clients, client)
	}
	return clients, nil
}

// GetClientIDs returns the IDs of all clients currently in the session
// identified by sessionID. Returns ErrSessionNotFound if the session does not
// exist.
func (r *InMemorySessionRepo) GetClientIDs(sessionID string) ([]string, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return nil, err
	}

	ids := make([]string, 0, len(session.Clients))
	for id := range session.Clients {
		ids = append(ids, id)
	}
	return ids, nil
}

// IsFull reports whether the session identified by sessionID has reached its
// maximum client capacity. Returns ErrSessionNotFound if the session does not
// exist.
func (r *InMemorySessionRepo) IsFull(sessionID string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return false, err
	}
	return r.isSessionFull(session), nil
}

// IsEmpty reports whether the session identified by sessionID has no connected
// clients. Returns ErrSessionNotFound if the session does not exist.
func (r *InMemorySessionRepo) IsEmpty(sessionID string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, ok := r.sessions[sessionID]
	if !ok {
		return false, ErrSessionNotFound
	}
	return len(session.Clients) == 0, nil
}

// SetHost designates the client identified by clientID as the host of the
// session identified by sessionID. Returns ErrSessionNotFound if the session
// does not exist, or ErrClientNotFound if clientID is not in the session.
func (r *InMemorySessionRepo) SetHost(sessionID, clientID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return err
	}

	if _, exists := session.Clients[clientID]; !exists {
		return ErrClientNotFound
	}

	session.HostID = clientID
	return nil
}

// GetHostID returns the client ID of the current host of the session
// identified by sessionID. Returns ErrSessionNotFound if the session does not
// exist.
func (r *InMemorySessionRepo) GetHostID(sessionID string) (string, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return "", err
	}
	return session.HostID, nil
}

// IsHost reports whether the client identified by clientID is the current host
// of the session identified by sessionID. Returns ErrSessionNotFound if the
// session does not exist.
func (r *InMemorySessionRepo) IsHost(sessionID, clientID string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return false, err
	}
	return session.HostID == clientID, nil
}

// SetClientSessionID updates the SessionID field on the stored client to
// sessionID, associating the client with the session it has joined. Returns
// ErrSessionNotFound if the session does not exist, or ErrClientNotFound if
// clientID is not in the session.
func (r *InMemorySessionRepo) SetClientSessionID(sessionID, clientID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return err
	}

	client, exists := session.Clients[clientID]
	if !exists {
		return ErrClientNotFound
	}

	client.SessionID = sessionID
	return nil
}
