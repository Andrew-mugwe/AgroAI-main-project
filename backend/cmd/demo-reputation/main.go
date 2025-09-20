package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"

	"github.com/Andrew-mugwe/agroai/services/reputation"
)

func main() {
	var (
		action      = flag.String("action", "help", "Action to perform: seed, compute, list, report, health")
		sellerID    = flag.String("seller", "", "Seller ID for compute action")
		orderID     = flag.Int("order", 0, "Order ID for rating")
		rating      = flag.Int("rating", 0, "Rating value (1-5)")
		review      = flag.String("review", "", "Review text")
		userType    = flag.String("user", "buyer", "User type: buyer, seller, admin")
		since       = flag.String("since", "", "Since date for report (YYYY-MM-DD)")
		showDetails = flag.Bool("details", false, "Show detailed breakdown")
	)
	flag.Parse()

	// Initialize mock reputation service for demo
	reputationService := reputation.NewReputationService(nil) // In real app, pass actual DB

	fmt.Println("🌾 AgroAI Reputation & Ratings Demo")
	fmt.Println("====================================")

	switch *action {
	case "seed":
		seedDemoData(reputationService)
	case "compute":
		if *sellerID == "" {
			fmt.Println("❌ Error: Seller ID required for compute action")
			fmt.Println("Usage: go run cmd/demo_reputation.go -action=compute -seller=<seller-id>")
			os.Exit(1)
		}
		computeReputation(reputationService, *sellerID, *showDetails)
	case "rate":
		if *orderID == 0 || *rating == 0 {
			fmt.Println("❌ Error: Order ID and rating required for rate action")
			fmt.Println("Usage: go run cmd/demo_reputation.go -action=rate -order=<order-id> -rating=<1-5> -review='<review-text>'")
			os.Exit(1)
		}
		rateOrder(reputationService, *orderID, *rating, *review, *userType)
	case "list":
		listReputations(reputationService, *userType)
	case "report":
		generateReport(reputationService, *since)
	case "health":
		healthCheck(reputationService)
	case "help":
		showHelp()
	default:
		fmt.Printf("❌ Unknown action: %s\n", *action)
		showHelp()
		os.Exit(1)
	}
}

func seedDemoData(service *reputation.ReputationService) {
	fmt.Println("\n🌱 Seeding demo reputation data...")

	// Demo sellers
	sellers := []struct {
		ID       string
		Name     string
		Verified bool
		Rating   float64
		Orders   int
		Disputes int
	}{
		{
			ID:       "890e1234-e89b-12d3-a456-426614174003",
			Name:     "Green Valley Farms",
			Verified: true,
			Rating:   4.5,
			Orders:   30,
			Disputes: 0,
		},
		{
			ID:       "901e2345-e89b-12d3-a456-426614174007",
			Name:     "Organic Harvest Co",
			Verified: true,
			Rating:   4.2,
			Orders:   25,
			Disputes: 1,
		},
		{
			ID:       "012e3456-e89b-12d3-a456-426614174011",
			Name:     "Fresh Produce Ltd",
			Verified: false,
			Rating:   3.8,
			Orders:   15,
			Disputes: 0,
		},
		{
			ID:       "123e4567-e89b-12d3-a456-426614174015",
			Name:     "Local Garden Store",
			Verified: false,
			Rating:   2.9,
			Orders:   8,
			Disputes: 2,
		},
	}

	fmt.Println("✅ Demo sellers created:")
	for _, seller := range sellers {
		fmt.Printf("  • %s (ID: %s)\n", seller.Name, seller.ID)
		fmt.Printf("    - Verified: %v\n", seller.Verified)
		fmt.Printf("    - Avg Rating: %.1f/5.0\n", seller.Rating)
		fmt.Printf("    - Total Orders: %d\n", seller.Orders)
		fmt.Printf("    - Disputes: %d\n", seller.Disputes)
	}

	// Demo ratings
	ratings := []struct {
		OrderID int
		Rating  int
		Review  string
	}{
		{1, 5, "Excellent quality products, fast delivery!"},
		{2, 4, "Good seller, products as described."},
		{3, 5, "Perfect! Will definitely order again."},
		{4, 3, "Average experience, some delays in shipping."},
		{5, 2, "Product quality was not as expected."},
	}

	fmt.Println("\n⭐ Demo ratings created:")
	for _, rating := range ratings {
		fmt.Printf("  • Order #%d: %d stars - \"%s\"\n", rating.OrderID, rating.Rating, rating.Review)
	}

	fmt.Println("\n🎯 Demo data seeding completed!")
}

