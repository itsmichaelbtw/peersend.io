package events

import "errors"

var ErrNoHandlerRegistered = errors.New("no handler registered for message type")
