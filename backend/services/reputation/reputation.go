package reputation

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// ReputationService handles reputation calculations and management
type ReputationService struct {
	db *sql.DB
}

// ReputationBreakdown represents the components of a reputation score
type ReputationBreakdown struct {
	RatingContrib   float64 `json:"rating_contrib"`
	OrdersContrib   float64 `json:"orders_contrib"`
	DisputesPenalty float64 `json:"disputes_penalty"`
	VerifiedBonus   float64 `json:"verified_bonus"`
	TotalRatings    int     `json:"total_ratings"`
	TotalOrders     int     `json:"total_orders"`
	CalculatedScore float64 `json:"calculated_score"`
}

// ReputationHistory represents a historical reputation entry
type ReputationHistory struct {
	ID        int             `json:"id"`
	UserID    uuid.UUID       `json:"user_id"`
	Score     float64         `json:"score"`
	Reason    string          `json:"reason"`
	Metadata  json.RawMessage `json:"metadata"`
	CreatedAt time.Time       `json:"created_at"`
}

// SellerReputation represents current reputation for a seller
type SellerReputation struct {
	SellerID          uuid.UUID           `json:"seller_id"`
	SellerName        string              `json:"seller_name"`
	AvgRating         float64             `json:"avg_rating"`
	TotalRatings      int                 `json:"total_ratings"`
	FiveStarRatings   int                 `json:"five_star_ratings"`
	PositiveRatings   int                 `json:"positive_ratings"`
	NegativeRatings   int                 `json:"negative_ratings"`
	RecentRatings     int                 `json:"recent_ratings"`
	CurrentScore      float64             `json:"current_score"`
	Breakdown         ReputationBreakdown `json:"breakdown"`
	RecentReviews     []Rating            `json:"recent_reviews"`
	ReputationBadge   string              `json:"reputation_badge"`
	ReputationMessage string              `json:"reputation_message"`
}

// Rating represents a single rating/review
type Rating struct {
	ID         int       `json:"id"`
	OrderID    int       `json:"order_id"`
	ReviewerID uuid.UUID `json:"reviewer_id"`
	SellerID   uuid.UUID `json:"seller_id"`
	Rating     int       `json:"rating"`
	Review     string    `json:"review"`
	CreatedAt  time.Time `json:"created_at"`
}

// NewReputationService creates a new reputation service
func NewReputationService(db *sql.DB) *ReputationService {
	return &ReputationService{db: db}
}

// ComputeReputation calculates the reputation score for a user
func (rs *ReputationService) ComputeReputation(userID uuid.UUID) (float64, ReputationBreakdown, error) {
	var breakdown ReputationBreakdown

	// Get reputation breakdown from database view
	query := `
		SELECT 
			rating_contrib,
			orders_contrib,
			disputes_penalty,
			verified_bonus,
			total_ratings,
			total_orders,
			calculated_score
		FROM reputation_breakdown 
		WHERE user_id = $1
	`

	err := rs.db.QueryRow(query, userID).Scan(
		&breakdown.RatingContrib,
		&breakdown.OrdersContrib,
		&breakdown.DisputesPenalty,
		&breakdown.VerifiedBonus,
		&breakdown.TotalRatings,
		&breakdown.TotalOrders,
		&breakdown.CalculatedScore,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// User has no ratings yet, return default score
			return 50.0, ReputationBreakdown{
				RatingContrib:   0,
				OrdersContrib:   0,
				DisputesPenalty: 0,
				VerifiedBonus:   0,
				TotalRatings:    0,
				TotalOrders:     0,
				CalculatedScore: 50.0,
			}, nil
		}
		return 0, ReputationBreakdown{}, err
	}

	return breakdown.CalculatedScore, breakdown, nil
}

// RecalculateReputation recalculates and stores reputation for a user
func (rs *ReputationService) RecalculateReputation(userID uuid.UUID) error {
	// Start transaction
	tx, err := rs.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Compute new reputation
	score, breakdown, err := rs.ComputeReputation(userID)
	if err != nil {
		return fmt.Errorf("failed to compute reputation: %w", err)
	}

	// Convert breakdown to JSON
	breakdownJSON, err := json.Marshal(breakdown)
	if err != nil {
		return fmt.Errorf("failed to marshal breakdown: %w", err)
	}

	// Insert into reputation history
	insertQuery := `
		INSERT INTO reputation_history (user_id, score, reason, metadata)
		VALUES ($1, $2, $3, $4)
	`

	_, err = tx.Exec(insertQuery, userID, score, "Manual recalculation", breakdownJSON)
	if err != nil {
		return fmt.Errorf("failed to insert reputation history: %w", err)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetReputation returns current reputation and history for a user
func (rs *ReputationService) GetReputation(userID uuid.UUID) (float64, []ReputationHistory, error) {
	// Get current score
	score, _, err := rs.ComputeReputation(userID)
	if err != nil {
		return 0, nil, err
	}

	// Get history
	historyQuery := `
		SELECT id, user_id, score, reason, metadata, created_at
		FROM reputation_history
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`

	rows, err := rs.db.Query(historyQuery, userID)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to query reputation history: %w", err)
	}
	defer rows.Close()

	var history []ReputationHistory
	for rows.Next() {
		var h ReputationHistory
		var metadataStr string

		err := rows.Scan(
			&h.ID,
			&h.UserID,
			&h.Score,
			&h.Reason,
			&metadataStr,
			&h.CreatedAt,
		)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to scan reputation history: %w", err)
		}

		// Parse metadata JSON
		if metadataStr != "" {
			h.Metadata = json.RawMessage(metadataStr)
		}

		history = append(history, h)
	}

	return score, history, nil
}

