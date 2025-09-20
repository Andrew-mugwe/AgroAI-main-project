package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/escrow"
	"github.com/Andrew-mugwe/agroai/services/payouts"
	"github.com/google/uuid"
)

// EscrowHandler handles escrow-related HTTP requests
type EscrowHandler struct {
	escrowService *escrow.EscrowService
	payoutService *payouts.PayoutService
}

// NewEscrowHandler creates a new escrow handler
func NewEscrowHandler(escrowService *escrow.EscrowService, payoutService *payouts.PayoutService) *EscrowHandler {
	return &EscrowHandler{
		escrowService: escrowService,
		payoutService: payoutService,
	}
}

// CreateEscrow creates a new escrow transaction
func (h *EscrowHandler) CreateEscrow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.EscrowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	resp, err := h.escrowService.CreateEscrow(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetEscrow retrieves an escrow by ID
func (h *EscrowHandler) GetEscrow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract escrow ID from URL path
	escrowIDStr := r.URL.Query().Get("id")
	if escrowIDStr == "" {
		http.Error(w, "Escrow ID required", http.StatusBadRequest)
		return
	}

	escrowID, err := uuid.Parse(escrowIDStr)
	if err != nil {
		http.Error(w, "Invalid escrow ID", http.StatusBadRequest)
		return
	}

	escrow, err := h.escrowService.GetEscrow(escrowID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(escrow)
}

// ReleaseEscrow releases funds to the seller
func (h *EscrowHandler) ReleaseEscrow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		EscrowID  string `json:"escrow_id"`
		AccountID string `json:"account_id"`
		Provider  string `json:"provider"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	escrowID, err := uuid.Parse(req.EscrowID)
	if err != nil {
		http.Error(w, "Invalid escrow ID", http.StatusBadRequest)
		return
	}

	err = h.escrowService.ReleaseEscrow(escrowID, req.AccountID, req.Provider)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success":     true,
		"message":     "Escrow released successfully",
		"escrow_id":   escrowID,
		"released_at": time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RefundEscrow refunds the buyer
func (h *EscrowHandler) RefundEscrow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		EscrowID string `json:"escrow_id"`
		Reason   string `json:"reason"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	escrowID, err := uuid.Parse(req.EscrowID)
	if err != nil {
		http.Error(w, "Invalid escrow ID", http.StatusBadRequest)
		return
	}

	err = h.escrowService.RefundEscrow(escrowID, req.Reason)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success":     true,
		"message":     "Escrow refunded successfully",
		"escrow_id":   escrowID,
		"refunded_at": time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetEscrowSummary retrieves escrow statistics
func (h *EscrowHandler) GetEscrowSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	currency := r.URL.Query().Get("currency")
	if currency == "" {
		currency = "USD"
	}

	summary, err := h.escrowService.GetEscrowSummary(currency)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

// GetPayoutCapabilities returns payout provider capabilities
func (h *EscrowHandler) GetPayoutCapabilities(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	capabilities := h.payoutService.GetProviderCapabilities()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(capabilities)
}

// ProcessPayout processes a payout request
func (h *EscrowHandler) ProcessPayout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.PayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	resp, err := h.payoutService.ProcessPayout(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HealthCheck returns the health status of escrow services
func (h *EscrowHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"status":    "healthy",
		"service":   "escrow",
		"timestamp": time.Now(),
		"version":   "1.0.0",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
