package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type responseWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (rw *responseWriter) Status() int {
	return rw.status
}

func (rw *responseWriter) WriteHeader(code int) {
	if !rw.wroteHeader {
		rw.status = code
		rw.ResponseWriter.WriteHeader(code)
		rw.wroteHeader = true
	}
}

// LoggingMiddleware adds request logging with correlation ID and timing
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Generate request ID
		requestID := uuid.New().String()

		// Get user ID and role from context if available
		userID := r.Context().Value("user_id")
		userRole := r.Context().Value("user_role")

		// Create wrapped response writer to capture status code
		wrapped := &responseWriter{ResponseWriter: w, status: http.StatusOK}

		// Add request ID to context
		ctx := context.WithValue(r.Context(), "request_id", requestID)
		r = r.WithContext(ctx)

		// Process request
		next.ServeHTTP(wrapped, r)

		// Calculate duration
		duration := time.Since(start)

		// Log request details
		logger := logrus.WithFields(logrus.Fields{
			"request_id": requestID,
			"method":     r.Method,
			"path":       r.URL.Path,
			"status":     wrapped.Status(),
			"duration":   duration.String(),
			"user_id":    userID,
			"user_role":  userRole,
			"user_agent": r.UserAgent(),
			"remote_ip":  r.RemoteAddr,
		})

		if wrapped.Status() >= 500 {
			logger.Error("Server error")
		} else if wrapped.Status() >= 400 {
			logger.Warn("Client error")
		} else {
			logger.Info("Request completed")
		}
	})
}
