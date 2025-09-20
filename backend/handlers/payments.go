package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Andrew-mugwe/agroai/services/payments"
	"github.com/gorilla/mux"
)

type PaymentRequest struct {
	Provider string            `json:"provider"`
	Amount   float64           `json:"amount"`
	Currency string            `json:"currency"`
	Phone    string            `json:"phone,omitempty"`
	Metadata map[string]string `json:"metadata,omitempty"`
}

type PaymentResponse struct {
	Success       bool    `json:"success"`
	TransactionID string  `json:"transaction_id"`
	Status        string  `json:"status"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	Provider      string  `json:"provider"`
	Message       string  `json:"message,omitempty"`
}

type RefundRequest struct {
	TransactionID string  `json:"transaction_id"`
	Amount        float64 `json:"amount"`
}

// CreatePayment handles payment creation
func CreatePayment(w http.ResponseWriter, r *http.Request) {
	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Provider == "" || req.Amount <= 0 || req.Currency == "" {
		http.Error(w, "Missing required fields: provider, amount, currency", http.StatusBadRequest)
		return
	}

	// Get payment provider
	provider, err := payments.GetProvider(req.Provider)
	if err != nil {
		http.Error(w, "Unsupported payment provider", http.StatusBadRequest)
		return
	}

	// Prepare metadata
	metadata := make(map[string]string)
	if req.Metadata != nil {
		metadata = req.Metadata
	}

	// Add phone number for M-Pesa
	if req.Phone != "" {
		metadata["phone"] = req.Phone
	}

	// Create payment
	response, err := provider.CreatePayment(req.Amount, req.Currency, metadata)
	if err != nil {
		http.Error(w, "Payment creation failed", http.StatusInternalServerError)
		return
	}

	// Return response
	resp := PaymentResponse{
		Success:       true,
		TransactionID: response.TransactionID,
		Status:        string(response.Status),
		Amount:        response.Amount,
		Currency:      response.Currency,
		Provider:      response.Provider,
		Message:       "Payment processed successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// RefundPayment handles payment refunds
func RefundPayment(w http.ResponseWriter, r *http.Request) {
	var req RefundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.TransactionID == "" || req.Amount <= 0 {
		http.Error(w, "Missing required fields: transaction_id, amount", http.StatusBadRequest)
		return
	}

	// Extract provider from transaction ID (simple heuristic)
	var providerName string
	if len(req.TransactionID) > 3 {
		prefix := req.TransactionID[:3]
		switch prefix {
		case "ch_", "stripe":
			providerName = "stripe"
		case "MPE":
			providerName = "mpesa"
		case "PAY":
			providerName = "paypal"
		default:
			providerName = "stripe" // Default fallback
		}
	} else {
		providerName = "stripe" // Default fallback
	}

	// Get payment provider
	provider, err := payments.GetProvider(providerName)
	if err != nil {
		http.Error(w, "Unsupported payment provider", http.StatusBadRequest)
		return
	}

	// Process refund
	err = provider.RefundPayment(req.TransactionID, req.Amount)
	if err != nil {
		http.Error(w, "Refund failed", http.StatusInternalServerError)
		return
	}

	// Return success response
	resp := map[string]interface{}{
		"success":        true,
		"message":        "Refund processed successfully",
		"transaction_id": req.TransactionID,
		"amount":         req.Amount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// VerifyPayment handles payment verification
func VerifyPayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	transactionID := vars["transaction_id"]
	provider := r.URL.Query().Get("provider")

	if transactionID == "" {
		http.Error(w, "Missing transaction_id", http.StatusBadRequest)
		return
	}

	if provider == "" {
		http.Error(w, "Missing provider parameter", http.StatusBadRequest)
		return
	}

	// Get payment provider
	paymentProvider, err := payments.GetProvider(provider)
	if err != nil {
		http.Error(w, "Unsupported payment provider", http.StatusBadRequest)
		return
	}

	// Verify payment
	status, err := paymentProvider.VerifyPayment(transactionID)
	if err != nil {
		http.Error(w, "Payment verification failed", http.StatusInternalServerError)
		return
	}

	// Return response
	resp := map[string]interface{}{
		"success":        true,
		"transaction_id": transactionID,
		"status":         string(status),
		"provider":       provider,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetPaymentProviders returns available payment providers
func GetPaymentProviders(w http.ResponseWriter, r *http.Request) {
	providers := []map[string]interface{}{
		{
			"id":          "stripe",
			"name":        "Stripe",
			"description": "International card payments",
			"currencies":  []string{"USD", "EUR", "GBP", "CAD", "AUD"},
			"icon":        "💳",
		},
		{
			"id":          "mpesa",
			"name":        "M-Pesa",
			"description": "Mobile money payments",
			"currencies":  []string{"KES"},
			"icon":        "📱",
		},
		{
			"id":          "paypal",
			"name":        "PayPal",
			"description": "Digital wallet payments",
			"currencies":  []string{"USD", "EUR", "GBP", "CAD", "AUD"},
			"icon":        "🅿️",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"providers": providers,
	})
}
