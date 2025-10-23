package domain

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID        string
	Conn      *websocket.Conn
	SessionID string
	Mu        sync.Mutex
}
