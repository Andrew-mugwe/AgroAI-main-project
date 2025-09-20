package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/logger"
)

// AdminLogsHandler handles admin log viewing
type AdminLogsHandler struct {
	activityLogger *logger.ActivityLogger
}

// NewAdminLogsHandler creates a new admin logs handler
func NewAdminLogsHandler(activityLogger *logger.ActivityLogger) *AdminLogsHandler {
	return &AdminLogsHandler{
		activityLogger: activityLogger,
	}
}

// AdminLogsRequest represents the request parameters for admin logs
type AdminLogsRequest struct {
	Role      string `json:"role,omitempty"`
	Action    string `json:"action,omitempty"`
	StartDate string `json:"start_date,omitempty"`
	EndDate   string `json:"end_date,omitempty"`
	Limit     int    `json:"limit,omitempty"`
	Offset    int    `json:"offset,omitempty"`
}

// AdminLogsResponse represents the response from admin logs endpoint
type AdminLogsResponse struct {
	Logs       []logger.ActivityLog `json:"logs"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	PageSize   int                  `json:"page_size"`
	TotalPages int                  `json:"total_pages"`
}

// GetAdminLogs retrieves activity logs for admin viewing
func (h *AdminLogsHandler) GetAdminLogs(w http.ResponseWriter, r *http.Request) {
	// Check if user is admin
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if user.Role != models.RoleAdmin {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	// Parse query parameters
	role := r.URL.Query().Get("role")
	action := r.URL.Query().Get("action")
	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	// Set defaults
	limit := 50
	offset := 0

	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 1000 {
			limit = parsedLimit
		}
	}

	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Parse dates
	var startDate, endDate *time.Time
	if startDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &parsed
		}
	}
	if endDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", endDateStr); err == nil {
			// Add 23:59:59 to end date to include the entire day
			parsed = parsed.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			endDate = &parsed
		}
	}

	// Build query
	query := logger.LogQuery{
		Role:      role,
		Action:    action,
		StartDate: startDate,
		EndDate:   endDate,
		Limit:     limit,
		Offset:    offset,
	}

	// Get logs
	logs, err := h.activityLogger.GetLogs(query)
	if err != nil {
		http.Error(w, "Failed to retrieve logs", http.StatusInternalServerError)
		return
	}

	// Get total count for pagination
	totalQuery := query
	totalQuery.Limit = 0
	totalQuery.Offset = 0
	totalLogs, err := h.activityLogger.GetLogs(totalQuery)
	if err != nil {
		http.Error(w, "Failed to get total count", http.StatusInternalServerError)
		return
	}

	total := len(totalLogs)
	totalPages := (total + limit - 1) / limit
	page := (offset / limit) + 1

	// Return response
	response := AdminLogsResponse{
		Logs:       logs,
		Total:      total,
		Page:       page,
		PageSize:   limit,
		TotalPages: totalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetAdminLogStats retrieves log statistics for admin dashboard
func (h *AdminLogsHandler) GetAdminLogStats(w http.ResponseWriter, r *http.Request) {
	// Check if user is admin
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if user.Role != models.RoleAdmin {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	// Get stats
	stats, err := h.activityLogger.GetLogStats()
	if err != nil {
		http.Error(w, "Failed to retrieve log stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// CleanupOldLogs removes old logs (admin only)
func (h *AdminLogsHandler) CleanupOldLogs(w http.ResponseWriter, r *http.Request) {
	// Check if user is admin
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if user.Role != models.RoleAdmin {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	// Parse days parameter
	daysStr := r.URL.Query().Get("days")
	days := 90 // Default to 90 days

	if daysStr != "" {
		if parsedDays, err := strconv.Atoi(daysStr); err == nil && parsedDays > 0 {
			days = parsedDays
		}
	}

	// Cleanup old logs
	olderThan := time.Duration(days) * 24 * time.Hour
	rowsAffected, err := h.activityLogger.CleanupOldLogs(olderThan)
	if err != nil {
		http.Error(w, "Failed to cleanup old logs", http.StatusInternalServerError)
		return
	}

	// Return response
	response := map[string]interface{}{
		"success":        true,
		"message":        "Old logs cleaned up successfully",
		"rows_affected":  rowsAffected,
		"days_retained":  days,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