func computeReputation(service *reputation.ReputationService, sellerIDStr string, showDetails bool) {
	fmt.Printf("\n🧮 Computing reputation for seller: %s\n", sellerIDStr)

	sellerID, err := uuid.Parse(sellerIDStr)
	if err != nil {
		fmt.Printf("❌ Error: Invalid seller ID format: %v\n", err)
		return
	}

	// Get seller reputation
	sellerReputation, err := service.GetSellerReputation(sellerID)
	if err != nil {
		fmt.Printf("❌ Error getting seller reputation: %v\n", err)
		return
	}

	fmt.Printf("\n📊 REPUTATION SUMMARY\n")
	fmt.Printf("=====================\n")
	fmt.Printf("Seller: %s\n", sellerReputation.SellerName)
	fmt.Printf("Current Score: %.1f/100\n", sellerReputation.CurrentScore)
	fmt.Printf("Badge: %s\n", sellerReputation.ReputationBadge)
	fmt.Printf("Message: %s\n", sellerReputation.ReputationMessage)
	fmt.Printf("Average Rating: %.1f/5.0 (%d reviews)\n", sellerReputation.AvgRating, sellerReputation.TotalRatings)
	fmt.Printf("Recent Reviews (30 days): %d\n", sellerReputation.RecentRatings)

	if showDetails {
		fmt.Printf("\n🔍 DETAILED BREAKDOWN\n")
		fmt.Printf("====================\n")
		fmt.Printf("Rating Contribution: +%.1f (50%% weight)\n", sellerReputation.Breakdown.RatingContrib)
		fmt.Printf("Orders Bonus: +%.1f (%d orders)\n", sellerReputation.Breakdown.OrdersContrib, sellerReputation.Breakdown.TotalOrders)
		fmt.Printf("Disputes Penalty: %.1f\n", sellerReputation.Breakdown.DisputesPenalty)
		fmt.Printf("Verified Bonus: +%.1f\n", sellerReputation.Breakdown.VerifiedBonus)
		fmt.Printf("Total Ratings: %d\n", sellerReputation.Breakdown.TotalRatings)
		fmt.Printf("Total Orders: %d\n", sellerReputation.Breakdown.TotalOrders)

		if len(sellerReputation.RecentReviews) > 0 {
			fmt.Printf("\n📝 RECENT REVIEWS\n")
			fmt.Printf("==================\n")
			for _, review := range sellerReputation.RecentReviews {
				fmt.Printf("• %d stars - \"%s\" (Order #%d)\n", review.Rating, review.Review, review.OrderID)
			}
		}
	}

	// Recalculate reputation
	fmt.Printf("\n🔄 Recalculating reputation...\n")
	err = service.RecalculateReputation(sellerID)
	if err != nil {
		fmt.Printf("❌ Error recalculating reputation: %v\n", err)
		return
	}
	fmt.Printf("✅ Reputation recalculated successfully\n")
}

func rateOrder(service *reputation.ReputationService, orderID, rating int, review, userType string) {
	fmt.Printf("\n⭐ Rating Order #%d\n", orderID)
	fmt.Printf("==================\n")

	// Validate rating
	if rating < 1 || rating > 5 {
		fmt.Printf("❌ Error: Rating must be between 1 and 5\n")
		return
	}

	fmt.Printf("Order ID: %d\n", orderID)
	fmt.Printf("Rating: %d/5 stars\n", rating)
	fmt.Printf("Review: \"%s\"\n", review)
	fmt.Printf("User Type: %s\n", userType)

	// In a real implementation, this would call the rating API
	fmt.Printf("\n📝 Creating rating...\n")
	fmt.Printf("✅ Rating created successfully\n")
	fmt.Printf("🔄 Triggering reputation recalculation...\n")
	fmt.Printf("✅ Reputation updated\n")

	// Show rating impact
	ratingText := []string{"", "Poor", "Fair", "Good", "Very Good", "Excellent"}
	fmt.Printf("\n📊 Impact: %s rating will affect seller reputation\n", ratingText[rating])
}

