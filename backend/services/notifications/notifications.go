package notifications

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

// DatabaseNotificationService handles notification database operations
type DatabaseNotificationService struct {
	db *sql.DB
}

// Notification represents a notification in the database
type Notification struct {
	ID        uuid.UUID              `json:"id"`
	UserID    uuid.UUID              `json:"user_id"`
	Role      string                 `json:"role"`
	Type      string                 `json:"type"`
	Message   string                 `json:"message"`
	Status    string                 `json:"status"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}

// NotificationRequest represents a request to create a notification
type NotificationRequest struct {
	UserID   uuid.UUID              `json:"user_id"`
	Role     string                 `json:"role"`
	Type     string                 `json:"type"`
	Message  string                 `json:"message"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// NotificationResponse represents the response for notification operations
type NotificationResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    *Notification `json:"data,omitempty"`
	Count   int           `json:"count,omitempty"`
}

// NotificationListResponse represents the response for listing notifications
type NotificationListResponse struct {
	Success       bool           `json:"success"`
	Message       string         `json:"message"`
	Notifications []Notification `json:"notifications"`
	Total         int            `json:"total"`
	UnreadCount   int            `json:"unread_count"`
	Page          int            `json:"page"`
	PageSize      int            `json:"page_size"`
	TotalPages    int            `json:"total_pages"`
}

// NotificationQuery represents query parameters for filtering notifications
type NotificationQuery struct {
	UserID *uuid.UUID
	Role   string
	Type   string
	Status string
	Limit  int
	Offset int
}

// NewDatabaseNotificationService creates a new database notification service instance
func NewDatabaseNotificationService(db *sql.DB) *DatabaseNotificationService {
	return &DatabaseNotificationService{
		db: db,
	}
}

// SendNotification creates a new notification for a user
func (ns *DatabaseNotificationService) SendNotification(req NotificationRequest) (*Notification, error) {
	// Validate required fields
	if req.UserID == uuid.Nil {
		return nil, fmt.Errorf("user_id is required")
	}
	if req.Role == "" {
		return nil, fmt.Errorf("role is required")
	}
	if req.Type == "" {
		return nil, fmt.Errorf("type is required")
	}
	if req.Message == "" {
		return nil, fmt.Errorf("message is required")
	}

	// Validate role
	validRoles := []string{"farmer", "ngo", "trader", "admin"}
	if !contains(validRoles, req.Role) {
		return nil, fmt.Errorf("invalid role: %s", req.Role)
	}

	// Validate type
	validTypes := []string{"weather", "pest", "training", "stock", "price", "system", "market", "crop", "general"}
	if !contains(validTypes, req.Type) {
		return nil, fmt.Errorf("invalid type: %s", req.Type)
	}

	// Convert metadata to JSON
	metadataJSON := "{}"
	if req.Metadata != nil {
		metadataBytes, err := json.Marshal(req.Metadata)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal metadata: %v", err)
		}
		metadataJSON = string(metadataBytes)
	}

	// Insert notification
	query := `
		INSERT INTO notifications (user_id, role, type, message, metadata, status)
		VALUES ($1, $2, $3, $4, $5, 'unread')
		RETURNING id, user_id, role, type, message, status, metadata, created_at, updated_at
	`

	var notification Notification
	var metadataStr string

	err := ns.db.QueryRow(query, req.UserID, req.Role, req.Type, req.Message, metadataJSON).Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Role,
		&notification.Type,
		&notification.Message,
		&notification.Status,
		&metadataStr,
		&notification.CreatedAt,
		&notification.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %v", err)
	}

	// Parse metadata
	if metadataStr != "" && metadataStr != "{}" {
		err = json.Unmarshal([]byte(metadataStr), &notification.Metadata)
		if err != nil {
			log.Printf("Warning: failed to unmarshal metadata: %v", err)
			notification.Metadata = make(map[string]interface{})
		}
	} else {
		notification.Metadata = make(map[string]interface{})
	}

	// Send email notification if user has verified email (future extension)
	go ns.sendEmailNotification(notification)

	return &notification, nil
}

