package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/services/reputation"
)

// RatingHandler handles rating-related HTTP requests
type RatingHandler struct {
	reputationService *reputation.ReputationService
}

// NewRatingHandler creates a new rating handler
func NewRatingHandler(reputationService *reputation.ReputationService) *RatingHandler {
	return &RatingHandler{
		reputationService: reputationService,
	}
}

// CreateRatingRequest represents the request body for creating a rating
type CreateRatingRequest struct {
	OrderID int    `json:"order_id" validate:"required"`
	Rating  int    `json:"rating" validate:"required,min=1,max=5"`
	Review  string `json:"review"`
}

// RatingResponse represents the response for rating operations
type RatingResponse struct {
	Success bool               `json:"success"`
	Message string             `json:"message"`
	Data    *reputation.Rating `json:"data,omitempty"`
	Error   string             `json:"error,omitempty"`
}

// ReputationResponse represents the response for reputation queries
type ReputationResponse struct {
	Success bool                         `json:"success"`
	Message string                       `json:"message"`
	Data    *reputation.SellerReputation `json:"data,omitempty"`
	Error   string                       `json:"error,omitempty"`
}

// ReputationHistoryResponse represents the response for reputation history queries
type ReputationHistoryResponse struct {
	Success bool                           `json:"success"`
	Message string                         `json:"message"`
	Data    []reputation.ReputationHistory `json:"data,omitempty"`
	Error   string                         `json:"error,omitempty"`
}

// CreateRating handles POST /api/ratings
func (rh *RatingHandler) CreateRating(w http.ResponseWriter, r *http.Request) {
	var req CreateRatingRequest

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate rating
	if req.Rating < 1 || req.Rating > 5 {
		respondWithError(w, http.StatusBadRequest, "Rating must be between 1 and 5")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Validate order ownership and status
	sellerID, orderStatus, err := rh.validateOrderForRating(req.OrderID, userID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	if orderStatus != "completed" {
		respondWithError(w, http.StatusBadRequest, "Can only rate completed orders")
		return
	}

	// Check if rating already exists
	exists, err := rh.ratingExists(req.OrderID, userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check existing rating")
		return
	}

	if exists {
		respondWithError(w, http.StatusConflict, "Rating already exists for this order")
		return
	}

	// Create rating
	rating, err := rh.createRating(req.OrderID, userID, sellerID, req.Rating, req.Review)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create rating")
		return
	}

	// Recalculate seller reputation (this happens automatically via trigger, but we can also do it manually)
	if err := rh.reputationService.RecalculateReputation(sellerID); err != nil {
		// Log error but don't fail the rating creation
		// In production, you might want to queue this for background processing
	}

	// Return success response
	response := RatingResponse{
		Success: true,
		Message: "Rating created successfully",
		Data:    rating,
	}

	respondWithJSON(w, http.StatusCreated, response)
}

// GetSellerReputation handles GET /api/sellers/:sellerId/reputation
func (rh *RatingHandler) GetSellerReputation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sellerIDStr := vars["sellerId"]

	sellerID, err := uuid.Parse(sellerIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	reputation, err := rh.reputationService.GetSellerReputation(sellerID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get seller reputation")
		return
	}

	response := ReputationResponse{
		Success: true,
		Message: "Seller reputation retrieved successfully",
		Data:    reputation,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// GetReputationHistory handles GET /api/reputation/history/:userId
func (rh *RatingHandler) GetReputationHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["userId"]

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Get current user ID from context
	currentUserID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Check if user is requesting their own history or is admin
	// For demo purposes, allow any authenticated user to view any history
	// In production, you'd check user roles here
	if userID != currentUserID {
		// Check if current user is admin (you'd implement proper role checking)
		// For now, allow access
	}

	_, history, err := rh.reputationService.GetReputation(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get reputation history")
		return
	}

	response := ReputationHistoryResponse{
		Success: true,
		Message: "Reputation history retrieved successfully",
		Data:    history,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// GetReputationReport handles GET /api/admin/reputation/report
func (rh *RatingHandler) GetReputationReport(w http.ResponseWriter, r *http.Request) {
	// Parse since parameter
	sinceStr := r.URL.Query().Get("since")
	var since time.Time
	var err error

	if sinceStr != "" {
		since, err = time.Parse("2006-01-02", sinceStr)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid since date format (use YYYY-MM-DD)")
			return
		}
	} else {
		// Default to 30 days ago
		since = time.Now().AddDate(0, 0, -30)
	}

	report, err := rh.reputationService.GetReputationReport(since)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get reputation report")
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Reputation report retrieved successfully",
		"data":    report,
		"since":   since.Format("2006-01-02"),
	}

	respondWithJSON(w, http.StatusOK, response)
}

// RecalculateReputation handles POST /api/admin/reputation/recalculate/:userId
func (rh *RatingHandler) RecalculateReputation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["userId"]

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// In production, check if user is admin
	// For demo purposes, allow any authenticated user

	err = rh.reputationService.RecalculateReputation(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to recalculate reputation")
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Reputation recalculated successfully",
		"user_id": userID,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// HealthCheck handles GET /api/reputation/health
func (rh *RatingHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	err := rh.reputationService.HealthCheck()
	if err != nil {
		respondWithError(w, http.StatusServiceUnavailable, "Reputation service unhealthy")
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Reputation service is healthy",
		"service": "reputation",
		"status":  "ok",
	}

	respondWithJSON(w, http.StatusOK, response)
}

// Helper methods

// validateOrderForRating validates that the user can rate the order
func (rh *RatingHandler) validateOrderForRating(orderID int, userID uuid.UUID) (uuid.UUID, string, error) {
	// This would typically query your orders table
	// For demo purposes, return mock data
	return uuid.MustParse("890e1234-e89b-12d3-a456-426614174003"), "completed", nil
}

// ratingExists checks if a rating already exists for the order and user
func (rh *RatingHandler) ratingExists(orderID int, userID uuid.UUID) (bool, error) {
	// This would query your ratings table
	// For demo purposes, return false
	return false, nil
}

// createRating creates a new rating in the database
func (rh *RatingHandler) createRating(orderID int, reviewerID, sellerID uuid.UUID, rating int, review string) (*reputation.Rating, error) {
	// This would insert into your ratings table
	// For demo purposes, return mock data
	return &reputation.Rating{
		ID:         1,
		OrderID:    orderID,
		ReviewerID: reviewerID,
		SellerID:   sellerID,
		Rating:     rating,
		Review:     review,
		CreatedAt:  time.Now(),
	}, nil
}

// Helper functions

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}
