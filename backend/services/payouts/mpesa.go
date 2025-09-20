package payouts

import (
	"fmt"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/shopspring/decimal"
)

// MpesaPayoutProvider handles M-Pesa B2C payouts
type MpesaPayoutProvider struct {
	name string
}

// NewMpesaPayoutProvider creates a new M-Pesa payout provider
func NewMpesaPayoutProvider() *MpesaPayoutProvider {
	return &MpesaPayoutProvider{
		name: "M-Pesa B2C",
	}
}

// ProcessPayout processes a payout via M-Pesa B2C
func (p *MpesaPayoutProvider) ProcessPayout(req *models.PayoutRequest) (*models.PayoutResponse, error) {
	// Validate request
	if err := p.validateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// In a real implementation, this would call M-Pesa Daraja API
	// For demo purposes, we'll simulate the API call

	// Simulate API call delay
	time.Sleep(150 * time.Millisecond)

	// Generate mock payout ID
	payoutID := fmt.Sprintf("po_mpesa_%d", time.Now().Unix())

	// Simulate success/failure based on amount
	if req.Amount.LessThan(decimal.NewFromFloat(10.00)) {
		return nil, fmt.Errorf("amount too small: minimum 10 KES required")
	}

	if req.Amount.GreaterThan(decimal.NewFromFloat(150000.00)) {
		return nil, fmt.Errorf("amount too large: maximum 150,000 KES allowed")
	}

	// Check currency support
	if !p.IsSupported(req.Currency) {
		return nil, fmt.Errorf("currency %s not supported by M-Pesa B2C", req.Currency)
	}

	// Simulate processing - M-Pesa is usually instant
	status := "completed"

	return &models.PayoutResponse{
		PayoutID:    payoutID,
		Status:      status,
		Amount:      req.Amount,
		Currency:    req.Currency,
		Provider:    "mpesa",
		AccountID:   req.AccountID,
		ProcessedAt: time.Now(),
		Message:     fmt.Sprintf("Payout sent to M-Pesa number %s", req.AccountID),
	}, nil
}

// GetProviderName returns the provider name
func (p *MpesaPayoutProvider) GetProviderName() string {
	return p.name
}

// IsSupported checks if currency is supported
func (p *MpesaPayoutProvider) IsSupported(currency string) bool {
	supportedCurrencies := []string{
		"KES", "TZS", "UGX", "RWF", "BIF", "KMF", "DJF", "SOS", "ERN", "ETB",
		"SLL", "GMD", "GNF", "LRD", "CVE", "STN",
	}

	for _, curr := range supportedCurrencies {
		if curr == currency {
			return true
		}
	}
	return false
}

// validateRequest validates the payout request
func (p *MpesaPayoutProvider) validateRequest(req *models.PayoutRequest) error {
	if req.AccountID == "" {
		return fmt.Errorf("account_id (phone number) is required for M-Pesa B2C")
	}
	if req.Amount.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("amount must be greater than zero")
	}
	if len(req.Currency) != 3 {
		return fmt.Errorf("currency must be 3 characters")
	}
	// Basic phone number validation for M-Pesa
	if len(req.AccountID) < 10 {
		return fmt.Errorf("invalid phone number format")
	}
	return nil
}
