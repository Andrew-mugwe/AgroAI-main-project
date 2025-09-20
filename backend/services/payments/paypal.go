package payments

import (
	"fmt"
	"os"
	"time"

	"github.com/plutov/paypal"
)

type PaypalProvider struct {
	clientID     string
	clientSecret string
	baseURL      string
	client       *paypal.Client
}

type PaypalOrderResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
	Links  []struct {
		Href   string `json:"href"`
		Rel    string `json:"rel"`
		Method string `json:"method"`
	} `json:"links"`
}

func NewPaypalProvider() *PaypalProvider {
	clientID := os.Getenv("PAYPAL_CLIENT_ID")
	clientSecret := os.Getenv("PAYPAL_CLIENT_SECRET")
	
	// Use sandbox for demo
	baseURL := "https://api.sandbox.paypal.com"
	if clientID == "" || clientSecret == "" {
		baseURL = "https://api.sandbox.paypal.com" // Demo mode
	}
	
	client, _ := paypal.NewClient(clientID, clientSecret, baseURL)
	
	return &PaypalProvider{
		clientID:     clientID,
		clientSecret: clientSecret,
		baseURL:      baseURL,
		client:       client,
	}
}

func (p *PaypalProvider) CreatePayment(amount float64, currency string, metadata map[string]string) (PaymentResponse, error) {
	// For demo purposes, simulate PayPal payment creation
	// In production, this would create actual PayPal orders
	
	// Generate demo transaction ID
	transactionID := fmt.Sprintf("PAY%s", time.Now().Format("20060102150405"))
	
	// Simulate processing delay
	time.Sleep(1 * time.Second)
	
	// For demo, assume payment is completed
	status := PaymentStatusCompleted
	
	return PaymentResponse{
		TransactionID: transactionID,
		Status:        status,
		Amount:        amount,
		Currency:      currency,
		Provider:      "paypal",
		Metadata: map[string]string{
			"paypal_order_id": transactionID,
			"demo":            "true",
		},
	}, nil
}

func (p *PaypalProvider) RefundPayment(transactionID string, amount float64) error {
	// For demo purposes, just log the refund request
	fmt.Printf("PayPal refund requested: %s for %.2f %s\n", transactionID, amount, "USD")
	return nil
}

func (p *PaypalProvider) VerifyPayment(transactionID string) (PaymentStatus, error) {
	// For demo purposes, assume all PayPal transactions are completed
	return PaymentStatusCompleted, nil
}

// Helper function to create PayPal order (for production use)
func (p *PaypalProvider) createPayPalOrder(amount float64, currency string) (*PaypalOrderResponse, error) {
	// For demo purposes, return mock response
	return &PaypalOrderResponse{
		ID:     fmt.Sprintf("PAY%s", time.Now().Format("20060102150405")),
		Status: "COMPLETED",
		Links: []struct {
			Href   string `json:"href"`
			Rel    string `json:"rel"`
			Method string `json:"method"`
		}{
			{
				Href:   "https://api.sandbox.paypal.com/v2/checkout/orders/demo_order_id",
				Rel:    "self",
				Method: "GET",
			},
		},
	}, nil
}

// Helper function to capture PayPal payment (for production use)
func (p *PaypalProvider) capturePayPalOrder(orderID string) error {
	// Demo mode - just log
	fmt.Printf("PayPal order captured: %s\n", orderID)
	return nil
}
