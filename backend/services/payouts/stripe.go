package payouts

import (
	"fmt"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/shopspring/decimal"
)

// StripePayoutProvider handles Stripe Connect payouts
type StripePayoutProvider struct {
	name string
}

// NewStripePayoutProvider creates a new Stripe payout provider
func NewStripePayoutProvider() *StripePayoutProvider {
	return &StripePayoutProvider{
		name: "Stripe Connect",
	}
}

// ProcessPayout processes a payout via Stripe Connect
func (p *StripePayoutProvider) ProcessPayout(req *models.PayoutRequest) (*models.PayoutResponse, error) {
	// Validate request
	if err := p.validateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// In a real implementation, this would call Stripe Connect API
	// For demo purposes, we'll simulate the API call

	// Simulate API call delay
	time.Sleep(100 * time.Millisecond)

	// Generate mock payout ID
	payoutID := fmt.Sprintf("po_stripe_%d", time.Now().Unix())

	// Simulate success/failure based on amount
	if req.Amount.LessThan(decimal.NewFromFloat(0.50)) {
		return nil, fmt.Errorf("amount too small: minimum $0.50 required")
	}

	if req.Amount.GreaterThan(decimal.NewFromFloat(100000.00)) {
		return nil, fmt.Errorf("amount too large: maximum $100,000 allowed")
	}

	// Check currency support
	if !p.IsSupported(req.Currency) {
		return nil, fmt.Errorf("currency %s not supported by Stripe Connect", req.Currency)
	}

	// Simulate processing
	status := "pending"
	if req.Amount.LessThan(decimal.NewFromFloat(1000.00)) {
		status = "completed" // Small amounts process faster
	}

	return &models.PayoutResponse{
		PayoutID:    payoutID,
		Status:      status,
		Amount:      req.Amount,
		Currency:    req.Currency,
		Provider:    "stripe",
		AccountID:   req.AccountID,
		ProcessedAt: time.Now(),
		Message:     fmt.Sprintf("Payout initiated via Stripe Connect to account %s", req.AccountID),
	}, nil
}

// GetProviderName returns the provider name
func (p *StripePayoutProvider) GetProviderName() string {
	return p.name
}

// IsSupported checks if currency is supported
func (p *StripePayoutProvider) IsSupported(currency string) bool {
	supportedCurrencies := []string{
		"USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK",
		"PLN", "CZK", "HUF", "BGN", "RON", "HRK", "TRY", "BRL", "MXN", "SGD",
		"HKD", "NZD", "MYR", "PHP", "THB", "ZAR", "INR", "IDR", "KRW", "TWD",
		"VND", "UAH", "RUB", "ILS", "AED", "SAR", "QAR", "KWD", "BHD", "OMR",
		"JOD", "LBP", "EGP", "MAD", "TND", "DZD", "LYD", "SDG", "ETB", "KES",
		"UGX", "TZS", "ZMW", "BWP", "SZL", "LSL", "NAD", "MZN", "AOA",
	}

	for _, curr := range supportedCurrencies {
		if curr == currency {
			return true
		}
	}
	return false
}

// validateRequest validates the payout request
func (p *StripePayoutProvider) validateRequest(req *models.PayoutRequest) error {
	if req.AccountID == "" {
		return fmt.Errorf("account_id is required for Stripe Connect")
	}
	if req.Amount.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("amount must be greater than zero")
	}
	if len(req.Currency) != 3 {
		return fmt.Errorf("currency must be 3 characters")
	}
	return nil
}
