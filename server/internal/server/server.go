package server

import (
	"context"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"

	"peersend/internal/broadcast"
	"peersend/internal/config"
	"peersend/internal/domain"
	"peersend/internal/events"
	"peersend/internal/events/handlers"
	"peersend/internal/service"
)

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

	dispatcher.RegisterHandler(domain.MessageInPing, &handlers.PingEventHandler{})
	dispatcher.RegisterHandler(domain.MessageInTransferHost, &handlers.TransferHostEventHandler{})

	return &Server{
		SessionService: sessionService,
		ClientService:  clientService,
		Broadcaster:    broadcaster,
		Dispatcher:     dispatcher,
		Upgrader: &websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		logger: config.WithComponent("server"),
	}
}

func (s *Server) handleConnection(conn *websocket.Conn, r *http.Request) {
	ctx, cancelWs := context.WithCancel(context.Background())
	defer cancelWs()

	query := r.URL.Query()
	sessionCode := query.Get("session_code")
	mode := query.Get("mode")

	s.logger.Info().
		Str("mode", mode).
		Str("session_code", sessionCode).
		Msg("new websocket connection")

	var session *domain.Session
	var err error

	// need to clean up the session is created but errors occur below

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

	client := s.ClientService.NewClient(conn)
	if err := s.SessionService.AddClient(ctx, session.ID, client); err != nil {
		s.logger.Error().
			Err(err).
			Str("session_id", session.ID).
			Str("client_id", client.ID).
			Msg("failed to add client to session")
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(
			websocket.CloseNormalClosure,
			"unable to join session - session may be full",
		))
		conn.Close()
		return
	}

	sessionData, err := s.SessionService.GetSessionData(session.ID, client.ID)
	if err != nil {
		s.logger.Error().
			Err(err).
			Str("session_id", session.ID).
			Str("client_id", client.ID).
			Msg("failed to get session data")
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(
			websocket.CloseNormalClosure,
			"failed to initialize session data",
		))
		conn.Close()
		return
	}

	if err := s.Broadcaster.MessageClient(ctx, client, domain.NewMessage(domain.MessageOutSessionInformation, sessionData)); err != nil {
		s.logger.Error().
			Err(err).
			Str("session_id", session.ID).
			Str("client_id", client.ID).
			Msg("failed to send initial session information to client")
	}

	go s.Broadcaster.Start(ctx, session)

	connection := NewConnection(client, session, s.SessionService, s.Dispatcher, s.Broadcaster)
	connection.Listen(ctx)
}

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

	go s.handleConnection(conn, r)
}
