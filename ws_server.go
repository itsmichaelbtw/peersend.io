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

type HttpQuery struct {
	sessionCode string
	mode        string
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

func SpawnServer() *Server {
	return &Server{
		sessions: make(map[string]*Session),
	}
}

func GenerateSessionCode(s *Server, attempt int) string {
	code := make([]byte, sessionCodeLength)
	for i := range code {
		code[i] = sessionCodeChars[rand.Intn(len(sessionCodeChars))]
	}

	if _, exists := s.sessions[string(code)]; exists {
		if attempt >= maxGenerationAttempts {
			panic("Could not generate unique session code")
		}

		return GenerateSessionCode(s, attempt+1)
	}

	return string(code)
}

func ExtractHttpQuery(r *http.Request) *HttpQuery {
	query := r.URL.Query()

	return &HttpQuery{
		sessionCode: query.Get("sessionCode"),
		mode:        query.Get("mode"),
	}
}

func (s *Server) createSession() *Session {
	sessionCode := GenerateSessionCode(s, 0)

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

func (s *Server) resolveSession(sessionCode string) (*Session, error) {
	if sessionCode != "" {
		session := s.getSession(sessionCode)

		if session == nil {
			return nil, fmt.Errorf("no session found with code '%s'", sessionCode)
		}

		if session.isFull() {
			return nil, fmt.Errorf("session is full")
		}

		return session, nil
	}

	return s.createSession(), nil
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
		http.Error(w, "Failed to upgrade connection", http.StatusInternalServerError)
		return
	}

	query := ExtractHttpQuery(r)

	if query.sessionCode == "" && query.mode == "join" {
		message := CreateMessage(ErrorMessageType, ErrorData{
			Message: "A session code must be provided when connecting to the signaling server",
		})
		conn.WriteMessage(websocket.TextMessage, message)
		conn.Close()
		return
	}

	session, err := s.resolveSession(query.sessionCode)
	if err != nil {
		message := CreateMessage(ErrorMessageType, ErrorData{
			Message: err.Error(),
		})
		conn.WriteMessage(websocket.TextMessage, message)
		conn.Close()
		return
	}

	defer func() {
		if session != nil && session.isEmpty() {
			session.cleanup()
		}
	}()

	client := session.createClient(conn)

	message := CreateMessage("session_information", SessionData{
		SessionCode:    session.code,
		ClientID:       client.id,
		IsHost:         client.host,
		Clients:        session.getClientIDs(),
		MaximumClients: maxClients,
	})
	client.message(message)

	go session.broadcastMessage()
	go session.handleClientConnection(client)

	session.syncClients()
}
