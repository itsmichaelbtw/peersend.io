package server

import "errors"

// Sentinel errors used by the server layer.
var (
	// ErrInvalidMode is returned when a connection request specifies a mode
	// other than "host" or "join".
	ErrInvalidMode = errors.New("invalid mode")

	// ErrHandleConnectionFailed is returned when a session cannot be created
	// or located for an incoming connection.
	ErrHandleConnectionFailed = errors.New("could not create or find session")
)
