package http_api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/rs/zerolog"

	"peersend/internal/config"
)

type HealthResponse struct {
	Version     string    `json:"version"`
	Environment string    `json:"environment"`
	Status      string    `json:"status"`
	Timestamp   time.Time `json:"timestamp"`
}

type Handler struct {
	environment string
	logger      zerolog.Logger
}

func NewHandler(env string) *Handler {
	return &Handler{
		environment: env,
		logger:      config.WithComponent("http_handler"),
	}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
		return
	}

	requestIP := r.Header.Get("X-Forwarded-For")
	if requestIP == "" {
		requestIP = r.RemoteAddr
	}

	h.logger.Info().Str("ip", requestIP).Msg("health check request")

	health := HealthResponse{
		Version:     config.Version,
		Environment: h.environment,
		Status:      "healthy",
		Timestamp:   time.Now().UTC(),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(health); err != nil {
		h.logger.Error().Err(err).Msg("error encoding health response")
		w.WriteHeader(http.StatusInternalServerError)
	}
}
