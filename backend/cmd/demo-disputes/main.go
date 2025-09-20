package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/Andrew-mugwe/agroai/services/payouts"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/disputes"
	"github.com/Andrew-mugwe/agroai/services/escrow"
	"github.com/Andrew-mugwe/agroai/services/payments"
	"github.com/google/uuid"
)

func main() {
	var (
		action      = flag.String("action", "", "Action: open, respond, escalate, resolve")
		order       = flag.String("order", "", "Order ID for open action")
		dispute     = flag.String("dispute", "", "Dispute ID for respond/escalate/resolve actions")
		reason      = flag.String("reason", "damaged", "Reason for open action: undelivered, damaged, wrong_item, other")
		description = flag.String("description", "Demo dispute description", "Description for open action")
		note        = flag.String("note", "Demo seller response", "Note for respond action")
		decision    = flag.String("decision", "", "Decision for resolve action: buyer_favor, seller_favor, partial, no_fault")
		resolver    = flag.String("resolver", "", "Resolver ID for resolve action")
		userType    = flag.String("user_type", "buyer", "User type for list action: buyer, seller")
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
	disputeSvc := disputes.NewDisputeService(nil, escrowSvc)

	switch *action {
	case "open":
		handleOpen(disputeSvc, *order, *reason, *description)
	case "respond":
		handleRespond(disputeSvc, *dispute, *note)
	case "escalate":
		handleEscalate(disputeSvc, *dispute)
	case "resolve":
		handleResolve(disputeSvc, *dispute, *decision, *resolver)
	case "list":
		handleList(disputeSvc, *userType)
	case "summary":
		handleSummary(disputeSvc)
	default:
		fmt.Printf("❌ Unknown action: %s\n", *action)
		printUsage()
		os.Exit(1)
	}
}

func handleOpen(disputeSvc *disputes.DisputeService, orderStr, reason, description string) {
	if orderStr == "" {
		fmt.Println("❌ Order ID is required for open action")
		printUsage()
		return
	}

	orderID, err := uuid.Parse(orderStr)
	if err != nil {
		fmt.Printf("❌ Invalid order ID: %s\n", orderStr)
		return
	}

	// Generate demo UUIDs
	buyerID := uuid.New()

	req := &models.DisputeRequest{
		OrderID:     orderID,
		BuyerID:     buyerID,
		Reason:      models.DisputeReason(reason),
		Description: description,
		Evidence:    []string{"demo_evidence_1.jpg", "demo_evidence_2.pdf"},
		Metadata: map[string]interface{}{
			"demo":       true,
			"created_by": "cli",
		},
	}

	dispute, err := disputeSvc.OpenDispute(req)
	if err != nil {
		fmt.Printf("❌ Failed to open dispute: %v\n", err)
		return
	}

	fmt.Printf("🚨 Dispute opened successfully!\n")
	fmt.Printf("   Dispute ID: %s\n", dispute.ID)
	fmt.Printf("   Order ID: %s\n", dispute.OrderID)
	fmt.Printf("   Status: %s\n", dispute.Status)
	fmt.Printf("   Reason: %s\n", dispute.Reason)
	fmt.Printf("   Created: %s\n", dispute.CreatedAt.Format("2006-01-02 15:04:05"))
	fmt.Printf("   Badge: %s\n", dispute.GetStatusBadge())
}

func handleRespond(disputeSvc *disputes.DisputeService, disputeStr, note string) {
	if disputeStr == "" {
		fmt.Println("❌ Dispute ID is required for respond action")
		printUsage()
		return
	}

	disputeID, err := uuid.Parse(disputeStr)
	if err != nil {
		fmt.Printf("❌ Invalid dispute ID: %s\n", disputeStr)
		return
	}

	// Generate demo seller ID
	sellerID := uuid.New()

	err = disputeSvc.AddSellerResponse(disputeID, sellerID, note, []string{"seller_evidence_1.pdf"})
	if err != nil {
		fmt.Printf("❌ Failed to add seller response: %v\n", err)
		return
	}

	fmt.Printf("📝 Seller response added successfully!\n")
	fmt.Printf("   Dispute ID: %s\n", disputeID)
	fmt.Printf("   Note: %s\n", note)
}

func handleEscalate(disputeSvc *disputes.DisputeService, disputeStr string) {
	if disputeStr == "" {
		fmt.Println("❌ Dispute ID is required for escalate action")
		printUsage()
		return
	}

	disputeID, err := uuid.Parse(disputeStr)
	if err != nil {
		fmt.Printf("❌ Invalid dispute ID: %s\n", disputeStr)
		return
	}

	// Generate demo admin ID
	adminID := uuid.New()

	err = disputeSvc.EscalateDispute(disputeID, adminID)
	if err != nil {
		fmt.Printf("❌ Failed to escalate dispute: %v\n", err)
		return
	}

	fmt.Printf("⚖️ Dispute escalated successfully!\n")
	fmt.Printf("   Dispute ID: %s\n", disputeID)
	fmt.Printf("   Escalated by: %s\n", adminID)
}

func handleResolve(disputeSvc *disputes.DisputeService, disputeStr, decision, resolverStr string) {
	if disputeStr == "" || decision == "" || resolverStr == "" {
		fmt.Println("❌ Dispute ID, decision, and resolver are required for resolve action")
		printUsage()
		return
	}

	disputeID, err := uuid.Parse(disputeStr)
	if err != nil {
		fmt.Printf("❌ Invalid dispute ID: %s\n", disputeStr)
		return
	}

	resolverID, err := uuid.Parse(resolverStr)
	if err != nil {
		fmt.Printf("❌ Invalid resolver ID: %s\n", resolverStr)
		return
	}

	req := &models.DisputeResolutionRequest{
		DisputeID:      disputeID,
		Resolution:     models.DisputeResolution(decision),
		ResolutionNote: fmt.Sprintf("Dispute resolved in %s favor", decision),
		ResolvedBy:     resolverID,
		Metadata: map[string]interface{}{
			"demo": true,
		},
	}

	err = disputeSvc.ResolveDispute(req)
	if err != nil {
		fmt.Printf("❌ Failed to resolve dispute: %v\n", err)
		return
	}

	fmt.Printf("✅ Dispute resolved successfully!\n")
	fmt.Printf("   Dispute ID: %s\n", disputeID)
	fmt.Printf("   Resolution: %s\n", decision)
	fmt.Printf("   Resolved by: %s\n", resolverID)
}

func handleList(disputeSvc *disputes.DisputeService, userType string) {
	if userType == "" {
		fmt.Println("❌ User type is required for list action")
		printUsage()
		return
	}

	// Generate demo user ID
	userID := uuid.New()

	disputes, err := disputeSvc.GetDisputesByUser(userID, userType)
	if err != nil {
		fmt.Printf("❌ Failed to get disputes: %v\n", err)
		return
	}

	fmt.Printf("📋 Disputes for %s %s:\n", userType, userID)
	if len(disputes) == 0 {
		fmt.Println("   No disputes found")
		return
	}

	for i, dispute := range disputes {
		fmt.Printf("\n%d. Dispute %s\n", i+1, dispute.ID)
		fmt.Printf("   Status: %s\n", dispute.GetStatusBadge())
		fmt.Printf("   Reason: %s\n", dispute.GetReasonDescription())
		fmt.Printf("   Created: %s\n", dispute.CreatedAt.Format("2006-01-02 15:04:05"))
		if dispute.ResolvedAt != nil {
			fmt.Printf("   Resolved: %s\n", dispute.ResolvedAt.Format("2006-01-02 15:04:05"))
		}
	}
}

func handleSummary(disputeSvc *disputes.DisputeService) {
	summary, err := disputeSvc.GetDisputeSummary()
	if err != nil {
		fmt.Printf("❌ Failed to get dispute summary: %v\n", err)
		return
	}

	fmt.Println("📊 Dispute Summary")
	fmt.Println("==================")
	fmt.Printf("Total Disputes: %d\n", summary.TotalDisputes)
	fmt.Printf("Open Disputes: %d\n", summary.OpenDisputes)
	fmt.Printf("Under Review: %d\n", summary.UnderReviewDisputes)
	fmt.Printf("Resolved: %d\n", summary.ResolvedDisputes)
	fmt.Printf("Escalated: %d\n", summary.EscalatedDisputes)
	fmt.Printf("Buyer Wins: %d\n", summary.BuyerWins)
	fmt.Printf("Seller Wins: %d\n", summary.SellerWins)
	fmt.Printf("Avg Resolution Time: %.1f hours\n", summary.AverageResolutionTimeHours)
}

func printUsage() {
	fmt.Println("🚨 AgroAI Disputes Demo CLI")
	fmt.Println("===========================")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  go run cmd/demo_disputes.go -action=open -order=<order-id> [-reason=damaged] [-description='description']")
	fmt.Println("  go run cmd/demo_disputes.go -action=respond -dispute=<dispute-id> [-note='response note']")
	fmt.Println("  go run cmd/demo_disputes.go -action=escalate -dispute=<dispute-id>")
	fmt.Println("  go run cmd/demo_disputes.go -action=resolve -dispute=<dispute-id> -decision=<decision> -resolver=<resolver-id>")
	fmt.Println("  go run cmd/demo_disputes.go -action=list -user_type=<buyer|seller>")
	fmt.Println("  go run cmd/demo_disputes.go -action=summary")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  go run cmd/demo_disputes.go -action=open -order=123e4567-e89b-12d3-a456-426614174000 -reason=damaged")
	fmt.Println("  go run cmd/demo_disputes.go -action=respond -dispute=456e7890-e89b-12d3-a456-426614174000 -note='We shipped replacement'")
	fmt.Println("  go run cmd/demo_disputes.go -action=escalate -dispute=456e7890-e89b-12d3-a456-426614174000")
	fmt.Println("  go run cmd/demo_disputes.go -action=resolve -dispute=456e7890-e89b-12d3-a456-426614174000 -decision=buyer_favor -resolver=789e0123-e89b-12d3-a456-426614174000")
	fmt.Println("  go run cmd/demo_disputes.go -action=list -user_type=buyer")
	fmt.Println("  go run cmd/demo_disputes.go -action=summary")
	fmt.Println()
	fmt.Println("Reasons: undelivered, damaged, wrong_item, other")
	fmt.Println("Decisions: buyer_favor, seller_favor, partial, no_fault")
}
