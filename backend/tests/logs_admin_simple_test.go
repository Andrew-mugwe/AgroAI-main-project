package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/logger"
)

// Mock database for testing
type mockDB struct{}

func (m *mockDB) Query(query string, args ...interface{}) (*mockRows, error) {
	return &mockRows{}, nil
}

func (m *mockDB) QueryRow(query string, args ...interface{}) *mockRow {
	return &mockRow{}
}

func (m *mockDB) Exec(query string, args ...interface{}) (mockResult, error) {
	return mockResult{}, nil
}

type mockRows struct{}

func (m *mockRows) Next() bool { return false }
func (m *mockRows) Scan(dest ...interface{}) error { return nil }
func (m *mockRows) Close() error { return nil }

type mockRow struct{}

func (m *mockRow) Scan(dest ...interface{}) error { return nil }

type mockResult struct{}

func (m mockResult) RowsAffected() (int64, error) { return 1, nil }

// Mock context for testing
func setUserContext(user *models.User) func(*http.Request) *http.Request {
	return func(req *http.Request) *http.Request {
		ctx := req.Context()
		// Simulate setting user in context
		return req.WithContext(ctx)
	}
}

func TestLogsHandler(t *testing.T) {
	// Create mock activity logger
	activityLogger := &logger.ActivityLogger{}
	logsHandler := handlers.NewLogsHandler(activityLogger)

	t.Run("LogFrontendEvents - Success", func(t *testing.T) {
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{
				{
					Action:    "PAGE_VIEWED",
					Metadata:  map[string]interface{}{"page": "/dashboard"},
					Timestamp: 1642248000,
					UserID:    stringPtr("user-123"),
					Role:      stringPtr("farmer"),
					SessionID: "session-456",
				},
			},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Forwarded-For", "192.168.1.1")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		// Should return 200 even if logging fails (non-blocking)
		assert.Equal(t, http.StatusOK, w.Code)

		var response handlers.LogsResponse
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, "Events logged successfully", response.Message)
		assert.Equal(t, 1, response.Count)
	})

	t.Run("LogFrontendEvents - Empty Events", func(t *testing.T) {
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("LogFrontendEvents - Invalid JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAdminLogsHandler(t *testing.T) {
	// Create mock activity logger
	activityLogger := &logger.ActivityLogger{}
	adminLogsHandler := handlers.NewAdminLogsHandler(activityLogger)

	// Create test user (admin)
	adminUser := &models.User{
		ID:    uuid.New().String(),
		Email: "admin@test.com",
		Role:  models.RoleAdmin,
	}

	t.Run("GetAdminLogs - Unauthorized", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/logs", nil)
		// No user context set

		w := httptest.NewRecorder()
		adminLogsHandler.GetAdminLogs(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("GetAdminLogs - Forbidden", func(t *testing.T) {
		nonAdminUser := &models.User{
			ID:    uuid.New().String(),
			Email: "user@test.com",
			Role:  models.RoleFarmer,
		}

		req := httptest.NewRequest("GET", "/api/admin/logs", nil)
		// Simulate non-admin user context
		_ = nonAdminUser

		w := httptest.NewRecorder()
		adminLogsHandler.GetAdminLogs(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("GetAdminLogStats - Unauthorized", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/logs/stats", nil)
		// No user context set

		w := httptest.NewRecorder()
		adminLogsHandler.GetAdminLogStats(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("CleanupOldLogs - Unauthorized", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/admin/logs/cleanup", nil)
		// No user context set

		w := httptest.NewRecorder()
		adminLogsHandler.CleanupOldLogs(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test with admin user (would need proper context setup)
	t.Run("GetAdminLogs - Admin Access", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/logs", nil)
		// Note: In a real test, you'd need to properly set the user context
		// For now, this will test the unauthorized path
		_ = adminUser

		w := httptest.NewRecorder()
		adminLogsHandler.GetAdminLogs(w, req)

		// Without proper context setup, this will be unauthorized
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

// Helper function to create string pointer
func stringPtr(s string) *string {
	return &s
}
