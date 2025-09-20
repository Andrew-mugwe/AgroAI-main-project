package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services/messaging"
)

// MessageHandler handles messaging HTTP requests
type MessageHandler struct {
	messagingService *messaging.MessagingService
}

// NewMessageHandler creates a new message handler
func NewMessageHandler(messagingService *messaging.MessagingService) *MessageHandler {
	return &MessageHandler{messagingService: messagingService}
}

// getMaxMessageLength returns the maximum message length from environment
func getMaxMessageLength() int {
	maxLength := os.Getenv("MAX_MESSAGE_LENGTH")
	if maxLength == "" {
		return 500 // default
	}
	if length, err := strconv.Atoi(maxLength); err == nil {
		return length
	}
	return 500 // fallback
}

// validateMessage validates message content
func validateMessage(body string) error {
	// Check if message is empty
	if strings.TrimSpace(body) == "" {
		return &ValidationError{Field: "body", Message: "Message body cannot be empty"}
	}

	// Check message length
	maxLength := getMaxMessageLength()
	if len(body) > maxLength {
		return &ValidationError{
			Field:   "body",
			Message: fmt.Sprintf("Message too long. Maximum length is %d characters", maxLength),
		}
	}

	// Basic content validation (no malicious content)
	if strings.Contains(strings.ToLower(body), "<script>") {
		return &ValidationError{Field: "body", Message: "Message contains invalid content"}
	}

	return nil
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e *ValidationError) Error() string {
	return e.Message
}

// SendMessageRequest represents the request to send a message
type SendMessageRequest struct {
	ConversationID *int    `json:"conversation_id,omitempty"`
	ReceiverID     *string `json:"receiver_id,omitempty"`
	Body           string  `json:"body"`
	RoleScope      *string `json:"role_scope,omitempty"`
}

// SendMessageResponse represents the response after sending a message
type SendMessageResponse struct {
	Success        bool   `json:"success"`
	Message        string `json:"message"`
	MessageID      int    `json:"message_id,omitempty"`
	ConversationID int    `json:"conversation_id,omitempty"`
}

// MessagesResponse represents the response for getting messages
type MessagesResponse struct {
	Success   bool                `json:"success"`
	Messages  []messaging.Message `json:"messages"`
	HasMore   bool                `json:"has_more"`
	NextAfter *time.Time          `json:"next_after,omitempty"`
}

// ConversationsResponse represents the response for getting conversations
type ConversationsResponse struct {
	Success       bool                            `json:"success"`
	Conversations []messaging.ConversationPreview `json:"conversations"`
}

// SendMessage sends a message to a conversation or creates a new conversation
func (mh *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate message content
	if err := validateMessage(req.Body); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
			"field":   err.(*ValidationError).Field,
		})
		return
	}

	ctx := r.Context()
	var conversationID int
	var err error

	// Determine conversation to send to
	if req.ConversationID != nil {
		// Send to existing conversation
		conversationID = *req.ConversationID

		// Validate user has access to this conversation
		if err = mh.messagingService.ValidateUserAccess(ctx, claims.UserID, conversationID); err != nil {
			http.Error(w, "Access denied to conversation", http.StatusForbidden)
			return
		}
	} else if req.ReceiverID != nil {
		// Create or find direct conversation
		conversationID, err = mh.messagingService.FindOrCreateDirectConversation(ctx, claims.UserID, *req.ReceiverID)
		if err != nil {
			http.Error(w, "Failed to create conversation", http.StatusInternalServerError)
			return
		}
	} else if req.RoleScope != nil {
		// Create or find role-based group conversation
		// For now, we'll create a simple group conversation
		// In a full implementation, you'd query users by role and create appropriate groups
		http.Error(w, "Role-based conversations not yet implemented", http.StatusNotImplemented)
		return
	} else {
		http.Error(w, "Either conversation_id, receiver_id, or role_scope must be provided", http.StatusBadRequest)
		return
	}

	// Send the message
	messageID, err := mh.messagingService.SendMessage(ctx, conversationID, claims.UserID, req.Body)
	if err != nil {
		http.Error(w, "Failed to send message", http.StatusInternalServerError)
		return
	}

	response := SendMessageResponse{
		Success:        true,
		Message:        "Message sent successfully",
		MessageID:      messageID,
		ConversationID: conversationID,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetConversationMessages retrieves messages for a conversation
func (mh *MessageHandler) GetConversationMessages(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get conversation ID from URL
	vars := mux.Vars(r)
	conversationIDStr, ok := vars["conversation_id"]
	if !ok {
		http.Error(w, "Conversation ID is required", http.StatusBadRequest)
		return
	}

	conversationID, err := strconv.Atoi(conversationIDStr)
	if err != nil {
		http.Error(w, "Invalid conversation ID", http.StatusBadRequest)
		return
	}

	// Validate user has access to this conversation
	ctx := r.Context()
	if err = mh.messagingService.ValidateUserAccess(ctx, claims.UserID, conversationID); err != nil {
		http.Error(w, "Access denied to conversation", http.StatusForbidden)
		return
	}

	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	limit := 50 // default limit
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	var afterTimestamp *time.Time
	if afterStr := r.URL.Query().Get("after"); afterStr != "" {
		if parsedTime, err := time.Parse(time.RFC3339, afterStr); err == nil {
			afterTimestamp = &parsedTime
		}
	}

	// Get messages
	messages, err := mh.messagingService.GetConversationMessages(ctx, conversationID, limit, afterTimestamp)
	if err != nil {
		http.Error(w, "Failed to get messages", http.StatusInternalServerError)
		return
	}

	// Determine if there are more messages
	hasMore := len(messages) == limit
	var nextAfter *time.Time
	if hasMore && len(messages) > 0 {
		nextAfter = &messages[len(messages)-1].CreatedAt
	}

	response := MessagesResponse{
		Success:   true,
		Messages:  messages,
		HasMore:   hasMore,
		NextAfter: nextAfter,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetUserConversations retrieves conversations for the authenticated user
func (mh *MessageHandler) GetUserConversations(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get conversations
	ctx := r.Context()
	conversations, err := mh.messagingService.GetUserConversations(ctx, claims.UserID)
	if err != nil {
		http.Error(w, "Failed to get conversations", http.StatusInternalServerError)
		return
	}

	response := ConversationsResponse{
		Success:       true,
		Conversations: conversations,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateConversation creates a new conversation
func (mh *MessageHandler) CreateConversation(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Type      string   `json:"type"`
		MemberIDs []string `json:"member_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Type != "direct" && req.Type != "group" {
		http.Error(w, "Invalid conversation type", http.StatusBadRequest)
		return
	}

	if len(req.MemberIDs) < 1 {
		http.Error(w, "At least one member is required", http.StatusBadRequest)
		return
	}

	// Add current user to members if not already included
	memberIDs := req.MemberIDs
	userIncluded := false
	for _, id := range memberIDs {
		if id == claims.UserID {
			userIncluded = true
			break
		}
	}
	if !userIncluded {
		memberIDs = append(memberIDs, claims.UserID)
	}

	// Create conversation
	ctx := r.Context()
	conversationID, err := mh.messagingService.CreateConversation(ctx, req.Type, memberIDs)
	if err != nil {
		http.Error(w, "Failed to create conversation", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success":         true,
		"message":         "Conversation created successfully",
		"conversation_id": conversationID,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
