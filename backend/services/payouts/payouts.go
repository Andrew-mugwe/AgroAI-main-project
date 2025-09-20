package payouts

import (
	"fmt"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/shopspring/decimal"
)

// PayoutService handles seller payouts across multiple providers
type PayoutService struct {
	providers map[string]PayoutProvider
}

// PayoutProvider interface for different payout providers
type PayoutProvider interface {
	ProcessPayout(req *models.PayoutRequest) (*models.PayoutResponse, error)
	GetProviderName() string
	IsSupported(currency string) bool
}

// NewPayoutService creates a new payout service
func NewPayoutService() *PayoutService {
	service := &PayoutService{
		providers: make(map[string]PayoutProvider),
	}

	// Register providers
	service.RegisterProvider("stripe", NewStripePayoutProvider())
	service.RegisterProvider("mpesa", NewMpesaPayoutProvider())
	service.RegisterProvider("paypal", NewPaypalPayoutProvider())

	return service
}

// RegisterProvider registers a payout provider
func (s *PayoutService) RegisterProvider(name string, provider PayoutProvider) {
	s.providers[name] = provider
}

// ProcessPayout processes a payout request
func (s *PayoutService) ProcessPayout(req *models.PayoutRequest) (*models.PayoutResponse, error) {
	// Get provider
	provider, exists := s.providers[req.Provider]
	if !exists {
		return nil, fmt.Errorf("payout provider %s not supported", req.Provider)
	}

	// Check if currency is supported
	if !provider.IsSupported(req.Currency) {
		return nil, fmt.Errorf("currency %s not supported by provider %s", req.Currency, req.Provider)
	}

	// Process payout
	response, err := provider.ProcessPayout(req)
	if err != nil {
		return nil, fmt.Errorf("payout failed: %w", err)
	}

	fmt.Printf("✅ Payout processed: %s via %s (Amount: %s %s)\n",
		response.PayoutID, req.Provider, req.Amount.String(), req.Currency)

	return response, nil
}

// GetSupportedProviders returns list of supported providers
func (s *PayoutService) GetSupportedProviders() []string {
	var providers []string
	for name := range s.providers {
		providers = append(providers, name)
	}
	return providers
}

// GetProviderCapabilities returns capabilities for each provider
func (s *PayoutService) GetProviderCapabilities() map[string]ProviderCapabilities {
	capabilities := make(map[string]ProviderCapabilities)

	for name, provider := range s.providers {
		capabilities[name] = ProviderCapabilities{
			Name:           provider.GetProviderName(),
			Currencies:     s.getSupportedCurrencies(provider),
			MinAmount:      s.getMinAmount(provider),
			MaxAmount:      s.getMaxAmount(provider),
			ProcessingTime: s.getProcessingTime(provider),
		}
	}

	return capabilities
}

// ProviderCapabilities represents what a provider can do
type ProviderCapabilities struct {
	Name           string          `json:"name"`
	Currencies     []string        `json:"currencies"`
	MinAmount      decimal.Decimal `json:"min_amount"`
	MaxAmount      decimal.Decimal `json:"max_amount"`
	ProcessingTime string          `json:"processing_time"`
}

// Helper methods for capabilities
func (s *PayoutService) getSupportedCurrencies(provider PayoutProvider) []string {
	// This would be implemented based on actual provider capabilities
	switch provider.GetProviderName() {
	case "Stripe Connect":
		return []string{"USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "BGN", "RON", "HRK", "TRY", "BRL", "MXN", "SGD", "HKD", "NZD", "MYR", "PHP", "THB", "ZAR", "INR", "IDR", "KRW", "TWD", "VND", "UAH", "RUB", "ILS", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP", "EGP", "MAD", "TND", "DZD", "LYD", "SDG", "ETB", "KES", "UGX", "TZS", "ZMW", "BWP", "SZL", "LSL", "NAD", "MZN", "AOA", "XOF", "XAF", "CDF", "RWF", "BIF", "KMF", "DJF", "SOS", "ERN", "ETB", "SLL", "GMD", "GNF", "LRD", "CVE", "STN", "XOF", "XAF", "CDF", "RWF", "BIF", "KMF", "DJF", "SOS", "ERN", "ETB", "SLL", "GMD", "GNF", "LRD", "CVE", "STN"}
	case "M-Pesa B2C":
		return []string{"KES", "TZS", "UGX", "RWF", "BIF", "KMF", "DJF", "SOS", "ERN", "ETB", "SLL", "GMD", "GNF", "LRD", "CVE", "STN"}
	case "PayPal Payouts":
		return []string{"USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "BGN", "RON", "HRK", "TRY", "BRL", "MXN", "SGD", "HKD", "NZD", "MYR", "PHP", "THB", "ZAR", "INR", "IDR", "KRW", "TWD", "VND", "UAH", "RUB", "ILS", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP", "EGP", "MAD", "TND", "DZD", "LYD", "SDG", "ETB", "KES", "UGX", "TZS", "ZMW", "BWP", "SZL", "LSL", "NAD", "MZN", "AOA", "XOF", "XAF", "CDF", "RWF", "BIF", "KMF", "DJF", "SOS", "ERN", "ETB", "SLL", "GMD", "GNF", "LRD", "CVE", "STN", "XOF", "XAF", "CDF", "RWF", "BIF", "KMF", "DJF", "SOS", "ERN", "ETB", "SLL", "GMD", "GNF", "LRD", "CVE", "STN"}
	default:
		return []string{"USD"}
	}
}

func (s *PayoutService) getMinAmount(provider PayoutProvider) decimal.Decimal {
	switch provider.GetProviderName() {
	case "Stripe Connect":
		return decimal.NewFromFloat(0.50) // $0.50 minimum
	case "M-Pesa B2C":
		return decimal.NewFromFloat(10.00) // 10 KES minimum
	case "PayPal Payouts":
		return decimal.NewFromFloat(0.01) // $0.01 minimum
	default:
		return decimal.NewFromFloat(1.00)
	}
}

func (s *PayoutService) getMaxAmount(provider PayoutProvider) decimal.Decimal {
	switch provider.GetProviderName() {
	case "Stripe Connect":
		return decimal.NewFromFloat(100000.00) // $100,000 maximum
	case "M-Pesa B2C":
		return decimal.NewFromFloat(150000.00) // 150,000 KES maximum
	case "PayPal Payouts":
		return decimal.NewFromFloat(10000.00) // $10,000 maximum
	default:
		return decimal.NewFromFloat(1000.00)
	}
}

func (s *PayoutService) getProcessingTime(provider PayoutProvider) string {
	switch provider.GetProviderName() {
	case "Stripe Connect":
		return "2-7 business days"
	case "M-Pesa B2C":
		return "Instant to 24 hours"
	case "PayPal Payouts":
		return "1-3 business days"
	default:
		return "3-5 business days"
	}
}
