package repository

import (
	"sync"

	"peersend/internal/config"
	"peersend/internal/domain"
	"peersend/internal/util"
)

var _ domain.SessionRepository = (*InMemorySessionRepo)(nil)

type InMemorySessionRepo struct {
	sessions   map[string]*domain.Session
	mu         sync.RWMutex
	maxClients int
}

func NewInMemorySessionRepo(maxClients int) *InMemorySessionRepo {
	return &InMemorySessionRepo{
		sessions:   make(map[string]*domain.Session),
		maxClients: maxClients,
	}
}

func (r *InMemorySessionRepo) getSession(id string) (*domain.Session, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, ErrSessionNotFound
	}
	return session, nil
}

func (r *InMemorySessionRepo) isSessionFull(session *domain.Session) bool {
	return len(session.Clients) >= r.maxClients
}

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
		Broadcast: make(chan domain.Message[any]),
	}
	r.sessions[id] = session
	return session, nil
}

func (r *InMemorySessionRepo) GetSession(id string) (*domain.Session, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.getSession(id)
}

func (r *InMemorySessionRepo) DeleteSession(id string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.sessions, id)
}

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

func (r *InMemorySessionRepo) IsFull(sessionID string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, err := r.getSession(sessionID)
	if err != nil {
		return false, err
	}
	return r.isSessionFull(session), nil
}

func (r *InMemorySessionRepo) IsEmpty(sessionID string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, ok := r.sessions[sessionID]
	if !ok {
		return false, ErrSessionNotFound
	}
	return len(session.Clients) == 0, nil
}
