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
		if r := recover(); r != nil {
			log.Printf("[%s] [%s] panic in handleClientConnection: %v", s.code, client.id, r)
		}
		s.disconnectClient(client)
		s.syncClients()
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
				if err := s.transferSessionHost(client, true); err != nil {
					client.message(NewErrorMessage(err.Error()))
				}
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

	if client.host && !s.isEmpty() {
		s.mu.Unlock()
		if err := s.transferSessionHost(client, false); err != nil {
			log.Printf("[%s] [%s] failed to transfer host: %v", s.code, client.id, err)
		}
	} else {
		s.mu.Unlock()
	}

	s.deleteClient(client)
	log.Printf("[%s] [%s] client disconnected", s.code, client.id)
}

func (s *Session) deleteClient(client *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !client.closed {
		client.close()
	}

	delete(s.clients, client.id)
}

func (s *Session) getClientIDs() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids := make([]string, 0, len(s.clients))
	for id := range s.clients {
		ids = append(ids, id)
	}

	return ids
}

func (s *Session) transferSessionHost(fromClient *Client, notifyPrevious bool) error {
	defer s.mu.Unlock()
	s.mu.Lock()

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

func (s *Session) syncClients() {
	message := CreateMessage(SignalMessage, map[string]any{
		"type":    "sync_session_clients",
		"clients": s.getClientIDs(),
	})

	s.broadcast <- message
}

func (s *Session) sliceClients() []*Client {
	s.mu.RLock()
	defer s.mu.RUnlock()

	clientsCopy := make([]*Client, 0, len(s.clients))
	for _, client := range s.clients {
		clientsCopy = append(clientsCopy, client)
	}

	return clientsCopy
}

func (s *Session) broadcastMessage() {
	for message := range s.broadcast {
		clientsCopy := s.sliceClients()

		for _, client := range clientsCopy {
			if err := client.message(message); err != nil {
				go s.disconnectClient(client)
			}
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
	clientsCopy := s.sliceClients()

	for _, client := range clientsCopy {
		client.close()
	}

	close(s.broadcast)

	s.server.mu.Lock()
	delete(s.server.sessions, s.code)
	s.server.mu.Unlock()

	log.Printf("[%s] session destroyed", s.code)
}
