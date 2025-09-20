package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/services/messaging"
)

// MarketplaceMessageHandler handles marketplace messaging HTTP requests
type MarketplaceMessageHandler struct {
	marketplaceService *messaging.MarketplaceMessagingService
}

// NewMarketplaceMessageHandler creates a new marketplace message handler
func NewMarketplaceMessageHandler(marketplaceService *messaging.MarketplaceMessagingService) *MarketplaceMessageHandler {
	return &MarketplaceMessageHandler{
		marketplaceService: marketplaceService,
	}
}

// CreateThreadResponse represents the response for thread creation
type CreateThreadResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	ThreadRef string `json:"thread_ref,omitempty"`
	Error     string `json:"error,omitempty"`
}

// MarketplaceSendMessageResponse represents the response for sending a marketplace message
type MarketplaceSendMessageResponse struct {
	Success bool                          `json:"success"`
	Message string                        `json:"message"`
	Data    *messaging.MarketplaceMessage `json:"data,omitempty"`
	Error   string                        `json:"error,omitempty"`
}

// GetMessagesResponse represents the response for getting messages
type GetMessagesResponse struct {
	Success bool                            `json:"success"`
	Message string                          `json:"message"`
	Data    []*messaging.MarketplaceMessage `json:"data,omitempty"`
	Error   string                          `json:"error,omitempty"`
}

// GetThreadsResponse represents the response for getting user threads
type GetThreadsResponse struct {
	Success bool                           `json:"success"`
	Message string                         `json:"message"`
	Data    []*messaging.MarketplaceThread `json:"data,omitempty"`
	Error   string                         `json:"error,omitempty"`
}

// GetThreadInfoResponse represents the response for getting thread info
type GetThreadInfoResponse struct {
	Success bool                         `json:"success"`
	Message string                       `json:"message"`
	Data    *messaging.MarketplaceThread `json:"data,omitempty"`
	Error   string                       `json:"error,omitempty"`
}

