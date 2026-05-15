package domain

const (
	// WebSocketConnectionType identifies a WebSocket-based P2P connection in
	// session information payloads.
	WebSocketConnectionType string = "websocket"

	// ErrorMessageType is the message type used when the server sends an
	// error to a client.
	ErrorMessageType string = "error"

	// MessageOutSessionInformation is sent to a client immediately after it
	// joins a session, containing its assigned client ID, session code, and
	// server capabilities.
	MessageOutSessionInformation string = "session_information"

	// MessageOutHostTransferred is broadcast to all clients when the session
	// host changes, carrying the new host's client ID.
	MessageOutHostTransferred string = "host_transferred"

	// MessageOutSyncClients is broadcast to all clients whenever the roster
	// changes (join or leave), carrying the current list of client IDs.
	MessageOutSyncClients string = "sync_clients"

	// MessageOutPong is sent to the originating client in response to a ping,
	// echoing the client timestamp alongside a server timestamp.
	MessageOutPong string = "pong"

	// MessageInPing is sent by a client to measure round-trip latency. The
	// server replies with a MessageOutPong containing both timestamps.
	MessageInPing string = "ping"

	// MessageInTransferHost is sent by the current host to transfer host
	// privileges to the other peer in the session.
	MessageInTransferHost string = "transfer_host"
)

// Message is a generic JSON envelope used for all WebSocket communication
// between the server and its clients. T is the type of the Data payload.
type Message[T any] struct {
	// Type identifies the message kind and determines how the recipient
	// interprets the Data field. Must be one of the MessageIn*/MessageOut*
	// or ErrorMessageType constants.
	Type string `json:"type"`

	// Data is the message payload. Its structure depends on Type.
	Data T `json:"data"`
}

type SessionData struct {
	SessionCode string `json:"session_code"`

	ClientID string `json:"client_id"`

	// configured via server settings.
	MaximumClients int `json:"maximum_clients"`

	ConnectionType string `json:"connection_type"`

	// configured via server settings.
	EncryptionMode string `json:"encryption_mode"`

	// configured via server settings.
	FileTransferCapacity int `json:"file_transfer_capacity"`

	// configured via server settings.
	AutoWebRTC bool `json:"auto_webrtc"`

	HostTransferData

	SyncClientsData
}

type SyncClientsData struct {
	Clients []string `json:"clients"`
}

type HostTransferData struct {
	HostID string `json:"host_id"`
}

type ErrorData struct {
	Message string `json:"message"`
}

type SessionFullData struct {
	MaximumClients int `json:"maximum_clients"`

	SessionCode string `json:"session_code"`
}

type PingData struct {
	ClientTimestamp int64 `json:"client_timestamp"`
}

type PongData struct {
	ServerTimestamp int64 `json:"server_timestamp"`

	PingData
}

func NewMessage[T any](messageType string, data T) Message[T] {
	return Message[T]{
		Type: messageType,
		Data: data,
	}
}
