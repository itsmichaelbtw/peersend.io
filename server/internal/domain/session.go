package domain

type Session struct {
	ID        string
	Clients   map[string]*Client
	HostID    string
	CreatedAt int64
}

type SessionRepository interface {
	CreateSession() (*Session, error)
	GetSession(id string) (*Session, error)
	DeleteSession(id string)
	AddClient(sessionID string, client *Client) error
	RemoveClient(sessionID, clientID string) error
	GetHostID(sessionID string) (string, error)
	GetClient(sessionID, clientID string) (*Client, error)
	GetOtherClient(sessionID, clientID string) (*Client, error)
	GetClients(sessionID string) ([]*Client, error)
	GetClientIDs(sessionID string) ([]string, error)
	IsFull(sessionID string) (bool, error)
	IsEmpty(sessionID string) (bool, error)
	IsHost(sessionID, clientID string) (bool, error)
	SetHost(sessionID, clientID string) error
	SetClientSessionID(sessionID, clientID string) error
}
