package events

import "errors"

// ErrNoHandlerRegistered is returned by Dispatcher.Dispatch when the incoming
// message type has no registered EventHandler. The caller (Connection.Listen)
// treats this as a signal to relay the raw message to the peer rather than
// dropping it.
var ErrNoHandlerRegistered = errors.New("no handler registered for message type")
