package repository

import "errors"

var (
	ErrSessionNotFound = errors.New("session not found")
	ErrSessionFull     = errors.New("session is full")
	ErrNoOtherClient   = errors.New("no other client found")
	ErrClientNotFound  = errors.New("client not found in session")
)
