package payments

import "fmt"

// PaymentProvider defines the common interface
type PaymentProvider interface {
	CreatePayment(amount float64, currency string, metadata map[string]string) (PaymentResponse, error)
	RefundPayment(transactionID string, amount float64) error
	VerifyPayment(transactionID string) (PaymentStatus, error)
}

// Registry to hold active providers
var providers = map[string]PaymentProvider{}

// RegisterProvider adds a provider to the registry
func RegisterProvider(name string, provider PaymentProvider) {
	providers[name] = provider
}

// GetProvider retrieves a provider by name
func GetProvider(name string) (PaymentProvider, error) {
	p, ok := providers[name]
	if !ok {
		return nil, fmt.Errorf("payment provider %s not found", name)
	}
	return p, nil
}

// PaymentService handles payment operations
type PaymentService struct {
	providers map[string]PaymentProvider
}

// NewPaymentService creates a new payment service
func NewPaymentService() *PaymentService {
	return &PaymentService{
		providers: make(map[string]PaymentProvider),
	}
}

// CreatePayment creates a payment using the specified provider
func (ps *PaymentService) CreatePayment(providerName string, amount float64, currency string, metadata map[string]string) (PaymentResponse, error) {
	provider, err := GetProvider(providerName)
	if err != nil {
		return PaymentResponse{}, err
	}
	return provider.CreatePayment(amount, currency, metadata)
}

// RefundPayment refunds a payment using the specified provider
func (ps *PaymentService) RefundPayment(providerName string, transactionID string, amount float64) error {
	provider, err := GetProvider(providerName)
	if err != nil {
		return err
	}
	return provider.RefundPayment(transactionID, amount)
}

// VerifyPayment verifies a payment using the specified provider
func (ps *PaymentService) VerifyPayment(providerName string, transactionID string) (PaymentStatus, error) {
	provider, err := GetProvider(providerName)
	if err != nil {
		return PaymentStatus(""), err
	}
	return provider.VerifyPayment(transactionID)
}
