package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/Andrew-mugwe/agroai/services/logger"
	"github.com/google/uuid"
)

// ActivityLoggerMiddleware provides automatic activity logging
type ActivityLoggerMiddleware struct {
	logger *logger.ActivityLogger
}

// NewActivityLoggerMiddleware creates a new activity logger middleware
func NewActivityLoggerMiddleware(activityLogger *logger.ActivityLogger) *ActivityLoggerMiddleware {
	return &ActivityLoggerMiddleware{
		logger: activityLogger,
	}
}

// LogActivity logs an activity with the provided details
func (alm *ActivityLoggerMiddleware) LogActivity(userID *uuid.UUID, role string, action string, metadata map[string]interface{}, r *http.Request) {
	// Extract IP address
	ip := getClientIP(r)

	// Extract user agent
	userAgent := r.Header.Get("User-Agent")
	if userAgent == "" {
		userAgent = "Unknown"
	}

	// Log the activity (non-blocking)
	go func() {
		err := alm.logger.LogAction(userID, role, action, metadata, ip, userAgent)
		if err != nil {
			// Log error but don't break the request flow
			// In production, you might want to use a proper logger
			// log.Printf("Failed to log activity %s: %v", action, err)
		}
	}()
}

// LogLogin logs a login activity
func (alm *ActivityLoggerMiddleware) LogLogin(userID uuid.UUID, role string, r *http.Request) {
	metadata := map[string]interface{}{
		"login_time": time.Now().Unix(),
		"endpoint":   r.URL.Path,
	}
	alm.LogActivity(&userID, role, "LOGIN", metadata, r)
}

// LogSignup logs a signup activity
func (alm *ActivityLoggerMiddleware) LogSignup(userID uuid.UUID, role string, r *http.Request) {
	metadata := map[string]interface{}{
		"signup_time": time.Now().Unix(),
		"endpoint":    r.URL.Path,
	}
	alm.LogActivity(&userID, role, "SIGNUP", metadata, r)
}

// LogRoleChange logs a role change activity
func (alm *ActivityLoggerMiddleware) LogRoleChange(userID uuid.UUID, oldRole string, newRole string, r *http.Request) {
	metadata := map[string]interface{}{
		"old_role":    oldRole,
		"new_role":    newRole,
		"change_time": time.Now().Unix(),
		"endpoint":    r.URL.Path,
	}
	alm.LogActivity(&userID, newRole, "ROLE_CHANGE", metadata, r)
}

// LogOrderActivity logs order-related activities
func (alm *ActivityLoggerMiddleware) LogOrderActivity(userID uuid.UUID, role string, action string, orderID string, r *http.Request) {
	metadata := map[string]interface{}{
		"order_id":    orderID,
		"action_time": time.Now().Unix(),
		"endpoint":    r.URL.Path,
	}
	alm.LogActivity(&userID, role, action, metadata, r)
}

// LogProductActivity logs product-related activities
func (alm *ActivityLoggerMiddleware) LogProductActivity(userID uuid.UUID, role string, action string, productID string, r *http.Request) {
	metadata := map[string]interface{}{
		"product_id":  productID,
		"action_time": time.Now().Unix(),
		"endpoint":    r.URL.Path,
	}
	alm.LogActivity(&userID, role, action, metadata, r)
}

// LogNGOActivity logs NGO-related activities
func (alm *ActivityLoggerMiddleware) LogNGOActivity(userID uuid.UUID, role string, action string, groupID string, r *http.Request) {
	metadata := map[string]interface{}{
		"group_id":    groupID,
		"action_time": time.Now().Unix(),
		"endpoint":    r.URL.Path,
	}
	alm.LogActivity(&userID, role, action, metadata, r)
}

// LogFarmerActivity logs farmer-related activities
func (alm *ActivityLoggerMiddleware) LogFarmerActivity(userID uuid.UUID, role string, action string, location string, r *http.Request) {
	metadata := map[string]interface{}{
		"location":    location,
		"action_time": time.Now().Unix(),
		"endpoint":    r.URL.Path,
	}
	alm.LogActivity(&userID, role, action, metadata, r)
}

// LogSystemActivity logs system-level activities
func (alm *ActivityLoggerMiddleware) LogSystemActivity(action string, metadata map[string]interface{}, r *http.Request) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	metadata["system_time"] = time.Now().Unix()
	metadata["endpoint"] = r.URL.Path

	alm.LogActivity(nil, "SYSTEM", action, metadata, r)
}

// getClientIP extracts the client IP address from the request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for proxies/load balancers)
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		// X-Forwarded-For can contain multiple IPs, take the first one
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	// Check X-Real-IP header
	xri := r.Header.Get("X-Real-IP")
	if xri != "" {
		return xri
	}

	// Fall back to RemoteAddr
	ip := r.RemoteAddr
	if ip != "" {
		// Remove port if present
		if colonIndex := strings.LastIndex(ip, ":"); colonIndex != -1 {
			ip = ip[:colonIndex]
		}
		return ip
	}

	return "unknown"
}

// ActivityLoggingHandler wraps an HTTP handler with activity logging
func (alm *ActivityLoggerMiddleware) ActivityLoggingHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log the request
		alm.LogSystemActivity("HTTP_REQUEST", map[string]interface{}{
			"method": r.Method,
			"path":   r.URL.Path,
			"query":  r.URL.RawQuery,
		}, r)

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

// GetActivityLoggerFromContext retrieves the activity logger from request context
func GetActivityLoggerFromContext(r *http.Request) *ActivityLoggerMiddleware {
	if logger, ok := r.Context().Value("activity_logger").(*ActivityLoggerMiddleware); ok {
		return logger
	}
	return nil
}

// SetActivityLoggerInContext sets the activity logger in request context
func SetActivityLoggerInContext(r *http.Request, logger *ActivityLoggerMiddleware) *http.Request {
	ctx := context.WithValue(r.Context(), "activity_logger", logger)
	return r.WithContext(ctx)
}
