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

var wsUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

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
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic in handleConnection: %v", r)
		}
	}()

	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	sessionCode := r.URL.Query().Get("sessionCode")

	var session *Session

	defer func() {
		if session != nil && session.isEmpty() {
			session.cleanup()
		}
	}()

	if sessionCode != "" {
		session = s.getSession(sessionCode)

		var errorMsg []byte

		if session == nil {
			errorMsg = NewErrorMessage("Session not found")
		} else if session.isFull() {
			errorMsg = NewErrorMessage("Session is full")
		}

		if errorMsg != nil {
			conn.WriteMessage(websocket.TextMessage, errorMsg)
			conn.Close()
			return
		}
	} else {
		session, sessionCode = s.createSession()
	}

	client := session.createClient(conn)
	client.sendSessionInformation(sessionCode)

	go session.broadcastMessage()
	session.handleClientConnection(client)
}
