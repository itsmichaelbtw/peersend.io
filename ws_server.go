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
	sessionCodePrefix     = "X-"
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
	codeStr := sessionCodePrefix + string(code)

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

func (s *Server) establishConnectionSession(conn *websocket.Conn, query HttpQuery) *Session {
	closeWithMessage := func(code int, reason string) *Session {
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(code, reason))
		return nil
	}

	switch query.mode {
	case "host":
		session := s.createSession()
		if session == nil {
			return closeWithMessage(websocket.CloseInternalServerErr, "connection: failed to create session")
		}
		return session

	case "join":
		if query.sessionCode == "" {
			return closeWithMessage(websocket.CloseInvalidFramePayloadData, "connection: session code is required")
		}

		session := s.getSession(query.sessionCode)
		if session == nil {
			return closeWithMessage(websocket.CloseInvalidFramePayloadData, "connection: session not found")
		}

		return session

	default:
		return closeWithMessage(websocket.CloseUnsupportedData, "connection: invalid mode")
	}
}

func (s *Server) handleHttpConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	query := ExtractHttpQuery(r)
	session := s.establishConnectionSession(conn, query)
	if session == nil {
		return
	}

	if session.isFull() {
		payload := SerialiseOutgoingData("session_full", SessionFullData{
			SessionCode:    session.code,
			MaximumClients: maxClients,
		})

		conn.WriteMessage(websocket.TextMessage, payload)
		conn.WriteMessage(websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseNormalClosure, "connection: session is full"),
		)
		conn.Close()
		return
	}

	client := session.createClient(conn)

	client.message(SerialiseOutgoingData("session_information", SessionData{
		SessionCode:    session.code,
		ClientID:       client.id,
		MaximumClients: maxClients,
		HostTransferData: HostTransferData{
			IsHost: client.host,
		},
		SyncClientsData: SyncClientsData{
			Clients: session.getClientIDs(),
		},
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
