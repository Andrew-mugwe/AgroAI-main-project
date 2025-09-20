package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/disputes"
	"github.com/google/uuid"
)

// DisputeHandler handles dispute-related HTTP requests
type DisputeHandler struct {
	disputeService *disputes.DisputeService
}

// NewDisputeHandler creates a new dispute handler
func NewDisputeHandler(disputeService *disputes.DisputeService) *DisputeHandler {
	return &DisputeHandler{
		disputeService: disputeService,
	}
}

// OpenDispute opens a new dispute
func (h *DisputeHandler) OpenDispute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.DisputeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	dispute, err := h.disputeService.OpenDispute(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dispute)
}

// RespondToDispute adds a seller response to a dispute
func (h *DisputeHandler) RespondToDispute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		DisputeID string   `json:"dispute_id"`
		SellerID  string   `json:"seller_id"`
		Note      string   `json:"note"`
		Evidence  []string `json:"evidence"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	disputeID, err := uuid.Parse(req.DisputeID)
	if err != nil {
		http.Error(w, "Invalid dispute ID", http.StatusBadRequest)
		return
	}

	sellerID, err := uuid.Parse(req.SellerID)
	if err != nil {
		http.Error(w, "Invalid seller ID", http.StatusBadRequest)
		return
	}

	err = h.disputeService.AddSellerResponse(disputeID, sellerID, req.Note, req.Evidence)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success":    true,
		"message":    "Response added successfully",
		"dispute_id": disputeID,
		"timestamp":  time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// EscalateDispute escalates a dispute to admin/NGO review
func (h *DisputeHandler) EscalateDispute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		DisputeID   string `json:"dispute_id"`
		EscalatedBy string `json:"escalated_by"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	disputeID, err := uuid.Parse(req.DisputeID)
	if err != nil {
		http.Error(w, "Invalid dispute ID", http.StatusBadRequest)
		return
	}

	escalatedBy, err := uuid.Parse(req.EscalatedBy)
	if err != nil {
		http.Error(w, "Invalid escalated_by ID", http.StatusBadRequest)
		return
	}

	err = h.disputeService.EscalateDispute(disputeID, escalatedBy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success":      true,
		"message":      "Dispute escalated successfully",
		"dispute_id":   disputeID,
		"escalated_at": time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ResolveDispute resolves a dispute with a decision
func (h *DisputeHandler) ResolveDispute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.DisputeResolutionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.disputeService.ResolveDispute(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success":     true,
		"message":     "Dispute resolved successfully",
		"dispute_id":  req.DisputeID,
		"resolution":  req.Resolution,
		"resolved_at": time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetDispute retrieves a dispute by ID
func (h *DisputeHandler) GetDispute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	disputeIDStr := r.URL.Query().Get("id")
	if disputeIDStr == "" {
		http.Error(w, "Dispute ID required", http.StatusBadRequest)
		return
	}

	disputeID, err := uuid.Parse(disputeIDStr)
	if err != nil {
		http.Error(w, "Invalid dispute ID", http.StatusBadRequest)
		return
	}

	dispute, err := h.disputeService.GetDispute(disputeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dispute)
}

// GetDisputesByUser retrieves disputes for a specific user
func (h *DisputeHandler) GetDisputesByUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.URL.Query().Get("user_id")
	userType := r.URL.Query().Get("user_type")

	if userIDStr == "" || userType == "" {
		http.Error(w, "User ID and user type required", http.StatusBadRequest)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	disputes, err := h.disputeService.GetDisputesByUser(userID, userType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(disputes)
}

// GetDisputeSummary retrieves dispute statistics
func (h *DisputeHandler) GetDisputeSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	summary, err := h.disputeService.GetDisputeSummary()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

// HealthCheck returns the health status of dispute services
func (h *DisputeHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"status":    "healthy",
		"service":   "disputes",
		"timestamp": time.Now(),
		"version":   "1.0.0",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
