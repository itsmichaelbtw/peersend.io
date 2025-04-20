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

func (c *Client) message(data any) error {
	if c.closed {
		return fmt.Errorf("connection closed")
	}

	if err := c.conn.WriteJSON(data); err != nil {
		c.conn.WriteJSON(Message[ErrorData]{
			Type: ErrorMessageType,
			Data: ErrorData{
				Message: "The server tried to broadcast a message, but failed",
			},
		})

		return fmt.Errorf("failed to send message: %v", err.Error())
	}

	return nil
}

func (c *Client) close() {
	if !c.closed {
		c.closed = true
		c.conn.Close()
	}
}
