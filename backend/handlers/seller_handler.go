package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Andrew-mugwe/agroai/services/sellers"
	"github.com/Andrew-mugwe/agroai/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// SellerHandler handles seller-related HTTP requests
type SellerHandler struct {
	sellerService *sellers.SellerService
}

// NewSellerHandler creates a new seller handler
func NewSellerHandler(sellerService *sellers.SellerService) *SellerHandler {
	return &SellerHandler{
		sellerService: sellerService,
	}
}

// GetSellerProfile handles GET /api/sellers/:id
func (h *SellerHandler) GetSellerProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sellerID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	// Get seller profile
	profile, err := h.sellerService.GetSellerProfile(r.Context(), sellerID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Seller not found")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success": true,
		"data":    profile,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// CreateReview handles POST /api/sellers/:id/review
func (h *SellerHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)
	sellerID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	// Parse request
	var req sellers.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.Rating < 1 || req.Rating > 5 {
		utils.RespondWithValidationError(w, "Rating must be between 1 and 5")
		return
	}
	if req.OrderID == uuid.Nil {
		utils.RespondWithValidationError(w, "Order ID is required")
		return
	}

	// Create review
	err = h.sellerService.CreateReview(r.Context(), userID, sellerID, &req)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Return response
	response := map[string]interface{}{
		"success": true,
		"message": "Review created successfully",
	}

	utils.RespondWithJSON(w, http.StatusCreated, response)
}

// GetSellerReviews handles GET /api/sellers/:id/reviews
func (h *SellerHandler) GetSellerReviews(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sellerID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	// Parse pagination parameters
	limit := 20
	offset := 0
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	if offsetStr := r.URL.Query().Get("page"); offsetStr != "" {
		if page, err := strconv.Atoi(offsetStr); err == nil && page > 0 {
			offset = (page - 1) * limit
		}
	}

	// Get reviews
	reviews, err := h.sellerService.GetSellerReviews(r.Context(), sellerID, limit, offset)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get reviews")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success": true,
		"data":    reviews,
		"pagination": map[string]interface{}{
			"limit":  limit,
			"offset": offset,
		},
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// UpdateSellerProfile handles PATCH /api/sellers/:id
func (h *SellerHandler) UpdateSellerProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)
	sellerID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	// Verify user owns this seller profile
	seller, err := h.sellerService.GetSellerByUserID(r.Context(), userID)
	if err != nil || seller.ID != sellerID {
		utils.RespondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	// Parse request
	var req sellers.UpdateSellerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Update seller profile
	err = h.sellerService.CreateOrUpdateSellerProfile(r.Context(), userID, &req)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update seller profile")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success": true,
		"message": "Seller profile updated successfully",
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// VerifySeller handles PATCH /api/admin/sellers/:id/verify (Admin only)
func (h *SellerHandler) VerifySeller(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sellerID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	// Parse request
	var req struct {
		Verified bool `json:"verified"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Update verification status
	err = h.sellerService.VerifySeller(r.Context(), sellerID, req.Verified)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update seller verification")
		return
	}

	// Return response
	message := "Seller verification removed"
	if req.Verified {
		message = "Seller verified successfully"
	}

	response := map[string]interface{}{
		"success": true,
		"message": message,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// RecalculateReputation handles POST /api/admin/sellers/:id/recalculate-reputation (Admin only)
func (h *SellerHandler) RecalculateReputation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sellerID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid seller ID")
		return
	}

	// Recalculate reputation
	err = h.sellerService.RecalculateReputation(r.Context(), sellerID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to recalculate reputation")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success": true,
		"message": "Reputation recalculated successfully",
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}
