package domain

// Session represents an active peer-to-peer signaling session. A session is
// created by a host client and can hold up to the server-configured maximum
// number of clients simultaneously.
type Session struct {
	// ID is the human-readable session code used by joining peers to locate
	// this session (e.g. "PS-ABCDEF").
	ID string

	// Clients holds all currently connected clients keyed by their Client.ID.
	Clients map[string]*Client

	// HostID is the Client.ID of the client that currently holds host
	// privileges. The host is the first client to join and may transfer
	// host status to another client.
	HostID string

	// CreatedAt is the Unix timestamp (seconds) at which the session was
	// created.
	CreatedAt int64
}

// SessionRepository defines the persistence contract for session and client
// state. The default implementation is an in-memory store; the interface
// allows alternative backends to be substituted without changing business logic.
type SessionRepository interface {
	// CreateSession allocates a new session with a unique, generated ID and
	// returns it. Returns an error if a unique ID cannot be generated within
	// the configured number of attempts.
	CreateSession() (*Session, error)

	// GetSession returns the session with the given ID, or an error if no
	// such session exists.
	GetSession(id string) (*Session, error)

	// DeleteSession removes the session with the given ID. It is a no-op if
	// the session does not exist.
	DeleteSession(id string)

	// AddClient adds client to the session identified by sessionID.
	// Returns ErrSessionFull if the session has already reached its client
	// limit, or ErrSessionNotFound if the session does not exist.
	AddClient(sessionID string, client *Client) error

	// RemoveClient removes the client identified by clientID from the session
	// identified by sessionID. Returns ErrSessionNotFound if the session does
	// not exist.
	RemoveClient(sessionID, clientID string) error

	// GetHostID returns the Client.ID of the current host of the session, or
	// an error if the session does not exist.
	GetHostID(sessionID string) (string, error)

	// GetClient returns the client identified by clientID within the given
	// session. Returns ErrClientNotFound if the client is not in the session.
	GetClient(sessionID, clientID string) (*Client, error)

	// GetOtherClient returns any client in the session other than the one
	// identified by clientID. Returns ErrNoOtherClient if no such peer exists.
	GetOtherClient(sessionID, clientID string) (*Client, error)

	// GetClients returns all clients currently in the session.
	GetClients(sessionID string) ([]*Client, error)

	// GetClientIDs returns the IDs of all clients currently in the session.
	GetClientIDs(sessionID string) ([]string, error)

	// IsFull reports whether the session has reached its maximum client
	// capacity.
	IsFull(sessionID string) (bool, error)

	// IsEmpty reports whether the session currently has no connected clients.
	IsEmpty(sessionID string) (bool, error)

	// IsHost reports whether the client identified by clientID is the current
	// host of the session.
	IsHost(sessionID, clientID string) (bool, error)

	// SetHost designates the client identified by clientID as the host of the
	// session. Returns ErrClientNotFound if the client is not in the session.
	SetHost(sessionID, clientID string) error

	// SetClientSessionID updates the SessionID field on the stored client to
	// the given sessionID. Returns ErrClientNotFound if the client is not in
	// the session.
	SetClientSessionID(sessionID, clientID string) error
}
