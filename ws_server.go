package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Server struct {
	sessions map[string]*Session
	mu       sync.RWMutex
}

const (
	sessionCodeLength     = 6
	sessionCodeChars      = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	maxClients            = 2
	maxGenerationAttempts = 10
)

var wsUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (s *Server) generateSessionCode(attempt int) string {
	code := make([]byte, sessionCodeLength)
	for i := range code {
		code[i] = sessionCodeChars[rand.Intn(len(sessionCodeChars))]
	}
	codeStr := string(code)

	s.mu.RLock()
	_, exists := s.sessions[codeStr]
	s.mu.RUnlock()

	if exists {
		if attempt >= maxGenerationAttempts {
			return ""
		}
		return s.generateSessionCode(attempt + 1)
	}
	return codeStr
}

func (s *Server) createSession() *Session {
	sessionCode := s.generateSessionCode(0)
	if sessionCode == "" {
		return nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	session := Session{
		clients:   make(map[string]*Client),
		broadcast: make(chan []byte),
		server:    s,
		code:      sessionCode,
	}
	s.sessions[sessionCode] = &session

	log.Printf("[%s] session created", sessionCode)
	return &session
}

func (s *Server) getSession(code string) *Session {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.sessions[code]
}

func (s *Server) deleteSession(code string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, code)
}

func (s *Server) resolveSession(sessionCode string) (*Session, error) {
	if sessionCode == "" {
		return s.createSession(), nil
	}

	session := s.getSession(sessionCode)
	if session == nil {
		return nil, fmt.Errorf("no session found with code '%s'", sessionCode)
	}

	if session.isFull() {
		return nil, fmt.Errorf("session is full")
	}

	return session, nil
}

func (s *Server) handleHttpConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	query := ExtractHttpQuery(r)

	if query.sessionCode == "" && query.mode == "join" {
		payload := SerialiseOutgoingData(ErrorMessageType, ErrorData{
			Message: "A session code must be provided when connecting to the signaling server",
		})
		conn.WriteMessage(websocket.TextMessage, payload)
		conn.Close()
		return
	}

	session, err := s.resolveSession(query.sessionCode)
	if err != nil {
		payload := SerialiseOutgoingData(ErrorMessageType, ErrorData{
			Message: err.Error(),
		})
		conn.WriteMessage(websocket.TextMessage, payload)
		conn.Close()
		return
	}

	client := session.createClient(conn)

	client.message(SerialiseOutgoingData("session_information", SessionData{
		SessionCode:    session.code,
		ClientID:       client.id,
		IsHost:         client.host,
		Clients:        make([]string, 0),
		MaximumClients: maxClients,
	}))

	go session.startBroadcastLoop()
	go session.handleClientMessages(client)

	SyncClients(session.getClientIDs(), session.broadcast)
}

func SpawnServer() *Server {
	return &Server{
		sessions: make(map[string]*Session),
	}
}
