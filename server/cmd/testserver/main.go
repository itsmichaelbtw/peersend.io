// Package main starts a lightweight signaling server for E2E test runs.
// It uses hardcoded test configuration and exits immediately on any error.
// Do not use this entry point for production or development deployments.
package main

import (
	"fmt"
	"net/http"
	"peersend/internal/app"
	"peersend/internal/config"

	"github.com/rs/zerolog/log"
)

func main() {
	cfg := config.Load(config.GetConfigPath("SERVER_CONFIG_PATH", "configs/peersend.yml"))
	cfg.Environment = "test"
	cfg.Logger.Pretty = false
	cfg.Server.Port = 8081

	mux := http.NewServeMux()
	app.Initialise(mux, cfg)

	addr := fmt.Sprintf("%s:%d", cfg.Server.Address, cfg.Server.Port)
	log.Info().Str("address", addr).Msg("test server starting")

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal().Err(err).Msg("test server error")
	}
}
