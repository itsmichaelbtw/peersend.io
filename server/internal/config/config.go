package config

import (
	"fmt"
	"os"
	"sync"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Server      *ServerConfig `yaml:"server"`
	Logger      *LoggerConfig `yaml:"logger"`
	Environment string
}

var (
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

func Get() *Config {
	if cfg == nil {
		log.Fatal().Msg("config not loaded; call config.Load() first before calling config.Get()")
	}

	return cfg
}

func GetConfigPath(envName string, defaultPath string) string {
	if envPath := os.Getenv(envName); envPath != "" {
		return envPath
	}

	return defaultPath
}