// GetSellerReputation returns comprehensive reputation info for a seller
func (rs *ReputationService) GetSellerReputation(sellerID uuid.UUID) (*SellerReputation, error) {
	var reputation SellerReputation

	// Get basic seller info and reputation summary
	summaryQuery := `
		SELECT 
			seller_id,
			seller_name,
			avg_rating,
			total_ratings,
			five_star_ratings,
			positive_ratings,
			negative_ratings,
			recent_ratings,
			current_reputation_score
		FROM seller_reputation_summary
		WHERE seller_id = $1
	`

	err := rs.db.QueryRow(summaryQuery, sellerID).Scan(
		&reputation.SellerID,
		&reputation.SellerName,
		&reputation.AvgRating,
		&reputation.TotalRatings,
		&reputation.FiveStarRatings,
		&reputation.PositiveRatings,
		&reputation.NegativeRatings,
		&reputation.RecentRatings,
		&reputation.CurrentScore,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// Seller not found or no reputation data
			return &SellerReputation{
				SellerID:          sellerID,
				SellerName:        "Unknown Seller",
				AvgRating:         0,
				TotalRatings:      0,
				CurrentScore:      50.0,
				ReputationBadge:   "New Seller",
				ReputationMessage: "This seller is new to our platform",
			}, nil
		}
		return nil, fmt.Errorf("failed to get seller reputation: %w", err)
	}

	// Get breakdown
	_, breakdown, err := rs.ComputeReputation(sellerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reputation breakdown: %w", err)
	}
	reputation.Breakdown = breakdown

	// Get recent reviews
	reviewsQuery := `
		SELECT r.id, r.order_id, r.reviewer_id, r.seller_id, r.rating, r.review, r.created_at
		FROM ratings r
		WHERE r.seller_id = $1
		ORDER BY r.created_at DESC
		LIMIT 5
	`

	rows, err := rs.db.Query(reviewsQuery, sellerID)
	if err != nil {
		return nil, fmt.Errorf("failed to query recent reviews: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var review Rating
		err := rows.Scan(
			&review.ID,
			&review.OrderID,
			&review.ReviewerID,
			&review.SellerID,
			&review.Rating,
			&review.Review,
			&review.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reputation.RecentReviews = append(reputation.RecentReviews, review)
	}

	// Generate reputation badge and message
	reputation.ReputationBadge, reputation.ReputationMessage = rs.generateReputationBadge(reputation.CurrentScore, reputation.TotalRatings)

	return &reputation, nil
}

// generateReputationBadge creates a reputation badge and message based on score
func (rs *ReputationService) generateReputationBadge(score float64, totalRatings int) (string, string) {
	if totalRatings == 0 {
		return "New Seller", "This seller is new to our platform"
	}

	if score >= 90 {
		return "Top Seller", "Excellent reputation with outstanding service"
	} else if score >= 80 {
		return "Trusted Seller", "High-quality seller with great reviews"
	} else if score >= 70 {
		return "Good Seller", "Reliable seller with positive feedback"
	} else if score >= 60 {
		return "Fair Seller", "Satisfactory service with room for improvement"
	} else if score >= 50 {
		return "Needs Improvement", "Working to improve service quality"
	} else {
		return "Under Review", "Service quality needs attention"
	}
}

// GetReputationReport returns a report of users with reputation issues
func (rs *ReputationService) GetReputationReport(since time.Time) ([]SellerReputation, error) {
	query := `
		SELECT 
			seller_id,
			seller_name,
			avg_rating,
			total_ratings,
			five_star_ratings,
			positive_ratings,
			negative_ratings,
			recent_ratings,
			current_reputation_score
		FROM seller_reputation_summary
		WHERE current_reputation_score < 60 OR current_reputation_score > 95
		ORDER BY current_reputation_score ASC
	`

	rows, err := rs.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query reputation report: %w", err)
	}
	defer rows.Close()

	var report []SellerReputation
	for rows.Next() {
		var reputation SellerReputation
		err := rows.Scan(
			&reputation.SellerID,
			&reputation.SellerName,
			&reputation.AvgRating,
			&reputation.TotalRatings,
			&reputation.FiveStarRatings,
			&reputation.PositiveRatings,
			&reputation.NegativeRatings,
			&reputation.RecentRatings,
			&reputation.CurrentScore,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reputation report: %w", err)
		}

		// Get breakdown
		_, breakdown, err := rs.ComputeReputation(reputation.SellerID)
		if err == nil {
			reputation.Breakdown = breakdown
		}

		// Generate badge
		reputation.ReputationBadge, reputation.ReputationMessage = rs.generateReputationBadge(reputation.CurrentScore, reputation.TotalRatings)

		report = append(report, reputation)
	}

	return report, nil
}

// HealthCheck verifies the reputation service is working
func (rs *ReputationService) HealthCheck() error {
	// Test database connection
	err := rs.db.Ping()
	if err != nil {
		return fmt.Errorf("database connection failed: %w", err)
	}

	// Test reputation calculation with a known user
	testUserID := uuid.MustParse("890e1234-e89b-12d3-a456-426614174003")
	_, _, err = rs.ComputeReputation(testUserID)
	if err != nil {
		return fmt.Errorf("reputation calculation test failed: %w", err)
	}

	return nil
}
