package main

import (
	"encoding/json"
	"fmt"
)

type MessageType string

const (
	SessionMessage MessageType = "session"
	SignalMessage  MessageType = "signal"
	ErrorMessage   MessageType = "error"
)

type Message struct {
	Type MessageType    `json:"type"`
	Data map[string]any `json:"data"`
}

func ParseMessage(data []byte) (*Message, error) {
	var msg Message
	if err := json.Unmarshal(data, &msg); err != nil {
		return nil, fmt.Errorf("invalid message format: %v", err)
	}
	return &msg, nil
}

func CreateMessage(msgType MessageType, data map[string]any) []byte {
	msg := Message{
		Type: msgType,
		Data: data,
	}

	bytes, err := json.Marshal(msg)
	if err != nil {
		return []byte(`{"type":"error","data":{"message":"Internal server error"}}`)
	}

	return bytes
}

func NewErrorMessage(errMsg string) []byte {
	return CreateMessage(ErrorMessage, map[string]any{
		"message": errMsg,
	})
}