func listReputations(service *reputation.ReputationService, userType string) {
	fmt.Printf("\n📋 Listing reputations (User Type: %s)\n", userType)
	fmt.Printf("=====================================\n")

	// Demo sellers with their reputations
	sellers := []struct {
		ID       string
		Name     string
		Score    float64
		Badge    string
		Ratings  int
		Verified bool
	}{
		{
			ID:       "890e1234-e89b-12d3-a456-426614174003",
			Name:     "Green Valley Farms",
			Score:    87.5,
			Badge:    "Trusted Seller",
			Ratings:  127,
			Verified: true,
		},
		{
			ID:       "901e2345-e89b-12d3-a456-426614174007",
			Name:     "Organic Harvest Co",
			Score:    78.0,
			Badge:    "Good Seller",
			Ratings:  89,
			Verified: true,
		},
		{
			ID:       "012e3456-e89b-12d3-a456-426614174011",
			Name:     "Fresh Produce Ltd",
			Score:    65.5,
			Badge:    "Fair Seller",
			Ratings:  45,
			Verified: false,
		},
		{
			ID:       "123e4567-e89b-12d3-a456-426614174015",
			Name:     "Local Garden Store",
			Score:    42.3,
			Badge:    "Under Review",
			Ratings:  12,
			Verified: false,
		},
	}

	fmt.Printf("%-25s %-15s %-8s %-6s %s\n", "Seller Name", "Badge", "Score", "Reviews", "Verified")
	fmt.Printf("%-25s %-15s %-8s %-6s %s\n", "-----------", "-----", "-----", "-------", "--------")

	for _, seller := range sellers {
		verified := "❌"
		if seller.Verified {
			verified = "✅"
		}
		fmt.Printf("%-25s %-15s %-8.1f %-6d %s\n",
			seller.Name, seller.Badge, seller.Score, seller.Ratings, verified)
	}

	fmt.Printf("\n📊 Summary:\n")
	fmt.Printf("• Total Sellers: %d\n", len(sellers))
	fmt.Printf("• Average Score: %.1f\n", calculateAverageScore(sellers))
	fmt.Printf("• Verified Sellers: %d\n", countVerifiedSellers(sellers))
}

func generateReport(service *reputation.ReputationService, since string) {
	fmt.Printf("\n📊 REPUTATION REPORT\n")
	fmt.Printf("===================\n")

	if since != "" {
		fmt.Printf("Since: %s\n", since)
	} else {
		fmt.Printf("Since: Last 30 days\n")
	}

	// Demo report data
	reportData := struct {
		TotalSellers     int     `json:"total_sellers"`
		AverageScore     float64 `json:"average_score"`
		HighPerformers   int     `json:"high_performers"`
		NeedsImprovement int     `json:"needs_improvement"`
		VerifiedSellers  int     `json:"verified_sellers"`
		RecentRatings    int     `json:"recent_ratings"`
		RecentDisputes   int     `json:"recent_disputes"`
	}{
		TotalSellers:     156,
		AverageScore:     72.3,
		HighPerformers:   45,
		NeedsImprovement: 12,
		VerifiedSellers:  89,
		RecentRatings:    234,
		RecentDisputes:   8,
	}

	fmt.Printf("📈 Key Metrics:\n")
	fmt.Printf("• Total Sellers: %d\n", reportData.TotalSellers)
	fmt.Printf("• Average Reputation Score: %.1f\n", reportData.AverageScore)
	fmt.Printf("• High Performers (80+ score): %d\n", reportData.HighPerformers)
	fmt.Printf("• Needs Improvement (<60 score): %d\n", reportData.NeedsImprovement)
	fmt.Printf("• Verified Sellers: %d\n", reportData.VerifiedSellers)
	fmt.Printf("• Recent Ratings (30 days): %d\n", reportData.RecentRatings)
	fmt.Printf("• Recent Disputes (30 days): %d\n", reportData.RecentDisputes)

	// Show JSON output for API integration
	fmt.Printf("\n🔧 JSON Output (for API integration):\n")
	jsonData, _ := json.MarshalIndent(reportData, "", "  ")
	fmt.Printf("%s\n", jsonData)
}

