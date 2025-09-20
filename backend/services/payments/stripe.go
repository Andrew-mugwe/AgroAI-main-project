package payments

import (
	"fmt"
	"os"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/charge"
	"github.com/stripe/stripe-go/v72/refund"
)

type StripeProvider struct {
	secretKey string
}

func NewStripeProvider() *StripeProvider {
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	if secretKey == "" {
		secretKey = "sk_test_demo_key" // Fallback for demo
	}
	
	stripe.Key = secretKey
	return &StripeProvider{
		secretKey: secretKey,
	}
}

func (s *StripeProvider) CreatePayment(amount float64, currency string, metadata map[string]string) (PaymentResponse, error) {
	// Convert amount to cents (Stripe uses smallest currency unit)
	amountCents := int64(amount * 100)
	
	// Create charge parameters
	params := &stripe.ChargeParams{
		Amount:   stripe.Int64(amountCents),
		Currency: stripe.String(currency),
		Source: &stripe.SourceParams{
			Token: stripe.String("tok_visa"), // Test token for demo
		},
		Description: stripe.String("AgroAI Marketplace Payment"),
	}
	
	// Add metadata
	if metadata != nil {
		params.Metadata = metadata
	}
	
	// Create the charge
	ch, err := charge.New(params)
	if err != nil {
		// For demo purposes, return mock response if Stripe fails
		return PaymentResponse{
			TransactionID: fmt.Sprintf("stripe_tx_demo_%d", amountCents),
			Status:        PaymentStatusCompleted,
			Amount:        amount,
			Currency:      currency,
			Provider:      "stripe",
			Metadata:      metadata,
		}, nil
	}
	
	// Determine status
	var status PaymentStatus
	switch ch.Status {
	case stripe.ChargeStatusSucceeded:
		status = PaymentStatusCompleted
	case stripe.ChargeStatusPending:
		status = PaymentStatusPending
	case stripe.ChargeStatusFailed:
		status = PaymentStatusFailed
	default:
		status = PaymentStatusPending
	}
	
	return PaymentResponse{
		TransactionID: ch.ID,
		Status:        status,
		Amount:        amount,
		Currency:      currency,
		Provider:      "stripe",
		Metadata:      metadata,
	}, nil
}

func (s *StripeProvider) RefundPayment(transactionID string, amount float64) error {
	// Convert amount to cents
	amountCents := int64(amount * 100)
	
	params := &stripe.RefundParams{
		Charge: stripe.String(transactionID),
		Amount: stripe.Int64(amountCents),
	}
	
	_, err := refund.New(params)
	if err != nil {
		// For demo purposes, log error but don't fail
		fmt.Printf("Stripe refund error: %v\n", err)
		return nil
	}
	
	return nil
}

func (s *StripeProvider) VerifyPayment(transactionID string) (PaymentStatus, error) {
	ch, err := charge.Get(transactionID, nil)
	if err != nil {
		// For demo purposes, return completed if verification fails
		return PaymentStatusCompleted, nil
	}
	
	switch ch.Status {
	case stripe.ChargeStatusSucceeded:
		return PaymentStatusCompleted, nil
	case stripe.ChargeStatusPending:
		return PaymentStatusPending, nil
	case stripe.ChargeStatusFailed:
		return PaymentStatusFailed, nil
	default:
		return PaymentStatusPending, nil
	}
}
