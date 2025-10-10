package config

type ServerConfig struct {
	SessionCodeLength     int    `yaml:"session_code_length"`
	SessionCodeChars      string `yaml:"session_code_chars"`
	SessionCodePrefix     string `yaml:"session_code_prefix"`
	MaxClients            int    `yaml:"max_clients"`
	MaxGenerationAttempts int    `yaml:"max_generation_attempts"`
	AutoWebRTCEnabled     bool   `yaml:"auto_webrtc_enabled"`
	EncryptionMode        string `yaml:"encryption_mode"`
	Address               string `yaml:"address"`
	Port                  int    `yaml:"port"`
}