// EscalateThreadResponse represents the response for escalating a thread
type EscalateThreadResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// CreateThread handles POST /api/marketplace/thread
func (mmh *MarketplaceMessageHandler) CreateThread(w http.ResponseWriter, r *http.Request) {
	var req messaging.CreateThreadRequest

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.ProductID == nil && req.OrderID == nil {
		respondWithError(w, http.StatusBadRequest, "Either product_id or order_id must be provided")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Create or get thread
	threadRef, err := mmh.marketplaceService.CreateThread(r.Context(), &req, userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create thread: "+err.Error())
		return
	}

	// Return success response
	response := CreateThreadResponse{
		Success:   true,
		Message:   "Thread created or retrieved successfully",
		ThreadRef: threadRef,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// SendMessage handles POST /api/marketplace/thread/:threadRef/message
func (mmh *MarketplaceMessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	threadRef := vars["threadRef"]

	if threadRef == "" {
		respondWithError(w, http.StatusBadRequest, "Thread reference is required")
		return
	}

	var req messaging.SendMessageRequest

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate message body
	if strings.TrimSpace(req.Body) == "" {
		respondWithError(w, http.StatusBadRequest, "Message body cannot be empty")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Send message
	message, err := mmh.marketplaceService.SendMessage(r.Context(), threadRef, userID, &req)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to send message: "+err.Error())
		return
	}

	// Return success response
	response := MarketplaceSendMessageResponse{
		Success: true,
		Message: "Message sent successfully",
		Data:    message,
	}

	respondWithJSON(w, http.StatusCreated, response)
}

// GetThreadMessages handles GET /api/marketplace/thread/:threadRef/messages
func (mmh *MarketplaceMessageHandler) GetThreadMessages(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	threadRef := vars["threadRef"]

	if threadRef == "" {
		respondWithError(w, http.StatusBadRequest, "Thread reference is required")
		return
	}

	// Get query parameters
	limitStr := r.URL.Query().Get("limit")
	afterStr := r.URL.Query().Get("after")

	// Set default limit
	limit := 50
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	// Parse after cursor
	var afterCursor *time.Time
	if afterStr != "" {
		if parsedTime, err := time.Parse(time.RFC3339, afterStr); err == nil {
			afterCursor = &parsedTime
		}
	}

	// Get user ID from context for access validation
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Get thread info to validate access
	threadInfo, err := mmh.marketplaceService.GetThreadInfo(r.Context(), threadRef)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Thread not found")
		return
	}

	// Check if user is a participant
	if userID != threadInfo.BuyerID && userID != threadInfo.SellerID {
		// Check if user is a participant via the participants table
		participants, err := mmh.marketplaceService.GetThreadParticipants(r.Context(), threadRef)
		if err != nil {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}

		isParticipant := false
		for _, participant := range participants {
			if participant.UserID == userID {
				isParticipant = true
				break
			}
		}

		if !isParticipant {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	}

	// Get messages
	messages, err := mmh.marketplaceService.GetThreadMessages(r.Context(), threadRef, limit, afterCursor)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get messages: "+err.Error())
		return
	}

	// Mark thread as read for this user
	if err := mmh.marketplaceService.MarkThreadAsRead(r.Context(), threadRef, userID); err != nil {
		// Log error but don't fail the request
		fmt.Printf("Warning: failed to mark thread as read: %v\n", err)
	}

	// Return success response
	response := GetMessagesResponse{
		Success: true,
		Message: "Messages retrieved successfully",
		Data:    messages,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// GetUserThreads handles GET /api/marketplace/threads
func (mmh *MarketplaceMessageHandler) GetUserThreads(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Get user threads
	threads, err := mmh.marketplaceService.GetUserThreads(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get threads: "+err.Error())
		return
	}

	// Return success response
	response := GetThreadsResponse{
		Success: true,
		Message: "Threads retrieved successfully",
		Data:    threads,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// GetThreadInfo handles GET /api/marketplace/thread/:threadRef
func (mmh *MarketplaceMessageHandler) GetThreadInfo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	threadRef := vars["threadRef"]

	if threadRef == "" {
		respondWithError(w, http.StatusBadRequest, "Thread reference is required")
		return
	}

	// Get user ID from context for access validation
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Get thread info
	threadInfo, err := mmh.marketplaceService.GetThreadInfo(r.Context(), threadRef)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Thread not found")
		return
	}

	// Check if user is a participant
	if userID != threadInfo.BuyerID && userID != threadInfo.SellerID {
		// Check if user is a participant via the participants table
		participants, err := mmh.marketplaceService.GetThreadParticipants(r.Context(), threadRef)
		if err != nil {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}

		isParticipant := false
		for _, participant := range participants {
			if participant.UserID == userID {
				isParticipant = true
				break
			}
		}

		if !isParticipant {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	}

	// Return success response
	response := GetThreadInfoResponse{
		Success: true,
		Message: "Thread info retrieved successfully",
		Data:    threadInfo,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// EscalateThread handles POST /api/marketplace/thread/:threadRef/escalate
func (mmh *MarketplaceMessageHandler) EscalateThread(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	threadRef := vars["threadRef"]

	if threadRef == "" {
		respondWithError(w, http.StatusBadRequest, "Thread reference is required")
		return
	}

	var req messaging.EscalateThreadRequest

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate reason
	if strings.TrimSpace(req.Reason) == "" {
		respondWithError(w, http.StatusBadRequest, "Escalation reason is required")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Validate user has access to escalate this thread
	threadInfo, err := mmh.marketplaceService.GetThreadInfo(r.Context(), threadRef)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Thread not found")
		return
	}

	// Only buyer or seller can escalate
	if userID != threadInfo.BuyerID && userID != threadInfo.SellerID {
		respondWithError(w, http.StatusForbidden, "Only thread participants can escalate")
		return
	}

	// Escalate thread
	err = mmh.marketplaceService.EscalateThread(r.Context(), threadRef, userID, req.Reason)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to escalate thread: "+err.Error())
		return
	}

	// Return success response
	response := EscalateThreadResponse{
		Success: true,
		Message: "Thread escalated successfully",
	}

	respondWithJSON(w, http.StatusOK, response)
}

// AddParticipant handles POST /api/marketplace/thread/:threadRef/participants
func (mmh *MarketplaceMessageHandler) AddParticipant(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	threadRef := vars["threadRef"]

	if threadRef == "" {
		respondWithError(w, http.StatusBadRequest, "Thread reference is required")
		return
	}

	var req struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.UserID == "" || req.Role == "" {
		respondWithError(w, http.StatusBadRequest, "User ID and role are required")
		return
	}

	// Parse user ID
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID format")
		return
	}

	// Validate role
	validRoles := []string{"buyer", "seller", "ngo", "admin"}
	validRole := false
	for _, role := range validRoles {
		if req.Role == role {
			validRole = true
			break
		}
	}
	if !validRole {
		respondWithError(w, http.StatusBadRequest, "Invalid role. Must be one of: buyer, seller, ngo, admin")
		return
	}

	// Get current user ID from context for permission check
	_, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Only admin or existing participants can add participants
	// For demo purposes, we'll allow any authenticated user
	// In production, you'd check user roles and permissions here

	// Add participant
	err = mmh.marketplaceService.AddParticipant(r.Context(), threadRef, userID, req.Role)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to add participant: "+err.Error())
		return
	}

	// Return success response
	response := map[string]interface{}{
		"success": true,
		"message": "Participant added successfully",
		"user_id": userID,
		"role":    req.Role,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// HealthCheck handles GET /api/marketplace/health
func (mmh *MarketplaceMessageHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"success": true,
		"message": "Marketplace messaging service is healthy",
		"service": "marketplace_messaging",
		"status":  "ok",
	}

	respondWithJSON(w, http.StatusOK, response)
}
