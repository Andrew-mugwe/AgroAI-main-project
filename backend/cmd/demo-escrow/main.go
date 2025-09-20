package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/escrow"
	"github.com/Andrew-mugwe/agroai/services/payments"
	"github.com/Andrew-mugwe/agroai/services/payouts"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func main() {
	var (
		action   = flag.String("action", "", "Action: create, release, refund, status")
		order    = flag.String("order", "", "Order ID for create action")
		amount   = flag.String("amount", "", "Amount for create action")
		currency = flag.String("currency", "USD", "Currency code")
		escrowID = flag.String("escrow", "", "Escrow ID for release/refund actions")
		account  = flag.String("account", "", "Seller account ID for release action")
		provider = flag.String("provider", "stripe", "Payout provider: stripe, mpesa, paypal")
		reason   = flag.String("reason", "Demo refund", "Reason for refund")
	)
	flag.Parse()

	if *action == "" {
		printUsage()
		os.Exit(1)
	}

	// Initialize services (in real app, these would be properly configured)
	paymentSvc := payments.NewPaymentService()
	payoutSvc := payouts.NewPayoutService()
	escrowSvc := escrow.NewEscrowService(nil, paymentSvc, payoutSvc)

	switch *action {
	case "create":
		handleCreate(escrowSvc, *order, *amount, *currency)
	case "release":
		handleRelease(escrowSvc, *escrowID, *account, *provider)
	case "refund":
		handleRefund(escrowSvc, *escrowID, *reason)
	case "status":
		handleStatus(escrowSvc, *escrowID)
	case "capabilities":
		handleCapabilities(payoutSvc)
	default:
		fmt.Printf("❌ Unknown action: %s\n", *action)
		printUsage()
		os.Exit(1)
	}
}

func handleCreate(escrowSvc *escrow.EscrowService, orderStr, amountStr, currency string) {
	if orderStr == "" || amountStr == "" {
		fmt.Println("❌ Order ID and amount are required for create action")
		printUsage()
		return
	}

	orderID, err := uuid.Parse(orderStr)
	if err != nil {
		fmt.Printf("❌ Invalid order ID: %s\n", orderStr)
		return
	}

	amount, err := decimal.NewFromString(amountStr)
	if err != nil {
		fmt.Printf("❌ Invalid amount: %s\n", amountStr)
		return
	}

	// Generate demo UUIDs
	buyerID := uuid.New()
	sellerID := uuid.New()

	req := &models.EscrowRequest{
		OrderID:  orderID,
		BuyerID:  buyerID,
		SellerID: sellerID,
		Amount:   amount,
		Currency: currency,
		Metadata: map[string]interface{}{
			"demo":       true,
			"created_by": "cli",
		},
	}

	resp, err := escrowSvc.CreateEscrow(req)
	if err != nil {
		fmt.Printf("❌ Failed to create escrow: %v\n", err)
		return
	}

	fmt.Printf("✅ Escrow created successfully!\n")
	fmt.Printf("   Escrow ID: %s\n", resp.EscrowID)
	fmt.Printf("   Status: %s\n", resp.Status)
	fmt.Printf("   Amount: %s %s\n", resp.Amount.String(), resp.Currency)
	fmt.Printf("   Created: %s\n", resp.CreatedAt.Format("2006-01-02 15:04:05"))
	fmt.Printf("   Message: %s\n", resp.Message)
}

func handleRelease(escrowSvc *escrow.EscrowService, escrowStr, account, provider string) {
	if escrowStr == "" || account == "" {
		fmt.Println("❌ Escrow ID and account are required for release action")
		printUsage()
		return
	}

	escrowID, err := uuid.Parse(escrowStr)
	if err != nil {
		fmt.Printf("❌ Invalid escrow ID: %s\n", escrowStr)
		return
	}

	err = escrowSvc.ReleaseEscrow(escrowID, account, provider)
	if err != nil {
		fmt.Printf("❌ Failed to release escrow: %v\n", err)
		return
	}

	fmt.Printf("✅ Escrow released successfully!\n")
	fmt.Printf("   Escrow ID: %s\n", escrowID)
	fmt.Printf("   Provider: %s\n", provider)
	fmt.Printf("   Account: %s\n", account)
}

