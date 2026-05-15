// Package main is the entry point for the peersend signaling server.
// It loads configuration, wires up the application, and runs the HTTP server
// with support for graceful shutdown on SIGINT or SIGTERM.
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"peersend/internal/app"
	"peersend/internal/config"
	"syscall"
	"time"

	"github.com/rs/zerolog/log"
)

func main() {
	cfg := config.Load(config.GetConfigPath("SERVER_CONFIG_PATH", "configs/peersend.yml"))

	mux := http.NewServeMux()
	app.Initialise(mux, cfg)

	server := &http.Server{
		Addr:              fmt.Sprintf("%s:%d", cfg.Server.Address, cfg.Server.Port),
		Handler:           mux,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
	}

	serverErrors := make(chan error, 1)

	go func() {
		log.Info().
			Str("environment", cfg.Environment).
			Str("address", server.Addr).
			Msg("server starting")

		if cfg.Server.AutoWebRTCEnabled {
			log.Info().Msg("auto WebRTC is enabled — clients will connect directly without manual intervention")
		}

		serverErrors <- server.ListenAndServe()
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		log.Fatal().Err(err).Msg("error starting server")

	case sig := <-shutdown:
		log.Info().Str("signal", sig.String()).Msg("starting shutdown")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Warn().Err(err).Msg("could not stop server gracefully")
			if err := server.Close(); err != nil {
				log.Error().Err(err).Msg("could not force close server")
			}
		}
	}
}
