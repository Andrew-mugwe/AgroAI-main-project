package tests

import (
	"database/sql"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services/logger"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// SetupTestDB creates a test database connection
func SetupTestDB(t *testing.T) *sql.DB {
	// Use test database connection
	// In a real test environment, you would use a test database
	db, err := sql.Open("postgres", "postgres://postgres:postgres@localhost:5432/agroai_test?sslmode=disable")
	require.NoError(t, err, "Failed to connect to test database")

	// Test connection
	err = db.Ping()
	require.NoError(t, err, "Failed to ping test database")

	return db
}

// CleanupTestDB cleans up test database
func CleanupTestDB(t *testing.T, db *sql.DB) {
	// Clean up test data
	_, err := db.Exec("DELETE FROM activity_logs WHERE user_id IS NOT NULL")
	require.NoError(t, err, "Failed to cleanup test data")

	err = db.Close()
	require.NoError(t, err, "Failed to close test database")
}

func TestActivityLogger_LogAction(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	// Test data
	userID := uuid.New()
	role := "farmer"
	action := "LOGIN"
	metadata := map[string]interface{}{
		"login_time": time.Now().Unix(),
		"ip":         "192.168.1.1",
	}
	ip := "192.168.1.1"
	userAgent := "Mozilla/5.0 (Test Browser)"

	// Log action
	err := activityLogger.LogAction(&userID, role, action, metadata, ip, userAgent)
	assert.NoError(t, err, "LogAction should not return error")

	// Verify log was inserted
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE user_id = $1 AND action = $2", userID, action).Scan(&count)
	require.NoError(t, err, "Failed to query activity logs")
	assert.Equal(t, 1, count, "Should have exactly one log entry")
}

func TestActivityLogger_LogActionWithNilUserID(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	// Test system action (nil user ID)
	action := "SYSTEM_STARTUP"
	metadata := map[string]interface{}{
		"startup_time": time.Now().Unix(),
	}
	ip := "127.0.0.1"
	userAgent := "System"

	// Log system action
	err := activityLogger.LogAction(nil, "SYSTEM", action, metadata, ip, userAgent)
	assert.NoError(t, err, "LogAction should not return error for system actions")

	// Verify log was inserted
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE user_id IS NULL AND action = $1", action).Scan(&count)
	require.NoError(t, err, "Failed to query activity logs")
	assert.Equal(t, 1, count, "Should have exactly one system log entry")
}

func TestActivityLogger_LogActionWithMetadata(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	// Test complex metadata
	userID := uuid.New()
	metadata := map[string]interface{}{
		"order_id": "order_123",
		"amount":   99.99,
		"currency": "USD",
		"items":    []string{"item1", "item2"},
		"nested": map[string]interface{}{
			"key": "value",
		},
	}

	err := activityLogger.LogAction(&userID, "trader", "CREATE_ORDER", metadata, "192.168.1.1", "Test Agent")
	assert.NoError(t, err, "LogAction should handle complex metadata")

	// Verify metadata was stored correctly
	var storedMetadata []byte
	err = db.QueryRow("SELECT metadata FROM activity_logs WHERE user_id = $1", userID).Scan(&storedMetadata)
	require.NoError(t, err, "Failed to query metadata")

	var parsedMetadata map[string]interface{}
	err = json.Unmarshal(storedMetadata, &parsedMetadata)
	require.NoError(t, err, "Failed to parse stored metadata")

	assert.Equal(t, "order_123", parsedMetadata["order_id"], "Order ID should match")
	assert.Equal(t, 99.99, parsedMetadata["amount"], "Amount should match")
}

func TestActivityLogger_GetLogs(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	// Insert test data
	userID1 := uuid.New()
	userID2 := uuid.New()

	// Log multiple actions
	activityLogger.LogAction(&userID1, "farmer", "LOGIN", nil, "192.168.1.1", "Agent1")
	activityLogger.LogAction(&userID1, "farmer", "FETCH_WEATHER", nil, "192.168.1.1", "Agent1")
	activityLogger.LogAction(&userID2, "trader", "LOGIN", nil, "192.168.1.2", "Agent2")
	activityLogger.LogAction(&userID2, "trader", "CREATE_ORDER", nil, "192.168.1.2", "Agent2")

	// Test query by user
	query := logger.LogQuery{
		UserID: &userID1,
		Limit:  10,
	}
	logs, err := activityLogger.GetLogs(query)
	assert.NoError(t, err, "GetLogs should not return error")
	assert.Len(t, logs, 2, "Should return 2 logs for user1")

	// Test query by action
	query = logger.LogQuery{
		Action: "LOGIN",
		Limit:  10,
	}
	logs, err = activityLogger.GetLogs(query)
	assert.NoError(t, err, "GetLogs should not return error")
	assert.Len(t, logs, 2, "Should return 2 LOGIN logs")

	// Test query by role
	query = logger.LogQuery{
		Role:  "farmer",
		Limit: 10,
	}
	logs, err = activityLogger.GetLogs(query)
	assert.NoError(t, err, "GetLogs should not return error")
	assert.Len(t, logs, 2, "Should return 2 farmer logs")
}

func TestActivityLogger_GetLogsByUser(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	userID := uuid.New()

	// Log multiple actions for user
	activityLogger.LogAction(&userID, "farmer", "LOGIN", nil, "192.168.1.1", "Agent1")
	activityLogger.LogAction(&userID, "farmer", "FETCH_WEATHER", nil, "192.168.1.1", "Agent1")
	activityLogger.LogAction(&userID, "farmer", "CROP_ADVICE", nil, "192.168.1.1", "Agent1")

	// Get logs by user
	logs, err := activityLogger.GetLogsByUser(userID, 10)
	assert.NoError(t, err, "GetLogsByUser should not return error")
	assert.Len(t, logs, 3, "Should return 3 logs for user")

	// Verify logs are ordered by created_at DESC
	assert.Equal(t, "CROP_ADVICE", logs[0].Action, "Most recent log should be first")
	assert.Equal(t, "LOGIN", logs[2].Action, "Oldest log should be last")
}

func TestActivityLogger_GetLogStats(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	// Insert test data
	userID1 := uuid.New()
	userID2 := uuid.New()

	activityLogger.LogAction(&userID1, "farmer", "LOGIN", nil, "192.168.1.1", "Agent1")
	activityLogger.LogAction(&userID1, "farmer", "FETCH_WEATHER", nil, "192.168.1.1", "Agent1")
	activityLogger.LogAction(&userID2, "trader", "LOGIN", nil, "192.168.1.2", "Agent2")
	activityLogger.LogAction(&userID2, "trader", "CREATE_ORDER", nil, "192.168.1.2", "Agent2")

	// Get stats
	stats, err := activityLogger.GetLogStats()
	assert.NoError(t, err, "GetLogStats should not return error")

	// Verify stats
	assert.Equal(t, 4, stats["total_logs"], "Total logs should be 4")
	assert.Equal(t, 2, stats["recent_logs_24h"], "Recent logs should be 4")

	// Check logs by action
	actionStats := stats["logs_by_action"].(map[string]int)
	assert.Equal(t, 2, actionStats["LOGIN"], "Should have 2 LOGIN actions")
	assert.Equal(t, 1, actionStats["FETCH_WEATHER"], "Should have 1 FETCH_WEATHER action")

	// Check logs by role
	roleStats := stats["logs_by_role"].(map[string]int)
	assert.Equal(t, 2, roleStats["farmer"], "Should have 2 farmer logs")
	assert.Equal(t, 2, roleStats["trader"], "Should have 2 trader logs")
}

func TestActivityLogger_CleanupOldLogs(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)

	userID := uuid.New()

	// Insert old log (simulate by inserting with old timestamp)
	_, err := db.Exec(`
		INSERT INTO activity_logs (user_id, role, action, metadata, ip_address, user_agent, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, userID, "farmer", "OLD_ACTION", "{}", "192.168.1.1", "Agent", time.Now().Add(-25*time.Hour))

	require.NoError(t, err, "Failed to insert old log")

	// Insert recent log
	activityLogger.LogAction(&userID, "farmer", "RECENT_ACTION", nil, "192.168.1.1", "Agent")

	// Cleanup logs older than 24 hours
	rowsAffected, err := activityLogger.CleanupOldLogs(24 * time.Hour)
	assert.NoError(t, err, "CleanupOldLogs should not return error")
	assert.Equal(t, int64(1), rowsAffected, "Should cleanup 1 old log")

	// Verify only recent log remains
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE user_id = $1", userID).Scan(&count)
	require.NoError(t, err, "Failed to query remaining logs")
	assert.Equal(t, 1, count, "Should have 1 remaining log")
}

func TestActivityLoggerMiddleware_LogLogin(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)
	middleware := middleware.NewActivityLoggerMiddleware(activityLogger)

	// Create test request
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.Header.Set("User-Agent", "Test Browser")
	req.RemoteAddr = "192.168.1.1:12345"

	userID := uuid.New()
	role := "farmer"

	// Log login
	middleware.LogLogin(userID, role, req)

	// Wait a bit for async logging
	time.Sleep(100 * time.Millisecond)

	// Verify log was created
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE user_id = $1 AND action = $2", userID, "LOGIN").Scan(&count)
	require.NoError(t, err, "Failed to query login log")
	assert.Equal(t, 1, count, "Should have 1 login log")
}

func TestActivityLoggerMiddleware_LogSignup(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)
	middleware := middleware.NewActivityLoggerMiddleware(activityLogger)

	// Create test request
	req := httptest.NewRequest("POST", "/api/auth/signup", nil)
	req.Header.Set("User-Agent", "Test Browser")
	req.RemoteAddr = "192.168.1.1:12345"

	userID := uuid.New()
	role := "trader"

	// Log signup
	middleware.LogSignup(userID, role, req)

	// Wait a bit for async logging
	time.Sleep(100 * time.Millisecond)

	// Verify log was created
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE user_id = $1 AND action = $2", userID, "SIGNUP").Scan(&count)
	require.NoError(t, err, "Failed to query signup log")
	assert.Equal(t, 1, count, "Should have 1 signup log")
}

func TestActivityLoggerMiddleware_LogRoleChange(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)
	middleware := middleware.NewActivityLoggerMiddleware(activityLogger)

	// Create test request
	req := httptest.NewRequest("POST", "/api/user/role", nil)
	req.Header.Set("User-Agent", "Test Browser")
	req.RemoteAddr = "192.168.1.1:12345"

	userID := uuid.New()
	oldRole := "farmer"
	newRole := "trader"

	// Log role change
	middleware.LogRoleChange(userID, oldRole, newRole, req)

	// Wait a bit for async logging
	time.Sleep(100 * time.Millisecond)

	// Verify log was created
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE user_id = $1 AND action = $2", userID, "ROLE_CHANGE").Scan(&count)
	require.NoError(t, err, "Failed to query role change log")
	assert.Equal(t, 1, count, "Should have 1 role change log")

	// Verify metadata contains old and new roles
	var metadata []byte
	err = db.QueryRow("SELECT metadata FROM activity_logs WHERE user_id = $1 AND action = $2", userID, "ROLE_CHANGE").Scan(&metadata)
	require.NoError(t, err, "Failed to query role change metadata")

	var parsedMetadata map[string]interface{}
	err = json.Unmarshal(metadata, &parsedMetadata)
	require.NoError(t, err, "Failed to parse role change metadata")

	assert.Equal(t, oldRole, parsedMetadata["old_role"], "Old role should match")
	assert.Equal(t, newRole, parsedMetadata["new_role"], "New role should match")
}

func TestActivityLoggerMiddleware_GetClientIP(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger := logger.NewActivityLogger(db)
	middleware := middleware.NewActivityLoggerMiddleware(activityLogger)

	// Test X-Forwarded-For header
	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Forwarded-For", "203.0.113.195, 70.41.3.18, 150.172.238.178")
	req.RemoteAddr = "192.168.1.1:12345"

	middleware.LogSystemActivity("TEST_ACTION", nil, req)
	time.Sleep(100 * time.Millisecond)

	// Verify IP was extracted correctly
	var ip string
	err := db.QueryRow("SELECT ip_address FROM activity_logs WHERE action = $1", "TEST_ACTION").Scan(&ip)
	require.NoError(t, err, "Failed to query IP address")
	assert.Equal(t, "203.0.113.195", ip, "Should extract first IP from X-Forwarded-For")

	// Test X-Real-IP header
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.Header.Set("X-Real-IP", "203.0.113.195")
	req2.RemoteAddr = "192.168.1.1:12345"

	middleware.LogSystemActivity("TEST_ACTION2", nil, req2)
	time.Sleep(100 * time.Millisecond)

	// Verify IP was extracted correctly
	err = db.QueryRow("SELECT ip_address FROM activity_logs WHERE action = $1", "TEST_ACTION2").Scan(&ip)
	require.NoError(t, err, "Failed to query IP address")
	assert.Equal(t, "203.0.113.195", ip, "Should extract IP from X-Real-IP")
}

func TestActivityLogger_ErrorHandling(t *testing.T) {
	// Test with nil database (should not panic)
	activityLogger := logger.NewActivityLogger(nil)

	userID := uuid.New()
	err := activityLogger.LogAction(&userID, "farmer", "TEST", nil, "192.168.1.1", "Agent")
	assert.Error(t, err, "LogAction should return error with nil database")

	// Test with invalid metadata (should handle gracefully)
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	activityLogger = logger.NewActivityLogger(db)

	// Create metadata with invalid JSON (circular reference)
	invalidMetadata := make(map[string]interface{})
	invalidMetadata["self"] = invalidMetadata // This will cause JSON marshal to fail

	err = activityLogger.LogAction(&userID, "farmer", "TEST", invalidMetadata, "192.168.1.1", "Agent")
	// Should not return error, but should log warning
	assert.NoError(t, err, "LogAction should handle invalid metadata gracefully")
}
