package server

import "errors"

var (
	ErrInvalidMode            = errors.New("invalid mode")
	ErrHandleConnectionFailed = errors.New("could not create or find session")
)
