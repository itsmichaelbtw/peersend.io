package http_api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"peersend/internal/config"
	"time"
)

type HealthResponse struct {
	Version     string    `json:"version"`
	Environment string    `json:"environment"`
	Status      string    `json:"status"`
	Timestamp   time.Time `json:"timestamp"`
}

type Handler struct {
	environment string
}

func NewHandler(env string) *Handler {
	return &Handler{
		environment: env,
	}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
		return
	}

	health := HealthResponse{
		Version:     config.Version,
		Environment: h.environment,
		Status:      "healthy",
		Timestamp:   time.Now().UTC(),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(health); err != nil {
		fmt.Printf("Error encoding health response: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
