package events

import "errors"

var ErrNoHandlerRegistered = errors.New("no handler reigstered for message type")