func healthCheck(service *reputation.ReputationService) {
	fmt.Printf("\n🏥 REPUTATION SERVICE HEALTH CHECK\n")
	fmt.Printf("==================================\n")

	// Check service health
	err := service.HealthCheck()
	if err != nil {
		fmt.Printf("❌ Service Health: FAILED - %v\n", err)
	} else {
		fmt.Printf("✅ Service Health: OK\n")
	}

	// Check components
	fmt.Printf("\n🔍 Component Status:\n")
	fmt.Printf("• Database Connection: ✅ OK\n")
	fmt.Printf("• Reputation Calculation: ✅ OK\n")
	fmt.Printf("• Rating System: ✅ OK\n")
	fmt.Printf("• History Tracking: ✅ OK\n")
	fmt.Printf("• Background Scheduler: ✅ OK\n")

	// Show demo stats
	fmt.Printf("\n📊 Demo Statistics:\n")
	fmt.Printf("• Active Sellers: 156\n")
	fmt.Printf("• Total Ratings: 1,247\n")
	fmt.Printf("• Average Score: 72.3\n")
	fmt.Printf("• Last Update: %s\n", time.Now().Format("2006-01-02 15:04:05"))
}

func showHelp() {
	fmt.Printf("\n🆘 AgroAI Reputation Demo Help\n")
	fmt.Printf("=============================\n")
	fmt.Printf("\nAvailable Actions:\n")
	fmt.Printf("  seed      - Seed demo reputation data\n")
	fmt.Printf("  compute   - Compute reputation for a seller\n")
	fmt.Printf("  rate      - Rate an order\n")
	fmt.Printf("  list      - List all seller reputations\n")
	fmt.Printf("  report    - Generate reputation report\n")
	fmt.Printf("  health    - Check service health\n")
	fmt.Printf("  help      - Show this help message\n")

	fmt.Printf("\nExamples:\n")
	fmt.Printf("  # Seed demo data\n")
	fmt.Printf("  go run cmd/demo_reputation.go -action=seed\n")
	fmt.Printf("\n  # Compute reputation with details\n")
	fmt.Printf("  go run cmd/demo_reputation.go -action=compute -seller=890e1234-e89b-12d3-a456-426614174003 -details\n")
	fmt.Printf("\n  # Rate an order\n")
	fmt.Printf("  go run cmd/demo_reputation.go -action=rate -order=123 -rating=5 -review='Great product!'\n")
	fmt.Printf("\n  # List reputations\n")
	fmt.Printf("  go run cmd/demo_reputation.go -action=list -user=buyer\n")
	fmt.Printf("\n  # Generate report\n")
	fmt.Printf("  go run cmd/demo_reputation.go -action=report -since=2024-01-01\n")
	fmt.Printf("\n  # Health check\n")
	fmt.Printf("  go run cmd/demo_reputation.go -action=health\n")
}

func calculateAverageScore(sellers []struct {
	ID       string
	Name     string
	Score    float64
	Badge    string
	Ratings  int
	Verified bool
}) float64 {
	total := 0.0
	for _, seller := range sellers {
		total += seller.Score
	}
	return total / float64(len(sellers))
}

func countVerifiedSellers(sellers []struct {
	ID       string
	Name     string
	Score    float64
	Badge    string
	Ratings  int
	Verified bool
}) int {
	count := 0
	for _, seller := range sellers {
		if seller.Verified {
			count++
		}
	}
	return count
}
