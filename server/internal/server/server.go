package server

import (
	"context"
	"log"
	"net/http"

	"peersend/internal/broadcast"
	"peersend/internal/domain"
	"peersend/internal/events"
	"peersend/internal/events/handlers"
	"peersend/internal/service"

	"github.com/gorilla/websocket"
)

type Server struct {
	SessionService *service.SessionService
	ClientService  *service.ClientService
	Broadcaster    *broadcast.Broadcaster
	Dispatcher     *events.Dispatcher
	Upgrader       *websocket.Upgrader
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
	}
}

func (s *Server) handleConnection(conn *websocket.Conn, r *http.Request) {
	ctx, cancelWs := context.WithCancel(context.Background())
	defer cancelWs()

	query := r.URL.Query()
	sessionCode := query.Get("session_code")
	mode := query.Get("mode")

	log.Printf("new websocket connection, mode: %s, session_code: %s", mode, sessionCode)

	var session *domain.Session
	var err error

	switch mode {
	case "host":
		session, err = s.SessionService.CreateSession()
	case "join":
		session, err = s.SessionService.GetSession(sessionCode)
	default:
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "invalid mode"))
		conn.Close()
		return
	}

	if err != nil || session == nil {
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "could not create or find session"))
		conn.Close()
		return
	}

	client := s.ClientService.NewClient(conn)
	if err := s.SessionService.AddClient(ctx, session.ID, client); err != nil {
		conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, err.Error()))
		conn.Close()
		return
	}

	sessionData, _ := s.SessionService.GetSessionData(session.ID, client.ID)
	if err := s.Broadcaster.MessageClient(ctx, client, domain.NewMessage(domain.MessageOutSessionInformation, sessionData)); err != nil {
		log.Printf("failed to send session information: %v", err)
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
		log.Printf("websocket upgrade failed: %v", err)
		return
	}

	go s.handleConnection(conn, r)
}
