package logger

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

// ActivityLogger handles activity logging operations
type ActivityLogger struct {
	db *sql.DB
}

// ActivityLog represents a single activity log entry
type ActivityLog struct {
	ID        int                    `json:"id"`
	UserID    *uuid.UUID             `json:"user_id,omitempty"`
	Role      string                 `json:"role"`
	Action    string                 `json:"action"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	IPAddress string                 `json:"ip_address,omitempty"`
	UserAgent string                 `json:"user_agent,omitempty"`
	CreatedAt time.Time              `json:"created_at"`
}

// LogQuery represents query parameters for filtering logs
type LogQuery struct {
	UserID    *uuid.UUID
	Role      string
	Action    string
	StartDate *time.Time
	EndDate   *time.Time
	Limit     int
	Offset    int
}

// LogStats represents statistics about activity logs
type LogStats struct {
	TotalLogs     int            `json:"total_logs"`
	RecentLogs24h int            `json:"recent_logs_24h"`
	LogsByAction  map[string]int `json:"logs_by_action"`
	LogsByRole    map[string]int `json:"logs_by_role"`
}

// NewActivityLogger creates a new activity logger instance
func NewActivityLogger(db *sql.DB) *ActivityLogger {
	return &ActivityLogger{
		db: db,
	}
}

// LogAction inserts a new activity log entry
func (al *ActivityLogger) LogAction(userID *uuid.UUID, role string, action string, metadata map[string]interface{}, ip string, userAgent string) error {
	// Convert metadata to JSON
	var metadataJSON []byte
	var err error

	if metadata != nil {
		metadataJSON, err = json.Marshal(metadata)
		if err != nil {
			log.Printf("Warning: Failed to marshal metadata for action %s: %v", action, err)
			metadataJSON = []byte("{}")
		}
	} else {
		metadataJSON = []byte("{}")
	}

	// Insert into database
	query := `
		INSERT INTO activity_logs (user_id, role, action, metadata, ip_address, user_agent, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`

	var id int
	var createdAt time.Time

	err = al.db.QueryRow(
		query,
		userID,
		role,
		action,
		metadataJSON,
		ip,
		userAgent,
		time.Now(),
	).Scan(&id, &createdAt)

	if err != nil {
		// Log error but don't break the request flow
		log.Printf("Error: Failed to log activity %s for user %v: %v", action, userID, err)
		return fmt.Errorf("failed to log activity: %v", err)
	}

	// Log successful insertion (for debugging)
	log.Printf("Activity logged: ID=%d, Action=%s, User=%v, Role=%s", id, action, userID, role)

	return nil
}

// GetLogs retrieves activity logs based on query parameters
func (al *ActivityLogger) GetLogs(query LogQuery) ([]ActivityLog, error) {
	baseQuery := `
		SELECT id, user_id, role, action, metadata, ip_address, user_agent, created_at
		FROM activity_logs
		WHERE 1=1
	`

	args := []interface{}{}
	argIndex := 1

	// Build WHERE clause dynamically
	if query.UserID != nil {
		baseQuery += fmt.Sprintf(" AND user_id = $%d", argIndex)
		args = append(args, *query.UserID)
		argIndex++
	}

	if query.Role != "" {
		baseQuery += fmt.Sprintf(" AND role = $%d", argIndex)
		args = append(args, query.Role)
		argIndex++
	}

	if query.Action != "" {
		baseQuery += fmt.Sprintf(" AND action = $%d", argIndex)
		args = append(args, query.Action)
		argIndex++
	}

	if query.StartDate != nil {
		baseQuery += fmt.Sprintf(" AND created_at >= $%d", argIndex)
		args = append(args, *query.StartDate)
		argIndex++
	}

	if query.EndDate != nil {
		baseQuery += fmt.Sprintf(" AND created_at <= $%d", argIndex)
		args = append(args, *query.EndDate)
		argIndex++
	}

	// Add ordering and pagination
	baseQuery += " ORDER BY created_at DESC"

	if query.Limit > 0 {
		baseQuery += fmt.Sprintf(" LIMIT $%d", argIndex)
		args = append(args, query.Limit)
		argIndex++
	}

	if query.Offset > 0 {
		baseQuery += fmt.Sprintf(" OFFSET $%d", argIndex)
		args = append(args, query.Offset)
		argIndex++
	}

	// Execute query
	rows, err := al.db.Query(baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query activity logs: %v", err)
	}
	defer rows.Close()

	var logs []ActivityLog
	for rows.Next() {
		var log ActivityLog
		var metadataJSON []byte
		var userID *uuid.UUID

		err := rows.Scan(
			&log.ID,
			&userID,
			&log.Role,
			&log.Action,
			&metadataJSON,
			&log.IPAddress,
			&log.UserAgent,
			&log.CreatedAt,
		)
		if err != nil {
			fmt.Printf("Error scanning activity log row: %v", err)
			continue
		}

		log.UserID = userID

		// Parse metadata JSON
		if len(metadataJSON) > 0 {
			err = json.Unmarshal(metadataJSON, &log.Metadata)
			if err != nil {
				fmt.Printf("Warning: Failed to unmarshal metadata for log ID %d: %v", log.ID, err)
				log.Metadata = make(map[string]interface{})
			}
		} else {
			log.Metadata = make(map[string]interface{})
		}

		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating activity log rows: %v", err)
	}

	return logs, nil
}

// GetLogsByUser retrieves activity logs for a specific user
func (al *ActivityLogger) GetLogsByUser(userID uuid.UUID, limit int) ([]ActivityLog, error) {
	query := LogQuery{
		UserID: &userID,
		Limit:  limit,
	}
	return al.GetLogs(query)
}

// GetLogsByAction retrieves activity logs for a specific action
func (al *ActivityLogger) GetLogsByAction(action string, limit int) ([]ActivityLog, error) {
	query := LogQuery{
		Action: action,
		Limit:  limit,
	}
	return al.GetLogs(query)
}

// GetLogsByRole retrieves activity logs for a specific role
func (al *ActivityLogger) GetLogsByRole(role string, limit int) ([]ActivityLog, error) {
	query := LogQuery{
		Role:  role,
		Limit: limit,
	}
	return al.GetLogs(query)
}

// GetRecentLogs retrieves the most recent activity logs
func (al *ActivityLogger) GetRecentLogs(limit int) ([]ActivityLog, error) {
	query := LogQuery{
		Limit: limit,
	}
	return al.GetLogs(query)
}

// GetLogStats returns statistics about activity logs
func (al *ActivityLogger) GetLogStats() (*LogStats, error) {
	stats := &LogStats{
		LogsByAction: make(map[string]int),
		LogsByRole:   make(map[string]int),
	}

	// Total logs count
	err := al.db.QueryRow("SELECT COUNT(*) FROM activity_logs").Scan(&stats.TotalLogs)
	if err != nil {
		return nil, fmt.Errorf("failed to get total logs count: %v", err)
	}

	// Logs by action
	actionQuery := `
		SELECT action, COUNT(*) as count
		FROM activity_logs
		GROUP BY action
		ORDER BY count DESC
		LIMIT 10
	`
	rows, err := al.db.Query(actionQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get logs by action: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var action string
		var count int
		if err := rows.Scan(&action, &count); err != nil {
			log.Printf("Error scanning action stats: %v", err)
			continue
		}
		stats.LogsByAction[action] = count
	}

	// Logs by role
	roleQuery := `
		SELECT role, COUNT(*) as count
		FROM activity_logs
		GROUP BY role
		ORDER BY count DESC
	`
	rows, err = al.db.Query(roleQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get logs by role: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var role string
		var count int
		if err := rows.Scan(&role, &count); err != nil {
			log.Printf("Error scanning role stats: %v", err)
			continue
		}
		stats.LogsByRole[role] = count
	}

	// Recent activity (last 24 hours)
	err = al.db.QueryRow(`
		SELECT COUNT(*) 
		FROM activity_logs 
		WHERE created_at >= NOW() - INTERVAL '24 hours'
	`).Scan(&stats.RecentLogs24h)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent logs count: %v", err)
	}

	return stats, nil
}

// CleanupOldLogs removes logs older than the specified duration
func (al *ActivityLogger) CleanupOldLogs(olderThan time.Duration) (int64, error) {
	query := `
		DELETE FROM activity_logs 
		WHERE created_at < $1
	`

	result, err := al.db.Exec(query, time.Now().Add(-olderThan))
	if err != nil {
		return 0, fmt.Errorf("failed to cleanup old logs: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %v", err)
	}

	log.Printf("Cleaned up %d old activity logs (older than %v)", rowsAffected, olderThan)
	return rowsAffected, nil
}
