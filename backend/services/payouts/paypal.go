package payouts

import (
	"fmt"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/shopspring/decimal"
)

// PaypalPayoutProvider handles PayPal Payouts
type PaypalPayoutProvider struct {
	name string
}

// NewPaypalPayoutProvider creates a new PayPal payout provider
func NewPaypalPayoutProvider() *PaypalPayoutProvider {
	return &PaypalPayoutProvider{
		name: "PayPal Payouts",
	}
}

// ProcessPayout processes a payout via PayPal Payouts
func (p *PaypalPayoutProvider) ProcessPayout(req *models.PayoutRequest) (*models.PayoutResponse, error) {
	// Validate request
	if err := p.validateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// In a real implementation, this would call PayPal Payouts API
	// For demo purposes, we'll simulate the API call

	// Simulate API call delay
	time.Sleep(200 * time.Millisecond)

	// Generate mock payout ID
	payoutID := fmt.Sprintf("po_paypal_%d", time.Now().Unix())

	// Simulate success/failure based on amount
	if req.Amount.LessThan(decimal.NewFromFloat(0.01)) {
		return nil, fmt.Errorf("amount too small: minimum $0.01 required")
	}

	if req.Amount.GreaterThan(decimal.NewFromFloat(10000.00)) {
		return nil, fmt.Errorf("amount too large: maximum $10,000 allowed")
	}

	// Check currency support
	if !p.IsSupported(req.Currency) {
		return nil, fmt.Errorf("currency %s not supported by PayPal Payouts", req.Currency)
	}

	// Simulate processing
	status := "pending"
	if req.Amount.LessThan(decimal.NewFromFloat(100.00)) {
		status = "completed" // Small amounts process faster
	}

	return &models.PayoutResponse{
		PayoutID:    payoutID,
		Status:      status,
		Amount:      req.Amount,
		Currency:    req.Currency,
		Provider:    "paypal",
		AccountID:   req.AccountID,
		ProcessedAt: time.Now(),
		Message:     fmt.Sprintf("Payout initiated via PayPal to account %s", req.AccountID),
	}, nil
}

// GetProviderName returns the provider name
func (p *PaypalPayoutProvider) GetProviderName() string {
	return p.name
}

// IsSupported checks if currency is supported
func (p *PaypalPayoutProvider) IsSupported(currency string) bool {
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
func (p *PaypalPayoutProvider) validateRequest(req *models.PayoutRequest) error {
	if req.AccountID == "" {
		return fmt.Errorf("account_id (PayPal email) is required for PayPal Payouts")
	}
	if req.Amount.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("amount must be greater than zero")
	}
	if len(req.Currency) != 3 {
		return fmt.Errorf("currency must be 3 characters")
	}
	// Basic email validation for PayPal
	if !p.isValidEmail(req.AccountID) {
		return fmt.Errorf("invalid PayPal email format")
	}
	return nil
}

// isValidEmail performs basic email validation
func (p *PaypalPayoutProvider) isValidEmail(email string) bool {
	return len(email) > 5 &&
		len(email) < 100 &&
		contains(email, "@") &&
		contains(email, ".")
}

// contains checks if a string contains a substring
func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
