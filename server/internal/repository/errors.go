package repository

import "errors"

// Sentinel errors returned by InMemorySessionRepo methods. Callers can use
// errors.Is to distinguish failure causes.
var (
	// ErrSessionNotFound is returned when a session lookup finds no matching
	// session for the given ID.
	ErrSessionNotFound = errors.New("session not found")

	// ErrSessionFull is returned by AddClient when the target session has
	// already reached its configured maximum client count.
	ErrSessionFull = errors.New("session is full")

	// ErrNoOtherClient is returned by GetOtherClient when the session
	// contains no client other than the one specified.
	ErrNoOtherClient = errors.New("no other client found")

	// ErrClientNotFound is returned when a client lookup within a session
	// finds no matching client for the given ID.
	ErrClientNotFound = errors.New("client not found in session")
)
