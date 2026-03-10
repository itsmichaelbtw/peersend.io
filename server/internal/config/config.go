// Package config provides application configuration loaded from a YAML file,
// structured logging initialisation, and a sync.Once-guarded singleton so the
// config is parsed exactly once per process lifetime. Callers should call
// Load at startup and Get anywhere else.
package config

import (
	"fmt"
	"os"
	"sync"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

// Config is the top-level configuration structure populated from the YAML
// config file. It is safe to read concurrently after Load returns.
type Config struct {
	Server *ServerConfig `yaml:"server"`
	Logger *LoggerConfig `yaml:"logger"`

	// Environment is the runtime environment name (e.g. "development",
	// "production"). It is sourced from the APP_ENV environment variable and
	// defaults to "development" when the variable is absent.
	Environment string
}

var (
	// cfg is the process-wide singleton Config populated by Load.
	cfg  *Config
	once sync.Once
)

func loadConfig(path string) error {
	if path == "" {
		return fmt.Errorf("path cannot be empty when loading config")
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read config file %s: %w", path, err)
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return fmt.Errorf("failed to parse config %s: %w", path, err)
	}

	return nil
}

// Load reads configuration from the YAML file at path and returns the
// singleton Config. It is guaranteed to parse the file exactly once; subsequent
// calls return the same pointer. The process exits with a fatal log if the
// file cannot be read or parsed.
func Load(path string) *Config {
	once.Do(func() {
		cfg = &Config{
			Server:      &ServerConfig{},
			Logger:      &LoggerConfig{},
			Environment: GetEnvironment(),
		}

		if err := loadConfig(path); err != nil {
			log.Fatal().Err(err).Msg("config load error")
		}

		InitLogger(cfg.Logger)
	})
	return cfg
}

// Get returns the previously loaded singleton Config. It panics (via a fatal
// log) if Load has not been called first.
func Get() *Config {
	if cfg == nil {
		log.Fatal().Msg("config not loaded; call config.Load() first before calling config.Get()")
	}

	return cfg
}

// GetConfigPath returns the config file path to use. If the environment
// variable named by envName is set and non-empty, its value is returned;
// otherwise defaultPath is returned.
func GetConfigPath(envName string, defaultPath string) string {
	if envPath := os.Getenv(envName); envPath != "" {
		return envPath
	}

	return defaultPath
}
