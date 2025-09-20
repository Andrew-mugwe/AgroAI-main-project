package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/Andrew-mugwe/agroai/services/payments"
)

func main() {
	var refund = flag.Bool("refund", false, "Process a refund instead of payment")
	var phone = flag.String("phone", "", "Phone number for M-Pesa payments")
	flag.Parse()

	args := flag.Args()
	if len(args) < 3 {
		printUsage()
		os.Exit(1)
	}

	provider := strings.ToLower(args[0])
	amountStr := args[1]
	currency := strings.ToUpper(args[2])

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		fmt.Printf("❌ Invalid amount: %s\n", amountStr)
		os.Exit(1)
	}

	// Initialize providers
	initProviders()

	// Get provider
	paymentProvider, err := payments.GetProvider(provider)
	if err != nil {
		fmt.Printf("❌ Unsupported provider: %s\n", provider)
		printUsage()
		os.Exit(1)
	}

	if *refund {
		processRefund(paymentProvider, amount, currency)
	} else {
		processPayment(paymentProvider, amount, currency, *phone)
	}
}

func initProviders() {
	payments.RegisterProvider("stripe", payments.NewStripeProvider())
	payments.RegisterProvider("mpesa", payments.NewMpesaProvider())
	payments.RegisterProvider("paypal", payments.NewPaypalProvider())
}

func processPayment(provider payments.PaymentProvider, amount float64, currency string, phone string) {
	metadata := map[string]string{
		"demo": "true",
		"source": "cli",
	}
	
	// Add phone number for M-Pesa
	if phone != "" {
		metadata["phone"] = phone
	}

	response, err := provider.CreatePayment(amount, currency, metadata)
	if err != nil {
		fmt.Printf("❌ Payment failed: %v\n", err)
		return
	}

	fmt.Printf("✅ Payment of %.2f %s via %s processed successfully\n", 
		response.Amount, response.Currency, strings.Title(response.Provider))
	fmt.Printf("   Transaction ID: %s\n", response.TransactionID)
	fmt.Printf("   Status: %s\n", response.Status)
	
	// Show provider-specific details
	if response.Provider == "mpesa" && response.Metadata["phone"] != "" {
		fmt.Printf("   Phone: %s\n", response.Metadata["phone"])
	}
}

func processRefund(provider payments.PaymentProvider, amount float64, currency string) {
	// Generate a demo transaction ID for refund
	transactionID := fmt.Sprintf("demo_tx_%s_%d", strings.ToLower(currency), int(amount))
	
	err := provider.RefundPayment(transactionID, amount)
	if err != nil {
		fmt.Printf("❌ Refund failed: %v\n", err)
		return
	}

	fmt.Printf("↩️ Refund of %.2f %s via %s processed successfully (stub)\n", 
		amount, currency, getProviderName(provider))
	fmt.Printf("   Transaction ID: %s\n", transactionID)
}

func getProviderName(provider payments.PaymentProvider) string {
	// Simple way to get provider name for display
	switch provider.(type) {
	case *payments.StripeProvider:
		return "Stripe"
	case *payments.MpesaProvider:
		return "M-Pesa"
	case *payments.PaypalProvider:
		return "PayPal"
	default:
		return "Unknown"
	}
}

func printUsage() {
	fmt.Println("Usage: go run cmd/demo_payments.go <provider> <amount> <currency> [--refund] [--phone PHONE]")
	fmt.Println("")
	fmt.Println("Providers:")
	fmt.Println("  stripe  - Stripe payment processing")
	fmt.Println("  mpesa   - M-Pesa mobile payments")
	fmt.Println("  paypal  - PayPal payment processing")
	fmt.Println("")
	fmt.Println("Options:")
	fmt.Println("  --refund     Process a refund instead of payment")
	fmt.Println("  --phone      Phone number for M-Pesa payments (e.g., 254708374149)")
	fmt.Println("")
	fmt.Println("Examples:")
	fmt.Println("  go run cmd/demo_payments.go stripe 100 USD")
	fmt.Println("  go run cmd/demo_payments.go mpesa 500 KES --phone 254708374149")
	fmt.Println("  go run cmd/demo_payments.go paypal 20 USD")
	fmt.Println("  go run cmd/demo_payments.go --refund paypal 50 EUR")
}
