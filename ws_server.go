package main

import (
	"math/rand"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Server struct {
  sessions map[string]*Session
  lock sync.RWMutex
}

const (
	sessionCodeLength = 6
	sessionCodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  maxClients = 2
  maxGenerationAttempts = 10
)

var wsUpgrader = websocket.Upgrader{
  CheckOrigin: func(r *http.Request) bool {
    return true
  },
}

var server = Server{
  sessions: make(map[string]*Session),
}

func generateSessionCode(attempt int) string {
	code := make([]byte, sessionCodeLength)
	for i := range code {
		code[i] = sessionCodeChars[rand.Intn(len(sessionCodeChars))]
	}

  if _, exists := server.sessions[string(code)]; exists {
    if attempt >= maxGenerationAttempts {
      panic("Could not generate unique session code")
    }

    return generateSessionCode(attempt + 1)
  }

	return string(code)
}

func (s *Server) createSession() *Session {
  sessionCode := generateSessionCode(0)

  s.lock.Lock()
  defer s.lock.Unlock()

  session := Session{
    clients: make(map[string]*Client),
    broadcast: make(chan []byte),
  }

  s.sessions[sessionCode] = &session

  return &session
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

  sessionCode := r.URL.Query().Get("session")

  conn, err := wsUpgrader.Upgrade(w, r, nil)
  if err != nil {
    http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
    return
  }

  var session *Session

  if sessionCode != "" {
    session = s.getSession(sessionCode)

    if session == nil {
      http.Error(w, "Session not found", http.StatusNotFound)
      return
    }
  } else {
    session = s.createSession()
  }

  if len(session.clients) >= maxClients {
    http.Error(w, "Session is full", http.StatusForbidden)
    return
  }

  client := session.connectClient(conn)

  go session.broadcastMessage()
  session.handleClient(client)
}



