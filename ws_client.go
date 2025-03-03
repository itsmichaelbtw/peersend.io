package main

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
	host bool
}

// Returns the memory address of the connection
// which is used as the connection ID
func (u *Client) getConnectionID() string {
	return fmt.Sprintf("%p", u.conn)
}

func (u *Client) message(message []byte) {
	u.conn.WriteMessage(websocket.TextMessage, message)
}

// func (u *Client) disconnect() {}
