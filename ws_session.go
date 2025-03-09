package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Session struct {
	clients   map[string]*Client
	broadcast chan []byte
	lock      sync.RWMutex
	server    *Server
	code      string
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

	s.lock.Lock()
	defer s.lock.Unlock()

	clientID := GenerateClientID()
	client := Client{
		id:      clientID,
		conn:    conn,
		host:    s.isEmpty(),
		session: s,
	}

	s.clients[clientID] = &client
	log.Printf("[%s] [%s] client connected", s.code, clientID)

	return &client, nil
}

func (s *Session) disconnectClient(client *Client) {
	s.lock.Lock()
	defer s.lock.Unlock()

	if client.host && !s.isEmpty() {
		// transfer host role to another
		// client if available
		for _, otherClient := range s.clients {
			if !otherClient.host {
				otherClient.host = true
				message := CreateMessage(SignalMessage, map[string]any{"type": "host_transfer"})
				otherClient.message(message)
				log.Printf("[%s] [%s] host transferred from [%s]", s.code, otherClient.id, client.id)
				break
			}
		}
	}

	client.close()
	delete(s.clients, client.getConnectionID())
	log.Printf("[%s] [%s] client disconnected", s.code, client.id)

	if s.isEmpty() {
		s.cleanup()
	}
}

func (s *Session) broadcastMessage() {
	for message := range s.broadcast {
		s.lock.RLock()
		failedClients := make([]*Client, 0)

		for _, client := range s.clients {
			if err := client.message(message); err != nil {
				failedClients = append(failedClients, client)
			}
		}
		s.lock.RUnlock()

		for _, client := range failedClients {
			s.disconnectClient(client)
		}
	}
}

func (s *Session) isEmpty() bool {
	return len(s.clients) == 0
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

		if _, err := ParseMessage(message); err != nil {
			errorMessage := CreateMessage(ErrorMessage, map[string]any{"error": err.Error()})
			client.message(errorMessage)
			continue
		}

		s.broadcast <- message
	}
}

func (s *Session) cleanup() {
	close(s.broadcast)
	s.server.lock.Lock()
	delete(s.server.sessions, s.code)
	s.server.lock.Unlock()
	log.Printf("[%s] session destroyed", s.code)
}
