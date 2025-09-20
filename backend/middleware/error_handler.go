package middleware

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"
)

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Status     int         `json:"status"`
	Message    string      `json:"message"`
	Error      string      `json:"error,omitempty"`
	RequestID  string      `json:"request_id,omitempty"`
	Additional interface{} `json:"additional,omitempty"`
}

// ErrorHandler wraps an http.HandlerFunc and provides standardized error handling
func ErrorHandler(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Recover from panics
		defer func() {
			if err := recover(); err != nil {
				logrus.WithFields(logrus.Fields{
					"request_id": r.Context().Value("request_id"),
					"error":      err,
				}).Error("Panic recovered in request handler")

				SendError(w, r, http.StatusInternalServerError, "Internal server error", err)
			}
		}()

		next.ServeHTTP(w, r)
	}
}

// SendError sends a standardized error response
func SendError(w http.ResponseWriter, r *http.Request, status int, message string, err interface{}) {
	requestID := r.Context().Value("request_id").(string)

	response := ErrorResponse{
		Status:    status,
		Message:   message,
		RequestID: requestID,
	}

	if err != nil {
		if status >= 500 {
			// Log server errors
			logrus.WithFields(logrus.Fields{
				"request_id": requestID,
				"status":     status,
				"error":      err,
			}).Error(message)

			// Don't send internal error details to client
			response.Error = "Internal server error"
		} else {
			// For client errors, we can send more details
			response.Error = err.(error).Error()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}
