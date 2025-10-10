package service

import "errors"

var (
	ErrOnlyHostCanTransfer     = errors.New("only the host can transfer host status")
	ErrNoTargetForHostTransfer = errors.New("no other client available to transfer host status")
)