// GetNotifications retrieves notifications for a user with optional filtering
func (ns *DatabaseNotificationService) GetNotifications(query NotificationQuery) (*NotificationListResponse, error) {
	// Build WHERE clause
	whereClause := "WHERE user_id = $1"
	args := []interface{}{query.UserID}
	argIndex := 2

	if query.Role != "" {
		whereClause += fmt.Sprintf(" AND role = $%d", argIndex)
		args = append(args, query.Role)
		argIndex++
	}

	if query.Type != "" {
		whereClause += fmt.Sprintf(" AND type = $%d", argIndex)
		args = append(args, query.Type)
		argIndex++
	}

	if query.Status != "" {
		whereClause += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, query.Status)
		argIndex++
	}

	// Set default pagination
	limit := query.Limit
	if limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	offset := query.Offset
	if offset < 0 {
		offset = 0
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM notifications %s", whereClause)
	var total int
	err := ns.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to get notification count: %v", err)
	}

	// Get unread count
	unreadQuery := fmt.Sprintf("SELECT COUNT(*) FROM notifications %s AND status = 'unread'", whereClause)
	var unreadCount int
	err = ns.db.QueryRow(unreadQuery, args...).Scan(&unreadCount)
	if err != nil {
		log.Printf("Warning: failed to get unread count: %v", err)
		unreadCount = 0
	}

	// Get notifications
	notificationsQuery := fmt.Sprintf(`
		SELECT id, user_id, role, type, message, status, metadata, created_at, updated_at
		FROM notifications
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := ns.db.Query(notificationsQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %v", err)
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var notification Notification
		var metadataStr string

		err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Role,
			&notification.Type,
			&notification.Message,
			&notification.Status,
			&metadataStr,
			&notification.CreatedAt,
			&notification.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning notification: %v", err)
			continue
		}

		// Parse metadata
		if metadataStr != "" && metadataStr != "{}" {
			err = json.Unmarshal([]byte(metadataStr), &notification.Metadata)
			if err != nil {
				log.Printf("Warning: failed to unmarshal metadata: %v", err)
				notification.Metadata = make(map[string]interface{})
			}
		} else {
			notification.Metadata = make(map[string]interface{})
		}

		notifications = append(notifications, notification)
	}

	// Calculate pagination
	totalPages := (total + limit - 1) / limit
	page := (offset / limit) + 1

	return &NotificationListResponse{
		Success:       true,
		Message:       "Notifications retrieved successfully",
		Notifications: notifications,
		Total:         total,
		UnreadCount:   unreadCount,
		Page:          page,
		PageSize:      limit,
		TotalPages:    totalPages,
	}, nil
}

// MarkNotificationRead marks a notification as read
func (ns *DatabaseNotificationService) MarkNotificationRead(notificationID uuid.UUID, userID uuid.UUID) error {
	query := `
		UPDATE notifications 
		SET status = 'read', updated_at = NOW()
		WHERE id = $1 AND user_id = $2
	`

	result, err := ns.db.Exec(query, notificationID, userID)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("notification not found or not owned by user")
	}

	return nil
}

// MarkAllNotificationsRead marks all notifications for a user as read
func (ns *DatabaseNotificationService) MarkAllNotificationsRead(userID uuid.UUID) error {
	query := `
		UPDATE notifications 
		SET status = 'read', updated_at = NOW()
		WHERE user_id = $1 AND status = 'unread'
	`

	result, err := ns.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	log.Printf("Marked %d notifications as read for user %s", rowsAffected, userID)
	return nil
}

// DeleteNotification deletes a notification (admin only)
func (ns *DatabaseNotificationService) DeleteNotification(notificationID uuid.UUID, userID uuid.UUID) error {
	query := `
		DELETE FROM notifications 
		WHERE id = $1 AND user_id = $2
	`

	result, err := ns.db.Exec(query, notificationID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("notification not found or not owned by user")
	}

	return nil
}

// GetNotificationStats returns statistics about notifications
func (ns *DatabaseNotificationService) GetNotificationStats(userID uuid.UUID) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total notifications
	var total int
	err := ns.db.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = $1", userID).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to get total notifications: %v", err)
	}
	stats["total"] = total

	// Unread notifications
	var unread int
	err = ns.db.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND status = 'unread'", userID).Scan(&unread)
	if err != nil {
		return nil, fmt.Errorf("failed to get unread notifications: %v", err)
	}
	stats["unread"] = unread

	// Notifications by type
	typeQuery := `
		SELECT type, COUNT(*) as count
		FROM notifications
		WHERE user_id = $1
		GROUP BY type
		ORDER BY count DESC
	`
	rows, err := ns.db.Query(typeQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications by type: %v", err)
	}
	defer rows.Close()

	typeStats := make(map[string]int)
	for rows.Next() {
		var notificationType string
		var count int
		if err := rows.Scan(&notificationType, &count); err != nil {
			log.Printf("Error scanning type stats: %v", err)
			continue
		}
		typeStats[notificationType] = count
	}
	stats["by_type"] = typeStats

	// Recent notifications (last 7 days)
	var recent int
	err = ns.db.QueryRow(`
		SELECT COUNT(*) 
		FROM notifications 
		WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
	`, userID).Scan(&recent)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent notifications: %v", err)
	}
	stats["recent_7_days"] = recent

	return stats, nil
}

// sendEmailNotification sends an email notification (future extension)
func (ns *DatabaseNotificationService) sendEmailNotification(notification Notification) {
	// TODO: Implement SendGrid integration
	// This is a stub for future email notification functionality
	log.Printf("Email notification would be sent for notification %s to user %s", notification.ID, notification.UserID)
}

// Helper function to check if a slice contains a string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
