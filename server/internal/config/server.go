package config

type ServerConfig struct {
	// SessionCodeLength is the number of random characters appended to
	// SessionCodePrefix when generating a new session code.
	SessionCodeLength int `yaml:"session_code_length"`

	// SessionCodeChars is the alphabet from which session code characters are
	// sampled (e.g. "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789").
	SessionCodeChars string `yaml:"session_code_chars"`

	// SessionCodePrefix is the static string prepended to every generated
	// session code (e.g. "PS-").
	SessionCodePrefix string `yaml:"session_code_prefix"`

	// MaxClients is the maximum number of peers allowed in a single session.
	MaxClients int `yaml:"max_clients"`

	// MaxGenerationAttempts is the number of times the server will retry
	// generating a unique session code before returning an error.
	MaxGenerationAttempts int `yaml:"max_generation_attempts"`

	// FileTransferCapacityBytes is the maximum size in bytes of a single
	// file that can be received in a session. Files larger than this are rejected
	// at the start of transfer. A value of 0 disables the limit.
	FileTransferCapacityBytes int `yaml:"file_transfer_capacity_bytes"`

	// AutoWebRTCEnabled controls whether the server automatically initiates
	// WebRTC connections once a session reaches its maximum client count.
	AutoWebRTCEnabled bool `yaml:"auto_webrtc_enabled"`

	// EncryptionMode is the name of the encryption scheme advertised to
	// clients in session information messages (e.g. "aes-256").
	EncryptionMode string `yaml:"encryption_mode"`

	// Address is the network interface address the HTTP server listens on
	// (e.g. "0.0.0.0" or "127.0.0.1").
	Address string `yaml:"address"`

	// Port is the TCP port the HTTP server listens on.
	Port int `yaml:"port"`
}
