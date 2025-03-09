package main

import (
	"log"
	"math/rand"
	"net/http"
	"sync"
)

type Server struct {
	sessions map[string]*Session
	lock     sync.RWMutex
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

	s.lock.Lock()
	defer s.lock.Unlock()

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
	s.lock.RLock()
	defer s.lock.RUnlock()

	return s.sessions[code]
}

func (s *Server) handleConnection(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			http.Error(w, "Failed to establish connection", http.StatusInternalServerError)
		}
	}()

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

	if client, err := session.connectClient(w, r); err != nil {
		http.Error(w, "Could not connect to session", http.StatusInternalServerError)
	} else {
		message := CreateMessage(SessionMessage, map[string]any{
			"code":      sessionCode,
			"client_id": client.getConnectionID(),
			"is_host":   client.host,
		})
		client.message(message)

		go session.broadcastMessage()
		session.handleClient(client)
	}
}
