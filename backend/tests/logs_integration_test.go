package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/services/logger"
)

// Mock database for integration testing
type mockIntegrationDB struct {
	logs []mockLogEntry
}

type mockLogEntry struct {
	ID        int
	UserID    *uuid.UUID
	Role      string
	Action    string
	Metadata  string
	IPAddress string
	UserAgent string
	CreatedAt time.Time
}

func (m *mockIntegrationDB) Query(query string, args ...interface{}) (*mockIntegrationRows, error) {
	return &mockIntegrationRows{db: m}, nil
}

func (m *mockIntegrationDB) QueryRow(query string, args ...interface{}) *mockIntegrationRow {
	return &mockIntegrationRow{db: m}
}

func (m *mockIntegrationDB) Exec(query string, args ...interface{}) (mockIntegrationResult, error) {
	// Simulate log insertion
	if len(args) >= 6 {
		entry := mockLogEntry{
			ID:        len(m.logs) + 1,
			UserID:    args[0].(*uuid.UUID),
			Role:      args[1].(string),
			Action:    args[2].(string),
			Metadata:  args[3].(string),
			IPAddress: args[4].(string),
			UserAgent: args[5].(string),
			CreatedAt: time.Now(),
		}
		m.logs = append(m.logs, entry)
	}
	return mockIntegrationResult{}, nil
}

type mockIntegrationRows struct {
	db  *mockIntegrationDB
	pos int
}

func (m *mockIntegrationRows) Next() bool {
	return m.pos < len(m.db.logs)
}

func (m *mockIntegrationRows) Scan(dest ...interface{}) error {
	if m.pos >= len(m.db.logs) {
		return nil
	}
	entry := m.db.logs[m.pos]
	m.pos++

	// Populate destination fields
	if len(dest) >= 7 {
		*dest[0].(*int) = entry.ID
		*dest[1].(**uuid.UUID) = entry.UserID
		*dest[2].(*string) = entry.Role
		*dest[3].(*string) = entry.Action
		*dest[4].(*string) = entry.Metadata
		*dest[5].(*string) = entry.IPAddress
		*dest[6].(*string) = entry.UserAgent
		*dest[7].(*time.Time) = entry.CreatedAt
	}
	return nil
}

func (m *mockIntegrationRows) Close() error { return nil }

type mockIntegrationRow struct {
	db *mockIntegrationDB
}

func (m *mockIntegrationRow) Scan(dest ...interface{}) error {
	// Return mock stats
	if len(dest) >= 1 {
		*dest[0].(*int) = len(m.db.logs)
	}
	return nil
}

type mockIntegrationResult struct{}

func (m mockIntegrationResult) RowsAffected() (int64, error) { return 1, nil }

