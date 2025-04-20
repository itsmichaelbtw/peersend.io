package main

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type SessionMessageChannel = chan Message[any]

type Session struct {
	clients   map[string]*Client
	broadcast SessionMessageChannel
	mu        sync.RWMutex
	server    *Server
	code      string
}

func (s *Session) handleClientMessages(client *Client) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[%s] [%s] panic in handleClientMessages: %v", s.code, client.id, r)
		}
		s.disconnectClient(client)
	}()

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			break
		}

		parsedMsg, err := ParseIncomingData(message)
		if err != nil {
			log.Printf("[%s] [%s] invalid message format: %v", s.code, client.id, err)
			client.message(Message[ErrorData]{
				Type: ErrorMessageType,
				Data: ErrorData{
					Message: "invalid message format",
				},
			})
			continue
		}

		if parsedMsg.Type == "ping" {
			EchoLatencyTimestamp(client, message)
			continue
		}

		otherClient := s.getOtherClient(client)

		if otherClient == nil {
			continue
		}

		if err := otherClient.message(parsedMsg); err != nil {
			s.disconnectClient(otherClient)
			continue
		}
	}
}

func (s *Session) startBroadcastLoop() {
	for message := range s.broadcast {
		clientsCopy := s.copyClients()

		for _, client := range clientsCopy {
			if err := client.message(message); err != nil {
				go s.disconnectClient(client)
			}
		}
	}
}

func (s *Session) addClient(client *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.clients[client.id] = client
	log.Printf("[%s] [%s] client added", s.code, client.id)
}

func (s *Session) deleteClient(client *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.clients, client.id)
}

func (s *Session) createClient(conn *websocket.Conn) *Client {
	client := Client{
		id:      GenerateClientID(),
		conn:    conn,
		host:    s.isEmpty(),
		session: s,
	}

	s.addClient(&client)

	return &client
}

func (s *Session) disconnectClient(client *Client) {
	if client == nil {
		return
	}

	if client.host {
		otherClient := s.getOtherClient(client)
		if otherClient != nil {
			if err := TransferSessionHost(client, otherClient); err != nil {
				log.Printf("[%s] [%s] failed to transfer host: %v", s.code, client.id, err)
			}
		}
	}

	client.close()
	s.deleteClient(client)

	log.Printf("[%s] [%s] client disconnected", s.code, client.id)

	BroadcastClientSync(s.getClientIDs(), s.broadcast)

	go s.cleanup()
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

func (s *Session) getOtherClient(client *Client) *Client {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, otherClient := range s.clients {
		if otherClient.id != client.id {
			return otherClient
		}
	}

	return nil
}

func (s *Session) copyClients() []*Client {
	s.mu.RLock()
	defer s.mu.RUnlock()

	clientsCopy := make([]*Client, 0, len(s.clients))
	for _, client := range s.clients {
		clientsCopy = append(clientsCopy, client)
	}

	return clientsCopy
}

func (s *Session) isEmpty() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return len(s.clients) == 0
}

func (s *Session) isFull() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return len(s.clients) >= maxClients
}

func (s *Session) cleanup() {
	if !s.isEmpty() {
		return
	}

	clientsCopy := s.copyClients()

	for _, client := range clientsCopy {
		client.close()
	}

	close(s.broadcast)
	s.server.deleteSession(s.code)
	log.Printf("[%s] session destroyed as the last client has disconnected", s.code)
}
