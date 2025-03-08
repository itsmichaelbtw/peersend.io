package main

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Session struct {
  clients map[string]*Client
  broadcast chan []byte
  lock sync.RWMutex
}

var wsUpgrader = websocket.Upgrader{
  CheckOrigin: func(r *http.Request) bool {
    return true
  },
}

func (s *Session) connectClient(w http.ResponseWriter, r *http.Request) (*Client, error) {
	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		return nil, fmt.Errorf("could not upgrade to WebSocket connection: %v", err)
	}

	client := Client{
		conn: conn,
		host: len(s.clients) == 0,
	}

	s.lock.Lock()
	defer s.lock.Unlock()

	id := client.getConnectionID()
	s.clients[id] = &client

	return &client, nil
}

func (s *Session) disconnectClient(client *Client) {
	s.lock.Lock()
	defer s.lock.Unlock()
		
	if client.host {
		// transfer host to another client
		for _, client := range s.clients {
			if !client.host {
				client.host = true
				client.message([]byte("You are now the host"))
				break
			}
		}
	}

	client.conn.Close()
	delete(s.clients, client.getConnectionID())
}

func (s *Session) broadcastMessage() {
	for message := range s.broadcast {
		s.lock.Lock()

		for _, client := range s.clients {
			client.message(message)
		}

		s.lock.Unlock()
	}
}

func (s *Session) handleClient(client *Client) {
	defer func() {
		s.disconnectClient(client)
	}()

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			break
		}

		s.broadcast <- message
	}
}