func TestLogWriteVerification(t *testing.T) {
	// Setup mock database
	mockDB := &mockIntegrationDB{logs: make([]mockLogEntry, 0)}

	// Create activity logger with mock DB
	activityLogger := &logger.ActivityLogger{}
	logsHandler := handlers.NewLogsHandler(activityLogger)

	t.Run("Farmer Action Logging", func(t *testing.T) {
		// Test farmer crop added action
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{
				{
					Action:    "FARMER_CROP_ADDED",
					Metadata:  map[string]interface{}{"crop": "maize", "quantity": 100},
					Timestamp: time.Now().Unix(),
					UserID:    stringPtrIntegration("farmer-123"),
					Role:      stringPtrIntegration("farmer"),
					SessionID: "session-farmer-001",
				},
			},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Forwarded-For", "192.168.1.100")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response handlers.LogsResponse
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, 1, response.Count)

		// Verify log entry was created
		assert.Len(t, mockDB.logs, 1)
		logEntry := mockDB.logs[0]
		assert.Equal(t, "farmer", logEntry.Role)
		assert.Equal(t, "FARMER_CROP_ADDED", logEntry.Action)
		assert.NotNil(t, logEntry.UserID)
		assert.NotZero(t, logEntry.CreatedAt)
		assert.Equal(t, "192.168.1.100", logEntry.IPAddress)
	})

	t.Run("NGO Action Logging", func(t *testing.T) {
		// Test NGO training created action
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{
				{
					Action:    "NGO_TRAINING_CREATED",
					Metadata:  map[string]interface{}{"training": "sustainable farming", "participants": 25},
					Timestamp: time.Now().Unix(),
					UserID:    stringPtrIntegration("ngo-456"),
					Role:      stringPtrIntegration("ngo"),
					SessionID: "session-ngo-002",
				},
			},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Real-IP", "10.0.0.50")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response handlers.LogsResponse
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, 1, response.Count)

		// Verify log entry was created
		assert.Len(t, mockDB.logs, 2)
		logEntry := mockDB.logs[1]
		assert.Equal(t, "ngo", logEntry.Role)
		assert.Equal(t, "NGO_TRAINING_CREATED", logEntry.Action)
		assert.NotNil(t, logEntry.UserID)
		assert.NotZero(t, logEntry.CreatedAt)
		assert.Equal(t, "10.0.0.50", logEntry.IPAddress)
	})

	t.Run("Trader Action Logging", func(t *testing.T) {
		// Test trader product listed action
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{
				{
					Action:    "TRADER_PRODUCT_LISTED",
					Metadata:  map[string]interface{}{"product": "wheat", "price": 50, "category": "grains"},
					Timestamp: time.Now().Unix(),
					UserID:    stringPtrIntegration("trader-789"),
					Role:      stringPtrIntegration("trader"),
					SessionID: "session-trader-003",
				},
			},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = "172.16.0.25:54321"

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response handlers.LogsResponse
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, 1, response.Count)

		// Verify log entry was created
		assert.Len(t, mockDB.logs, 3)
		logEntry := mockDB.logs[2]
		assert.Equal(t, "trader", logEntry.Role)
		assert.Equal(t, "TRADER_PRODUCT_LISTED", logEntry.Action)
		assert.NotNil(t, logEntry.UserID)
		assert.NotZero(t, logEntry.CreatedAt)
		assert.Contains(t, logEntry.IPAddress, "172.16.0.25")
	})

	t.Run("System Action Logging", func(t *testing.T) {
		// Test system error action
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{
				{
					Action:    "SYSTEM_ERROR",
					Metadata:  map[string]interface{}{"error": "Database connection failed", "component": "auth"},
					Timestamp: time.Now().Unix(),
					UserID:    nil, // System event
					Role:      nil,
					SessionID: "session-system-004",
				},
			},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response handlers.LogsResponse
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, 1, response.Count)

		// Verify log entry was created
		assert.Len(t, mockDB.logs, 4)
		logEntry := mockDB.logs[3]
		assert.Equal(t, "user", logEntry.Role) // Default role for system events
		assert.Equal(t, "SYSTEM_ERROR", logEntry.Action)
		assert.NotZero(t, logEntry.CreatedAt)
	})

	t.Run("Batch Event Logging", func(t *testing.T) {
		// Test multiple events in one request
		events := handlers.FrontendLogRequest{
			Events: []handlers.FrontendLogEvent{
				{
					Action:    "PAGE_VIEWED",
					Metadata:  map[string]interface{}{"page": "/dashboard"},
					Timestamp: time.Now().Unix(),
					UserID:    stringPtrIntegration("user-001"),
					Role:      stringPtrIntegration("farmer"),
					SessionID: "session-batch-001",
				},
				{
					Action:    "BUTTON_CLICKED",
					Metadata:  map[string]interface{}{"button": "submit"},
					Timestamp: time.Now().Unix(),
					UserID:    stringPtrIntegration("user-001"),
					Role:      stringPtrIntegration("farmer"),
					SessionID: "session-batch-001",
				},
				{
					Action:    "SEARCH_PERFORMED",
					Metadata:  map[string]interface{}{"query": "maize seeds", "results": 15},
					Timestamp: time.Now().Unix(),
					UserID:    stringPtrIntegration("user-001"),
					Role:      stringPtrIntegration("farmer"),
					SessionID: "session-batch-001",
				},
			},
		}

		jsonData, err := json.Marshal(events)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/logs", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		logsHandler.LogFrontendEvents(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response handlers.LogsResponse
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, 3, response.Count)

		// Verify all log entries were created
		assert.Len(t, mockDB.logs, 7) // 4 previous + 3 new

		// Check the last 3 entries
		for i := 4; i < 7; i++ {
			logEntry := mockDB.logs[i]
			assert.Equal(t, "farmer", logEntry.Role)
			assert.NotNil(t, logEntry.UserID)
			assert.NotZero(t, logEntry.CreatedAt)
			assert.NotEmpty(t, logEntry.Action)
		}
	})

	t.Run("Required Fields Validation", func(t *testing.T) {
		// Verify all required fields are populated
		for _, logEntry := range mockDB.logs {
			// These fields should NEVER be NULL/empty
			assert.NotEmpty(t, logEntry.Role, "Role should not be empty")
			assert.NotEmpty(t, logEntry.Action, "Action should not be empty")
			assert.NotZero(t, logEntry.CreatedAt, "CreatedAt should not be zero")
			assert.NotEmpty(t, logEntry.IPAddress, "IPAddress should not be empty")
			assert.NotEmpty(t, logEntry.UserAgent, "UserAgent should not be empty")

			// UserID can be NULL for system events, but if present, should be valid
			if logEntry.UserID != nil {
				assert.NotEqual(t, uuid.Nil, *logEntry.UserID, "UserID should be valid UUID if present")
			}
		}
	})
}

// Helper function to create string pointer
func stringPtrIntegration(s string) *string {
	return &s
}
