package domain

type Session struct {
	ID        string
	Clients   map[string]*Client
	HostID    string
	Broadcast chan Message[any]
	CreatedAt int64
}

type SessionRepository interface {
	CreateSession() (*Session, error)
	GetSession(id string) (*Session, error)
	DeleteSession(id string)
	AddClient(sessionID string, client *Client) error
	RemoveClient(sessionID, clientID string) error
	GetOtherClient(sessionID, clientID string) (*Client, error)
	GetClientIDs(sessionID string) ([]string, error)
	IsFull(sessionID string) (bool, error)
	IsEmpty(sessionID string) (bool, error)
	SetHost(sessionID, clientID string) error
}
