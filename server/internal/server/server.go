// Package server handles WebSocket connection upgrades and per-connection
// lifecycle management for the peersend signaling server. It owns the
// gorilla/websocket Upgrader, creates or retrieves sessions, registers clients,
// and starts the per-connection message loop. Panics in connection goroutines
// are caught and logged so a single misbehaving client cannot crash the server.
package server

import (
	"context"
	"net/http"
	"runtime/debug"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"

	"peersend/internal/broadcast"
	"peersend/internal/config"
	"peersend/internal/domain"
	"peersend/internal/events"
	"peersend/internal/events/handlers"
	"peersend/internal/service"
)

// Server upgrades HTTP requests to WebSocket connections and manages the full
// lifecycle of each connected peer. It owns a Dispatcher pre-loaded with all
// recognised inbound message handlers, and an Upgrader configured to accept
// connections from any origin.
type Server struct {
	SessionService *service.SessionService
	ClientService  *service.ClientService
	Broadcaster    *broadcast.Broadcaster
	Dispatcher     *events.Dispatcher
	Upgrader       *websocket.Upgrader
	logger         zerolog.Logger
}

func NewServer(sessionService *service.SessionService, clientService *service.ClientService, broadcaster *broadcast.Broadcaster) *Server {
	eventContext := events.EventContext{
		SessionService: sessionService,
		ClientService:  clientService,
		Broadcaster:    broadcaster,
	}
	dispatcher := events.NewDispatcher(&eventContext)

	dispatcher.RegisterHandler(domain.MessageInPing, handlers.NewPingEventHandler())
	dispatcher.RegisterHandler(domain.MessageInTransferHost, handlers.NewTransferHostEventHandler())

	return &Server{
		SessionService: sessionService,
		ClientService:  clientService,
		Broadcaster:    broadcaster,
		Dispatcher:     dispatcher,
		Upgrader: &websocket.Upgrader{
			// add origin here for production
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		logger: config.WithLogComponent("server"),
	}
}

// handleConnection is the core per-connection handler. It reads the "mode" and
// "session_code" query parameters to determine whether the peer is creating a
// new session ("host") or joining an existing one ("join"). After session
// resolution, it registers the client, sends the initial session_information
// message, then delegates to Connection.Listen for the message loop.
//
// Any error before the message loop starts causes a WebSocket close frame to
// be sent and the connection to be shut down. A deferred cleanup guard ensures
// that partially-created sessions or clients are removed from the repository if
// the message loop never starts (e.g. on error or panic).
func (s *Server) handleConnection(conn *websocket.Conn, r *http.Request) {
	ctx, cancelWs := context.WithCancel(context.Background())
	defer cancelWs()

	query := r.URL.Query()
	sessionCode := query.Get("session_code")
	mode := query.Get("mode")

	s.logger.Info().Str("mode", mode).Str("session_code", sessionCode).Msg("new websocket connection")

	var err error
	var session *domain.Session
	var client *domain.Client
	var clientAdded bool
	var listenStarted bool

	// Cleanup guard: if Listen never starts, remove any partially-registered
	// client and empty sessions so the repository does not accumulate orphans.
	defer func() {
		if listenStarted {
			return
		}
		if session != nil && clientAdded {
			if err := s.SessionService.RemoveClient(ctx, session.ID, client.ID); err != nil {
				s.logger.Warn().Err(err).Str("session_id", session.ID).Str("client_id", client.ID).Msg("pre-listen cleanup: failed to remove client")
			}
		} else if mode == "host" && session != nil {
			if err := s.SessionService.CleanupSession(ctx, session.ID); err != nil {
				s.logger.Warn().Err(err).Str("session_id", session.ID).Msg("pre-listen cleanup: failed to destroy empty session")
			}
		}
	}()

	switch mode {
	case "host":
		session, err = s.SessionService.CreateSession()
		if err != nil {
			s.logger.Error().Err(err).Msg("failed to create new session for host")
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "failed to create new session"))
			conn.Close()
			return
		}
	case "join":
		session, err = s.SessionService.GetSession(sessionCode)
		if err != nil {
			s.logger.Error().Err(err).Str("session_code", sessionCode).Msg("failed to find session for join request")
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "session not found or no longer available"))
			conn.Close()
			return
		}
	default:
		s.logger.Error().Str("mode", mode).Msg("invalid connection mode specified")
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "invalid mode - must be 'host' or 'join'"))
		conn.Close()
		return
	}

	if session == nil {
		s.logger.Error().Msg("session is nil after creation/retrieval")
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "internal server error"))
		conn.Close()
		return
	}

	client = s.ClientService.NewClient(conn)
	if err := s.SessionService.AddClient(ctx, session.ID, client); err != nil {
		s.logger.Error().Err(err).Str("session_id", session.ID).Str("client_id", client.ID).Msg("failed to add client to session")
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(
			websocket.CloseNormalClosure,
			"unable to join session - session may be full",
		))
		conn.Close()
		return
	}
	clientAdded = true

	sessionData, err := s.SessionService.GetSessionData(session.ID, client.ID)
	if err != nil {
		s.logger.Error().Err(err).Str("session_id", session.ID).Str("client_id", client.ID).Msg("failed to get session data")
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(
			websocket.CloseNormalClosure,
			"failed to initialize session data",
		))
		conn.Close()
		return
	}

	if err := s.Broadcaster.MessageClient(ctx, client, domain.NewMessage(domain.MessageOutSessionInformation, sessionData)); err != nil {
		s.logger.Error().Err(err).Str("session_id", session.ID).Str("client_id", client.ID).Msg("failed to send initial session information to client")
	}

	connection := NewConnection(client, session, s.SessionService, s.Dispatcher, s.Broadcaster)
	listenStarted = true
	connection.Listen(ctx)
}

// ServeWebSocket validates that the incoming request is a WebSocket upgrade,
// performs the upgrade, and dispatches handleConnection in a new goroutine.
// A deferred panic recovery in the goroutine ensures that handler panics are
// logged and the connection is closed cleanly without crashing the server.
func (s *Server) ServeWebSocket(w http.ResponseWriter, r *http.Request) {
	if !websocket.IsWebSocketUpgrade(r) {
		w.WriteHeader(http.StatusUpgradeRequired)
		return
	}

	conn, err := s.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		s.logger.Warn().Err(err).Msg("websocket upgrade failed")
		return
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				stack := debug.Stack()
				s.logger.Error().Interface("panic", r).Str("stack", string(stack)).Msg("websocket handler or broadcaster panic recovered - attempting cleanup")

				if err := conn.Close(); err != nil {
					s.logger.Error().Err(err).Msg("failed to close connection after panic")
				}
			}
		}()
		s.handleConnection(conn, r)
	}()
}
