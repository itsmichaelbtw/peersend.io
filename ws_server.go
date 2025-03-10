package main

import (
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

func generateSessionCode(s *Server, attempt int) string {
	code := make([]byte, sessionCodeLength)
	for i := range code {
		code[i] = sessionCodeChars[rand.Intn(len(sessionCodeChars))]
	}

	if _, exists := s.sessions[string(code)]; exists {
		if attempt >= maxGenerationAttempts {
			panic("Could not generate unique session code")
		}

		return generateSessionCode(s, attempt+1)
	}

	return string(code)
}

func SpawnServer() *Server {
	return &Server{
		sessions: make(map[string]*Session),
	}
}

func (s *Server) createSession() (*Session, string) {
	sessionCode := generateSessionCode(s, 0)

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

	return &session, sessionCode
}

func (s *Server) getSession(code string) *Session {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.sessions[code]
}

func (s *Server) handleConnection(w http.ResponseWriter, r *http.Request) {
	sessionCode := r.URL.Query().Get("sessionCode")

	var session *Session

	if sessionCode != "" {
		session = s.getSession(sessionCode)

		if session == nil {
			http.Error(w, "Session not found", http.StatusNotFound)
			return
		}
	} else {
		session, sessionCode = s.createSession()
	}

	if len(session.clients) >= maxClients {
		http.Error(w, "Session is full", http.StatusForbidden)
		return
	}

	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic in handleConnection: %v", r)
		}
	}()

	defer func() {
		if session.isEmpty() {
			session.cleanup()
		}
	}()

	client, err := session.connectClient(w, r)
	if err != nil {
		if _, ok := err.(*websocket.HandshakeError); ok {
			http.Error(w, "Could not upgrade to WebSocket connection", http.StatusBadRequest)
		}
		log.Printf("Error connecting client: %v", err)
		return
	}

	message := CreateMessage(SessionMessage, map[string]any{
		"code":      sessionCode,
		"client_id": client.getConnectionID(),
		"is_host":   client.host,
	})
	client.message(message)

	go session.broadcastMessage()
	session.handleClient(client)
}
