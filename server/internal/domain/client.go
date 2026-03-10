// Package domain defines the core entities, repository interfaces, and
// event-publishing contracts that form the heart of the peersend signaling
// server. All other packages depend on domain types; domain itself has no
// internal imports.
package domain

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Client represents a single peer connected to the signaling server via
// WebSocket. A client always belongs to exactly one session after it joins.
type Client struct {
	// ID is a unique, server-assigned UUID that identifies the client within
	// its session and across all server messages.
	ID string

	// Conn is the underlying WebSocket connection used to send and receive
	// messages. Writes must be serialised using Mu.
	Conn *websocket.Conn

	// SessionID is the identifier of the session this client has joined.
	// It is empty until AddClient has been called for this client.
	SessionID string

	// Mu serialises concurrent writes to Conn, as the gorilla/websocket
	// library does not support concurrent writers.
	Mu sync.Mutex
}
