package main

import (
	"encoding/json"
	"fmt"
)

type PayloadType string

const (
	ErrorMessageType PayloadType = "error"
)

type Message[T any] struct {
	Type PayloadType `json:"type"`
	Data T           `json:"data"`
}

type SessionData struct {
	SessionCode    string   `json:"session_code"`
	ClientID       string   `json:"client_id"`
	IsHost         bool     `json:"is_host"`
	Clients        []string `json:"clients"`
	MaximumClients int      `json:"maximum_clients"`
}

type SignalData struct {
	IsHost bool `json:"is_host"`
}

type SyncClientsData struct {
	Clients []string `json:"clients"`
}

type HostTransferData struct {
	IsHost bool `json:"is_host"`
}

type ErrorData struct {
	Message string `json:"message"`
}

func ParseIncomingData(data []byte) (*Message[map[string]any], error) {
	var msg Message[map[string]any]
	if err := json.Unmarshal(data, &msg); err != nil {
		return nil, fmt.Errorf("invalid message format: %v", err)
	}
	return &msg, nil
}

func SerialiseOutgoingData[T any](msgType PayloadType, data T) []byte {
	msg := Message[T]{
		Type: msgType,
		Data: data,
	}

	bytes, err := json.Marshal(msg)
	if err != nil {
		return []byte(`{"type":"error","data":{"message":"Internal server error"}}`)
	}

	return bytes
}
