package main

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	id      string
	conn    *websocket.Conn
	host    bool
	session *Session
	closed  bool
}

func GenerateClientID() string {
	return uuid.New().String()
}

func (c *Client) message(message []byte) error {
	if c.closed {
		return fmt.Errorf("connection closed")
	}

	return c.conn.WriteMessage(websocket.TextMessage, message)
}

func (c *Client) close() {
	if !c.closed {
		c.closed = true
		c.conn.Close()
	}
}

func (c *Client) sendSessionInformation(code string) {
	message := CreateMessage(SessionMessage, map[string]any{
		"code":      code,
		"client_id": c.id,
		"is_host":   c.host,
	})

	c.message(message)
}

// func (u *Client) disconnect() {}
