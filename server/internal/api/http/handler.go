package http_api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/rs/zerolog"

	"peersend/internal/config"
)

type HealthResponse struct {
	// Version is the running server version (see config.Version).
	Version string `json:"version"`

	// Environment is the runtime environment name (e.g. "production").
	Environment string `json:"environment"`

	// Status is a human-readable availability string; currently always
	// "healthy" when the endpoint responds successfully.
	Status string `json:"status"`

	// Timestamp is the UTC time at which the response was generated.
	Timestamp time.Time `json:"timestamp"`
}

type Handler struct {
	environment string
	logger      zerolog.Logger
}

func NewHandler(env string) *Handler {
	return &Handler{
		environment: env,
		logger:      config.WithLogComponent("http_handler"),
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
