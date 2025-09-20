package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/yourusername/agroai/models"
	"github.com/yourusername/agroai/services"
)

// NotificationHandler handles notification HTTP requests
type NotificationHandler struct {
	notificationService *services.NotificationService
}

// NewNotificationHandler creates a new notification handler
func NewNotificationHandler(notificationService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{notificationService: notificationService}
}

// Notification represents a notification in the database
type Notification struct {
	ID        int    `json:"id"`
	UserID    string `json:"user_id"`
	Type      string `json:"type"`
	Message   string `json:"message"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

// NotificationResponse represents the response for notification operations
type NotificationResponse struct {
	Success       bool           `json:"success"`
	Message       string         `json:"message"`
	Notifications []Notification `json:"notifications,omitempty"`
	Count         int            `json:"count,omitempty"`
}

// GetNotifications retrieves notifications for the authenticated user
func (nh *NotificationHandler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by JWT middleware)
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse optional status filter
	status := r.URL.Query().Get("status")

	// Get user notifications
	notifications, err := nh.notificationService.GetUserNotifications(user.ID, status)
	if err != nil {
		http.Error(w, "Failed to retrieve notifications", http.StatusInternalServerError)
		return
	}

	// Convert to response format
	var responseNotifications []Notification
	for _, n := range notifications {
		responseNotifications = append(responseNotifications, Notification{
			ID:        n.ID,
			UserID:    n.UserID,
			Type:      n.Type,
			Message:   n.Message,
			Status:    n.Status,
			CreatedAt: n.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	response := NotificationResponse{
		Success:       true,
		Message:       "Notifications retrieved successfully",
		Notifications: responseNotifications,
		Count:         len(responseNotifications),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// MarkNotificationRead marks a notification as read
func (nh *NotificationHandler) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get notification ID from URL
	vars := mux.Vars(r)
	notificationIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "Notification ID is required", http.StatusBadRequest)
		return
	}

	// Mark notification as read
	err := nh.notificationService.MarkNotificationRead(notificationIDStr)
	if err != nil {
		http.Error(w, "Failed to mark notification as read", http.StatusInternalServerError)
		return
	}

	response := NotificationResponse{
		Success: true,
		Message: "Notification marked as read",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetNotificationStats returns notification statistics for the user
func (nh *NotificationHandler) GetNotificationStats(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get notification stats
	stats, err := nh.notificationService.GetNotificationStats(user.ID)
	if err != nil {
		http.Error(w, "Failed to get notification stats", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Notification stats retrieved successfully",
		"stats":   stats,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}