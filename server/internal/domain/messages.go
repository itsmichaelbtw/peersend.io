package domain

const (
	WebSocketConnectionType string = "websocket"
	ErrorMessageType        string = "error"

	MessageOutSessionInformation string = "session_information"
	MessageOutHostTransferred    string = "host_transferred"
	MessageOutSyncClients        string = "sync_clients"
	MessageOutPong               string = "pong"

	MessageInPing         string = "ping"
	MessageInTransferHost string = "transfer_host"
)

type Message[T any] struct {
	Type string `json:"type"`
	Data T      `json:"data"`
}

type SessionData struct {
	SessionCode    string `json:"session_code"`
	ClientID       string `json:"client_id"`
	MaximumClients int    `json:"maximum_clients"`
	ConnectionType string `json:"connection_type"`
	EncryptionMode string `json:"encryption_mode"`
	AutoWebRTC     bool   `json:"auto_webrtc"`
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
	MaximumClients int    `json:"maximum_clients"`
	SessionCode    string `json:"session_code"`
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
