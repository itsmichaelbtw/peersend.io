package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"peersend/internal/app"
	"peersend/internal/config"
	"syscall"
	"time"
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
		log.Printf("Running in %s mode", cfg.Environment)
		log.Printf("Server starting on %s\n", server.Addr)
		serverErrors <- server.ListenAndServe()
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		log.Fatalf("Error starting server: %v", err)

	case sig := <-shutdown:
		log.Printf("Starting shutdown, signal: %v\n", sig)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Could not stop server gracefully: %v\n", err)
			if err := server.Close(); err != nil {
				log.Printf("Could not force close server: %v\n", err)
			}
		}
	}
}
