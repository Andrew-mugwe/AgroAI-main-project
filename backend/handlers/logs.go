package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Andrew-mugwe/agroai/services/logger"
	"github.com/google/uuid"
)

// LogsHandler handles frontend log events
type LogsHandler struct {
	activityLogger *logger.ActivityLogger
}

// NewLogsHandler creates a new logs handler
func NewLogsHandler(activityLogger *logger.ActivityLogger) *LogsHandler {
	return &LogsHandler{
		activityLogger: activityLogger,
	}
}

// FrontendLogRequest represents a request from frontend to log events
type FrontendLogRequest struct {
	Events []FrontendLogEvent `json:"events"`
}

// FrontendLogEvent represents a single frontend log event
type FrontendLogEvent struct {
	Action    string                 `json:"action"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	Timestamp int64                  `json:"timestamp"`
	UserID    *string                `json:"user_id,omitempty"`
	Role      *string                `json:"role,omitempty"`
	SessionID string                 `json:"session_id"`
}

// LogsResponse represents the response from the logs endpoint
type LogsResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Count   int    `json:"count"`
}

// LogFrontendEvents handles frontend log events
func (h *LogsHandler) LogFrontendEvents(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req FrontendLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Events) == 0 {
		http.Error(w, "No events provided", http.StatusBadRequest)
		return
	}

	// Process each event
	processedCount := 0
	for _, event := range req.Events {
		// Convert frontend event to backend activity log format
		var userID *uuid.UUID
		if event.UserID != nil {
			if parsedID, err := uuid.Parse(*event.UserID); err == nil {
				userID = &parsedID
			}
		}

		// Extract IP and user agent from metadata
		ip := "unknown"
		userAgent := "unknown"
		
		if event.Metadata != nil {
			if ipVal, ok := event.Metadata["ip"]; ok {
				if ipStr, ok := ipVal.(string); ok {
					ip = ipStr
				}
			}
			if uaVal, ok := event.Metadata["userAgent"]; ok {
				if uaStr, ok := uaVal.(string); ok {
					userAgent = uaStr
				}
			}
		}

		// If not in metadata, try to get from request headers
		if ip == "unknown" {
			ip = getClientIP(r)
		}
		if userAgent == "unknown" {
			userAgent = r.Header.Get("User-Agent")
		}

		// Determine role
		role := "user"
		if event.Role != nil {
			role = *event.Role
		}

		// Add session ID to metadata
		metadata := event.Metadata
		if metadata == nil {
			metadata = make(map[string]interface{})
		}
		metadata["session_id"] = event.SessionID
		metadata["frontend_timestamp"] = event.Timestamp
		metadata["backend_timestamp"] = time.Now().Unix()

		// Log the event (non-blocking)
		go func() {
			err := h.activityLogger.LogAction(userID, role, event.Action, metadata, ip, userAgent)
			if err != nil {
				// Log error but don't fail the request
				// In production, you might want to use a proper logger
				// log.Printf("Failed to log frontend event %s: %v", event.Action, err)
			}
		}()

		processedCount++
	}

	// Return success response
	response := LogsResponse{
		Success: true,
		Message: "Events logged successfully",
		Count:   processedCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// getClientIP extracts the client IP address from the request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for proxies/load balancers)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For can contain multiple IPs, take the first one
		if len(xff) > 0 {
			return xff
		}
	}

	// Check X-Real-IP header
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// Fall back to RemoteAddr
	return r.RemoteAddr
}
