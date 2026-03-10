package config

import (
	"io"
	"os"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type LoggerConfig struct {
	// Level is the minimum log severity to emit. Accepted values (case-
	// insensitive): trace, debug, info, warn, warning, error, fatal, panic.
	// Defaults to info when an unrecognised value is provided.
	Level string `yaml:"level"`

	// Pretty enables human-friendly console output with colour and timestamps
	// formatted as RFC3339. When false, logs are emitted as JSON.
	Pretty bool `yaml:"pretty"`
}

func InitLogger(cfg *LoggerConfig) {
	level := parseLogLevel(cfg.Level)
	zerolog.SetGlobalLevel(level)

	var output io.Writer = os.Stdout
	if cfg.Pretty {
		output = zerolog.ConsoleWriter{
			Out:          os.Stdout,
			TimeFormat:   time.RFC3339,
			TimeLocation: time.Local,
			NoColor:      false,
		}
	}

	log.Logger = zerolog.New(output).
		With().
		Timestamp().
		Caller().
		Logger()
}

func parseLogLevel(level string) zerolog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return zerolog.DebugLevel
	case "info":
		return zerolog.InfoLevel
	case "warn", "warning":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	case "fatal":
		return zerolog.FatalLevel
	case "panic":
		return zerolog.PanicLevel
	case "trace":
		return zerolog.TraceLevel
	default:
		return zerolog.InfoLevel
	}
}

// WithLogComponent returns a child logger derived from the global logger that
// includes a "component" field set to the given name. Use it to produce
// contextual loggers at package or struct level.
func WithLogComponent(component string) zerolog.Logger {
	return log.With().Str("component", component).Logger()
}