func handleRefund(escrowSvc *escrow.EscrowService, escrowStr, reason string) {
	if escrowStr == "" {
		fmt.Println("❌ Escrow ID is required for refund action")
		printUsage()
		return
	}

	escrowID, err := uuid.Parse(escrowStr)
	if err != nil {
		fmt.Printf("❌ Invalid escrow ID: %s\n", escrowStr)
		return
	}

	err = escrowSvc.RefundEscrow(escrowID, reason)
	if err != nil {
		fmt.Printf("❌ Failed to refund escrow: %v\n", err)
		return
	}

	fmt.Printf("✅ Escrow refunded successfully!\n")
	fmt.Printf("   Escrow ID: %s\n", escrowID)
	fmt.Printf("   Reason: %s\n", reason)
}

func handleStatus(escrowSvc *escrow.EscrowService, escrowStr string) {
	if escrowStr == "" {
		fmt.Println("❌ Escrow ID is required for status action")
		printUsage()
		return
	}

	escrowID, err := uuid.Parse(escrowStr)
	if err != nil {
		fmt.Printf("❌ Invalid escrow ID: %s\n", escrowStr)
		return
	}

	// Note: In a real implementation, this would query the database
	// For demo purposes, we'll simulate the response
	fmt.Printf("📊 Escrow Status (Demo Mode)\n")
	fmt.Printf("   Escrow ID: %s\n", escrowID)
	fmt.Printf("   Status: HELD\n")
	fmt.Printf("   Note: Database not connected in demo mode\n")
}

func handleCapabilities(payoutSvc *payouts.PayoutService) {
	fmt.Println("🏦 Payout Provider Capabilities")
	fmt.Println("=================================")

	capabilities := payoutSvc.GetProviderCapabilities()

	for _, caps := range capabilities {
		fmt.Printf("\n📱 %s\n", caps.Name)
		fmt.Printf("   Supported Currencies: %d\n", len(caps.Currencies))
		fmt.Printf("   Min Amount: %s\n", caps.MinAmount.String())
		fmt.Printf("   Max Amount: %s\n", caps.MaxAmount.String())
		fmt.Printf("   Processing Time: %s\n", caps.ProcessingTime)
	}
}

func printUsage() {
	fmt.Println("🏦 AgroAI Escrow Demo CLI")
	fmt.Println("=========================")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  go run cmd/demo_escrow.go -action=create -order=<order-id> -amount=<amount> [-currency=USD]")
	fmt.Println("  go run cmd/demo_escrow.go -action=release -escrow=<escrow-id> -account=<account> [-provider=stripe]")
	fmt.Println("  go run cmd/demo_escrow.go -action=refund -escrow=<escrow-id> [-reason='reason']")
	fmt.Println("  go run cmd/demo_escrow.go -action=status -escrow=<escrow-id>")
	fmt.Println("  go run cmd/demo_escrow.go -action=capabilities")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  go run cmd/demo_escrow.go -action=create -order=123e4567-e89b-12d3-a456-426614174000 -amount=50.00 -currency=USD")
	fmt.Println("  go run cmd/demo_escrow.go -action=release -escrow=456e7890-e89b-12d3-a456-426614174000 -account=acct_stripe123 -provider=stripe")
	fmt.Println("  go run cmd/demo_escrow.go -action=refund -escrow=456e7890-e89b-12d3-a456-426614174000 -reason='Buyer dispute'")
	fmt.Println("  go run cmd/demo_escrow.go -action=status -escrow=456e7890-e89b-12d3-a456-426614174000")
	fmt.Println("  go run cmd/demo_escrow.go -action=capabilities")
	fmt.Println()
	fmt.Println("Providers: stripe, mpesa, paypal")
	fmt.Println("Currencies: USD, EUR, GBP, KES, etc.")
}
