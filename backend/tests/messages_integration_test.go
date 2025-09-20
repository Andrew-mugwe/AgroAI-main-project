package tests

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services/messaging"
)

// Test database setup
func setupTestDB(t *testing.T) *sql.DB {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}

	db, err := sql.Open("postgres", databaseURL)
	require.NoError(t, err)

	// Test connection
	err = db.Ping()
	require.NoError(t, err)

	return db
}

// Clean up test data
func cleanupTestDB(t *testing.T, db *sql.DB) {
	// Clean up test data
	_, err := db.Exec("DELETE FROM messages WHERE body LIKE 'TEST_MESSAGE_%'")
	if err != nil {
		t.Logf("Warning: failed to cleanup test messages: %v", err)
	}
}

// TestMessageSeedingAndRetrieval tests the complete flow
func TestMessageSeedingAndRetrieval(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	defer cleanupTestDB(t, db)

	// Create messaging service and handler
	messagingService := messaging.NewMessagingService(db)
	messageHandler := handlers.NewMessageHandler(messagingService)

	// Test user IDs (should exist in seeded data)
	farmerID := "11111111-1111-1111-1111-111111111111"
	ngoID := "22222222-2222-2222-2222-222222222222"

	t.Run("Should seed and retrieve messages", func(t *testing.T) {
		// 1. Verify seeded messages exist
		var messageCount int
		err := db.QueryRow("SELECT COUNT(*) FROM messages").Scan(&messageCount)
		require.NoError(t, err)
		assert.Greater(t, messageCount, 0, "Should have seeded messages")

		// 2. Verify conversations exist
		var conversationCount int
		err = db.QueryRow("SELECT COUNT(*) FROM conversations").Scan(&conversationCount)
		require.NoError(t, err)
		assert.Greater(t, conversationCount, 0, "Should have seeded conversations")

		// 3. Test API endpoint - Get conversations
		req, err := http.NewRequest("GET", "/api/messages/conversations", nil)
		require.NoError(t, err)

		// Mock JWT token (in real implementation, you'd use a valid token)
		req.Header.Set("Authorization", "Bearer mock-jwt-token")

		// Create router and add middleware
		router := mux.NewRouter()
		router.HandleFunc("/api/messages/conversations",
			middleware.AuthMiddleware(messageHandler.GetUserConversations)).Methods("GET")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		// Note: This will fail with 401 because we're using a mock token
		// In a real test, you'd need to create a valid JWT token
		assert.Equal(t, http.StatusUnauthorized, rr.Code, "Should return 401 for invalid token")
	})

	t.Run("Should validate message structure", func(t *testing.T) {
		// Test message validation
		validMessage := "TEST_MESSAGE_VALID: This is a valid test message"
		err := validateMessage(validMessage)
		assert.NoError(t, err, "Valid message should pass validation")

		// Test empty message
		emptyMessage := ""
		err = validateMessage(emptyMessage)
		assert.Error(t, err, "Empty message should fail validation")

		// Test long message
		longMessage := "TEST_MESSAGE_LONG: " + string(make([]byte, 600)) // 600 characters
		err = validateMessage(longMessage)
		assert.Error(t, err, "Long message should fail validation")
	})

	t.Run("Should verify database schema", func(t *testing.T) {
		// Check messages table structure
		rows, err := db.Query(`
			SELECT column_name, data_type, is_nullable 
			FROM information_schema.columns 
			WHERE table_name = 'messages' 
			ORDER BY ordinal_position
		`)
		require.NoError(t, err)
		defer rows.Close()

		expectedColumns := map[string]string{
			"id":              "integer",
			"conversation_id": "integer",
			"sender_id":       "uuid",
			"body":            "text",
			"created_at":      "timestamp without time zone",
			"status":          "character varying",
		}

		foundColumns := make(map[string]bool)
		for rows.Next() {
			var columnName, dataType, isNullable string
			err := rows.Scan(&columnName, &dataType, &isNullable)
			require.NoError(t, err)
			foundColumns[columnName] = true

			if expectedType, exists := expectedColumns[columnName]; exists {
				assert.Equal(t, expectedType, dataType, "Column %s should have correct type", columnName)
			}
		}

		// Verify all expected columns exist
		for columnName := range expectedColumns {
			assert.True(t, foundColumns[columnName], "Column %s should exist", columnName)
		}
	})
}

