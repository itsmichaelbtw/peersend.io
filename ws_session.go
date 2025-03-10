package main

import (
	"fmt"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Session struct {
	clients   map[string]*Client
	broadcast chan []byte
	mu        sync.RWMutex
	server    *Server
	code      string
}

func (s *Session) handleClientConnection(client *Client) {
	defer func() {
		s.disconnectClient(client)
	}()

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			break
		}

		msg, err := ParseMessage(message)
		if err != nil {
			client.message(NewErrorMessage(err.Error()))
			continue
		}

		if msg.Type == SignalMessage {
			switch msg.Data["type"] {
			case "transfer_host_request":
				s.mu.Lock()
				if err := s.transferSessionHost(client, true); err != nil {
					client.message(NewErrorMessage(err.Error()))
				}
				s.mu.Unlock()
				continue
			}
		}

		s.broadcast <- message
	}
}

func (s *Session) createClient(conn *websocket.Conn) *Client {
	s.mu.Lock()
	defer s.mu.Unlock()

	clientID := GenerateClientID()
	client := Client{
		id:      clientID,
		conn:    conn,
		host:    s.isEmpty(),
		session: s,
	}

	s.clients[clientID] = &client
	log.Printf("[%s] [%s] client connected", s.code, clientID)

	return &client
}

func (s *Session) disconnectClient(client *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if client.host && !s.isEmpty() {
		if err := s.transferSessionHost(client, false); err != nil {
			log.Printf("[%s] [%s] failed to transfer host: %v", s.code, client.id, err)
		}
	}

	s.deleteClient(client)
	log.Printf("[%s] [%s] client disconnected", s.code, client.id)
}

func (s *Session) deleteClient(client *Client) {
	if !client.closed {
		client.close()
	}

	delete(s.clients, client.id)
}

func (s *Session) transferSessionHost(fromClient *Client, notifyPrevious bool) error {
	if !fromClient.host {
		return fmt.Errorf("only host can transfer host status")
	}

	var newHost *Client
	for _, otherClient := range s.clients {
		if !otherClient.host && otherClient.id != fromClient.id && !otherClient.closed {
			newHost = otherClient
			break
		}
	}

	if newHost == nil {
		return fmt.Errorf("no other clients available to transfer host to")
	}

	fromClient.host = false
	newHost.host = true

	if notifyPrevious && !fromClient.closed {
		hostTransferMsg := CreateMessage(SignalMessage, map[string]any{
			"type":    "host_transfer_granted",
			"is_host": false,
		})
		fromClient.message(hostTransferMsg)
	}

	newHostMsg := CreateMessage(SignalMessage, map[string]any{
		"type":    "host_transfer_granted",
		"is_host": true,
	})
	newHost.message(newHostMsg)

	log.Printf("[%s] [%s] host transferred from [%s]", s.code, newHost.id, fromClient.id)
	return nil
}

func (s *Session) broadcastMessage() {
	for message := range s.broadcast {
		failedClients := make([]*Client, 0)

		s.mu.RLock()
		for _, client := range s.clients {
			if err := client.message(message); err != nil {
				failedClients = append(failedClients, client)
			}
		}
		s.mu.RUnlock()

		for _, client := range failedClients {
			s.disconnectClient(client)
		}
	}
}

func (s *Session) isEmpty() bool {
	return len(s.clients) == 0
}

func (s *Session) isFull() bool {
	return len(s.clients) >= maxClients
}

func (s *Session) cleanup() {
	close(s.broadcast)
	s.server.mu.Lock()
	defer s.server.mu.Unlock()

	log.Printf("[%s] session destroyed", s.code)

	for _, client := range s.clients {
		s.deleteClient(client)
	}

	delete(s.server.sessions, s.code)
}
