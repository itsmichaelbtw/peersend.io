package config

import (
	"fmt"
	"log"
	"os"
	"sync"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server *ServerConfig `yaml:"server"`
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
		cfg = &Config{Server: &ServerConfig{}}
		if err := loadConfig(path); err != nil {
			log.Fatalf("config load error: %v", err)
		}
	})
	return cfg
}

func Get() *Config {
	if cfg == nil {
		log.Fatal("config not loaded; call config.Load() first before calling config.Get()")
	}

	return cfg
}

func GetConfigPath(envName string, defaultPath string) string {
	if envPath := os.Getenv(envName); envPath != "" {
		return envPath
	}

	return defaultPath
}
