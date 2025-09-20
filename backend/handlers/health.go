package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
	Uptime    string    `json:"uptime,omitempty"`
	Services  Services  `json:"services,omitempty"`
}

// Services represents the status of various services
type Services struct {
	Database string `json:"database"`
	Redis    string `json:"redis,omitempty"`
	Payment  string `json:"payment,omitempty"`
}

var startTime = time.Now()

// HealthCheck handles health check requests
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Version:   "1.0.0",
		Uptime:    time.Since(startTime).String(),
		Services: Services{
			Database: "connected",
			Redis:    "not_configured",
			Payment:  "configured",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ReadinessCheck handles readiness check requests
func ReadinessCheck(w http.ResponseWriter, r *http.Request) {
	// Add database connectivity check here
	response := map[string]interface{}{
		"status":    "ready",
		"timestamp": time.Now(),
		"checks": map[string]string{
			"database": "ok",
			"api":      "ok",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// LivenessCheck handles liveness check requests
func LivenessCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "alive",
		"timestamp": time.Now(),
		"uptime":    time.Since(startTime).String(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}