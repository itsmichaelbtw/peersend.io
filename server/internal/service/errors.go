package service

import "errors"

// Sentinel errors returned by SessionService methods.
var (
	// ErrOnlyHostCanTransfer is returned by TransferHost when the calling
	// client is not the current session host.
	ErrOnlyHostCanTransfer = errors.New("only the host can transfer host status")

	// ErrNoTargetForHostTransfer is returned by TransferHost when the
	// designated transfer target does not exist in the session.
	ErrNoTargetForHostTransfer = errors.New("no other client available to transfer host status")
)