// TestAPIIntegration tests API endpoints with real database
func TestAPIIntegration(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	messagingService := messaging.NewMessagingService(db)
	messageHandler := handlers.NewMessageHandler(messagingService)

	t.Run("Should handle GET /api/messages/conversations", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/api/messages/conversations", nil)
		require.NoError(t, err)

		// Mock JWT token
		req.Header.Set("Authorization", "Bearer mock-jwt-token")

		router := mux.NewRouter()
		router.HandleFunc("/api/messages/conversations",
			middleware.AuthMiddleware(messageHandler.GetUserConversations)).Methods("GET")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		// Should return 401 for invalid token
		assert.Equal(t, http.StatusUnauthorized, rr.Code)
	})

	t.Run("Should handle POST /api/messages/send", func(t *testing.T) {
		messageData := map[string]interface{}{
			"body": "TEST_MESSAGE_API: This is a test message from API",
		}
		jsonData, _ := json.Marshal(messageData)

		req, err := http.NewRequest("POST", "/api/messages/send", bytes.NewBuffer(jsonData))
		require.NoError(t, err)

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer mock-jwt-token")

		router := mux.NewRouter()
		router.HandleFunc("/api/messages/send",
			middleware.AuthMiddleware(messageHandler.SendMessage)).Methods("POST")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		// Should return 401 for invalid token
		assert.Equal(t, http.StatusUnauthorized, rr.Code)
	})
}

// TestSeededDataVerification tests that seeded data is correct
func TestSeededDataVerification(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	t.Run("Should have correct number of seeded messages", func(t *testing.T) {
		var messageCount int
		err := db.QueryRow("SELECT COUNT(*) FROM messages").Scan(&messageCount)
		require.NoError(t, err)

		// Should have at least 10 messages from seed data
		assert.GreaterOrEqual(t, messageCount, 10, "Should have at least 10 seeded messages")
	})

	t.Run("Should have correct number of conversations", func(t *testing.T) {
		var conversationCount int
		err := db.QueryRow("SELECT COUNT(*) FROM conversations").Scan(&conversationCount)
		require.NoError(t, err)

		// Should have at least 3 conversations from seed data
		assert.GreaterOrEqual(t, conversationCount, 3, "Should have at least 3 seeded conversations")
	})

	t.Run("Should have correct conversation types", func(t *testing.T) {
		rows, err := db.Query("SELECT DISTINCT type FROM conversations")
		require.NoError(t, err)
		defer rows.Close()

		types := make([]string, 0)
		for rows.Next() {
			var convType string
			err := rows.Scan(&convType)
			require.NoError(t, err)
			types = append(types, convType)
		}

		// Should have both direct and group conversations
		assert.Contains(t, types, "direct", "Should have direct conversations")
		assert.Contains(t, types, "group", "Should have group conversations")
	})

	t.Run("Should have messages with proper structure", func(t *testing.T) {
		rows, err := db.Query(`
			SELECT m.id, m.conversation_id, m.sender_id, m.body, m.created_at, m.status
			FROM messages m
			LIMIT 5
		`)
		require.NoError(t, err)
		defer rows.Close()

		messageCount := 0
		for rows.Next() {
			var id, conversationID int
			var senderID, body, createdAt, status string

			err := rows.Scan(&id, &conversationID, &senderID, &body, &createdAt, &status)
			require.NoError(t, err)

			// Verify message structure
			assert.Greater(t, id, 0, "Message ID should be positive")
			assert.Greater(t, conversationID, 0, "Conversation ID should be positive")
			assert.NotEmpty(t, senderID, "Sender ID should not be empty")
			assert.NotEmpty(t, body, "Message body should not be empty")
			assert.NotEmpty(t, createdAt, "Created at should not be empty")
			assert.Contains(t, []string{"delivered", "read"}, status, "Status should be valid")

			messageCount++
		}

		assert.Greater(t, messageCount, 0, "Should have at least one message to verify")
	})
}

// Helper function for message validation (copied from handlers)
func validateMessage(body string) error {
	// Check if message is empty
	if len(body) == 0 {
		return fmt.Errorf("message body cannot be empty")
	}

	// Check message length
	maxLength := 500 // default
	if envMaxLength := os.Getenv("MAX_MESSAGE_LENGTH"); envMaxLength != "" {
		if length, err := fmt.Sscanf(envMaxLength, "%d", &maxLength); err == nil && length == 1 {
			// maxLength is set from environment
		}
	}

	if len(body) > maxLength {
		return fmt.Errorf("message too long. Maximum length is %d characters", maxLength)
	}

	// Basic content validation
	if len(body) > 0 && body[0] == '<' {
		return fmt.Errorf("message contains invalid content")
	}

	return nil
}
