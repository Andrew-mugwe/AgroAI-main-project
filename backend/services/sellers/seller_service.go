package sellers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Seller represents an enhanced seller profile with trust signals
type Seller struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Name         string    `json:"name"`
	Bio          string    `json:"bio,omitempty"`
	ProfileImage string    `json:"profile_image,omitempty"`
	Location     Location  `json:"location"`
	Verified     bool      `json:"verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Location represents seller location information
type Location struct {
	Country string   `json:"country"`
	City    string   `json:"city"`
	Lat     *float64 `json:"lat,omitempty"`
	Lng     *float64 `json:"lng,omitempty"`
}

// Review represents a seller review
type Review struct {
	ID        uuid.UUID  `json:"id"`
	OrderID   *uuid.UUID `json:"order_id,omitempty"`
	BuyerID   uuid.UUID  `json:"buyer_id"`
	BuyerName string     `json:"buyer_name,omitempty"`
	SellerID  uuid.UUID  `json:"seller_id"`
	Rating    int        `json:"rating"`
	Comment   string     `json:"comment,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

// SellerProfile represents a complete seller profile with stats
type SellerProfile struct {
	Seller
	Stats         SellerStats         `json:"stats"`
	Reputation    ReputationBreakdown `json:"reputation"`
	RecentReviews []Review            `json:"recent_reviews,omitempty"`
}

// SellerStats represents aggregated seller statistics
type SellerStats struct {
	AvgRating       decimal.Decimal `json:"avg_rating"`
	TotalReviews    int             `json:"total_reviews"`
	FiveStarReviews int             `json:"five_star_reviews"`
	PositiveReviews int             `json:"positive_reviews"`
	NegativeReviews int             `json:"negative_reviews"`
	RecentReviews   int             `json:"recent_reviews"`
	TotalOrders     int             `json:"total_orders"`
	CompletedOrders int             `json:"completed_orders"`
	RecentOrders    int             `json:"recent_orders"`
	TotalSales      decimal.Decimal `json:"total_sales"`
	RecentSales     decimal.Decimal `json:"recent_sales"`
}

// ReputationBreakdown represents reputation calculation components
type ReputationBreakdown struct {
	BaseScore       decimal.Decimal `json:"base_score"`
	RatingContrib   decimal.Decimal `json:"rating_contrib"`
	OrdersContrib   decimal.Decimal `json:"orders_contrib"`
	DisputesPenalty decimal.Decimal `json:"disputes_penalty"`
	VerifiedBonus   decimal.Decimal `json:"verified_bonus"`
	FinalScore      decimal.Decimal `json:"final_score"`
	Badge           string          `json:"badge"`
	Message         string          `json:"message"`
}

// CreateReviewRequest represents a request to create a review
type CreateReviewRequest struct {
	OrderID uuid.UUID `json:"order_id" validate:"required"`
	Rating  int       `json:"rating" validate:"required,min=1,max=5"`
	Comment string    `json:"comment,omitempty" validate:"max=500"`
}

// UpdateSellerRequest represents a request to update seller profile
type UpdateSellerRequest struct {
	Name         string   `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Bio          string   `json:"bio,omitempty" validate:"omitempty,max=500"`
	ProfileImage string   `json:"profile_image,omitempty" validate:"omitempty,url"`
	Location     Location `json:"location,omitempty"`
}

// SellerService handles seller-related operations
type SellerService struct {
	db *sql.DB
}

// NewSellerService creates a new seller service
func NewSellerService(db *sql.DB) *SellerService {
	return &SellerService{db: db}
}

// GetSellerProfile retrieves a complete seller profile by seller ID
func (s *SellerService) GetSellerProfile(ctx context.Context, sellerID uuid.UUID) (*SellerProfile, error) {
	// Get seller basic info
	seller, err := s.getSellerByID(ctx, sellerID)
	if err != nil {
		return nil, err
	}

	// Get seller stats
	stats, err := s.getSellerStats(ctx, sellerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get seller stats: %w", err)
	}

	// Get reputation breakdown
	reputation, err := s.ComputeReputation(ctx, sellerID)
	if err != nil {
		return nil, fmt.Errorf("failed to compute reputation: %w", err)
	}

	// Get recent reviews
	reviews, err := s.getRecentReviews(ctx, sellerID, 5)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent reviews: %w", err)
	}

	return &SellerProfile{
		Seller:        *seller,
		Stats:         *stats,
		Reputation:    *reputation,
		RecentReviews: reviews,
	}, nil
}

// GetSellerByUserID retrieves a seller by user ID
func (s *SellerService) GetSellerByUserID(ctx context.Context, userID uuid.UUID) (*Seller, error) {
	return s.getSellerByUserID(ctx, userID)
}

// CreateOrUpdateSellerProfile creates or updates a seller profile
func (s *SellerService) CreateOrUpdateSellerProfile(ctx context.Context, userID uuid.UUID, req *UpdateSellerRequest) error {
	// Check if seller exists
	existing, err := s.getSellerByUserID(ctx, userID)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to check existing seller: %w", err)
	}

	if existing != nil {
		// Update existing seller
		return s.updateSeller(ctx, userID, req)
	} else {
		// Create new seller
		return s.createSeller(ctx, userID, req)
	}
}

// CreateReview creates a new review for a seller
func (s *SellerService) CreateReview(ctx context.Context, buyerID uuid.UUID, sellerID uuid.UUID, req *CreateReviewRequest) error {
	// Validate order ownership and completion
	if err := s.validateReviewEligibility(ctx, buyerID, req.OrderID); err != nil {
		return err
	}

	// Check if review already exists for this order
	var existingReviewID uuid.UUID
	checkQuery := `SELECT id FROM reviews WHERE order_id = $1`
	err := s.db.QueryRowContext(ctx, checkQuery, req.OrderID).Scan(&existingReviewID)
	if err != sql.ErrNoRows {
		return fmt.Errorf("review already exists for this order")
	}

	// Create review
	query := `
		INSERT INTO reviews (order_id, buyer_id, seller_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at`

	var reviewID uuid.UUID
	var createdAt time.Time
	err = s.db.QueryRowContext(ctx, query, req.OrderID, buyerID, sellerID, req.Rating, req.Comment).
		Scan(&reviewID, &createdAt)
	if err != nil {
		return fmt.Errorf("failed to create review: %w", err)
	}

	return nil
}

// GetSellerReviews retrieves reviews for a seller with pagination
func (s *SellerService) GetSellerReviews(ctx context.Context, sellerID uuid.UUID, limit, offset int) ([]Review, error) {
	query := `
		SELECT r.id, r.order_id, r.buyer_id, u.name, r.seller_id, r.rating, r.comment, r.created_at
		FROM reviews r
		JOIN users u ON r.buyer_id = u.id
		WHERE r.seller_id = $1
		ORDER BY r.created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := s.db.QueryContext(ctx, query, sellerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var review Review
		err := rows.Scan(
			&review.ID, &review.OrderID, &review.BuyerID, &review.BuyerName,
			&review.SellerID, &review.Rating, &review.Comment, &review.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reviews = append(reviews, review)
	}

	return reviews, nil
}

// ComputeReputation calculates the reputation score and breakdown for a seller
func (s *SellerService) ComputeReputation(ctx context.Context, sellerID uuid.UUID) (*ReputationBreakdown, error) {
	query := `SELECT calculate_reputation_score($1)`
	var score decimal.Decimal
	err := s.db.QueryRowContext(ctx, query, sellerID).Scan(&score)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate reputation score: %w", err)
	}

	// Get breakdown components
	breakdownQuery := `
		SELECT 
			COALESCE((AVG(r.rating) - 3) * 10, 0) as rating_contrib,
			LEAST(COUNT(DISTINCT o.id) * 0.5, 15) as orders_contrib,
			COALESCE((SELECT COUNT(*) * -2 FROM disputes WHERE seller_id = $1 AND created_at >= NOW() - INTERVAL '180 days' AND status IN ('RESOLVED_BUYER', 'ESCALATED')), 0) as disputes_penalty,
			(SELECT CASE WHEN verified THEN 10 ELSE 0 END FROM sellers WHERE user_id = $1) as verified_bonus
		FROM reviews r
		LEFT JOIN orders o ON r.seller_id = o.seller_id AND o.status = 'completed'
		WHERE r.seller_id = $1
		GROUP BY r.seller_id`

	var ratingContrib, ordersContrib, disputesPenalty, verifiedBonus decimal.Decimal
	err = s.db.QueryRowContext(ctx, breakdownQuery, sellerID).Scan(
		&ratingContrib, &ordersContrib, &disputesPenalty, &verifiedBonus,
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to get reputation breakdown: %w", err)
	}

	baseScore := decimal.NewFromInt(50)
	breakdown := &ReputationBreakdown{
		BaseScore:       baseScore,
		RatingContrib:   ratingContrib,
		OrdersContrib:   ordersContrib,
		DisputesPenalty: disputesPenalty,
		VerifiedBonus:   verifiedBonus,
		FinalScore:      score,
	}

	// Determine badge and message
	if score.GreaterThanOrEqual(decimal.NewFromInt(90)) {
		breakdown.Badge = "Excellent"
		breakdown.Message = "Highly trusted seller with excellent ratings"
	} else if score.GreaterThanOrEqual(decimal.NewFromInt(75)) {
		breakdown.Badge = "Very Good"
		breakdown.Message = "Reliable seller with good ratings"
	} else if score.GreaterThanOrEqual(decimal.NewFromInt(60)) {
		breakdown.Badge = "Good"
		breakdown.Message = "Trusted seller with positive feedback"
	} else if score.GreaterThanOrEqual(decimal.NewFromInt(40)) {
		breakdown.Badge = "Fair"
		breakdown.Message = "Seller with mixed feedback"
	} else {
		breakdown.Badge = "Poor"
		breakdown.Message = "Seller with concerning feedback"
	}

	return breakdown, nil
}

// RecalculateReputation forces a reputation recalculation and stores it in history
func (s *SellerService) RecalculateReputation(ctx context.Context, sellerID uuid.UUID) error {
	reputation, err := s.ComputeReputation(ctx, sellerID)
	if err != nil {
		return fmt.Errorf("failed to compute reputation: %w", err)
	}

	// Store in reputation history
	query := `
		INSERT INTO reputation_history (seller_id, score, breakdown, reason)
		VALUES ($1, $2, $3, $4)`

	_, err = s.db.ExecContext(ctx, query, sellerID, reputation.FinalScore, reputation, "Manual recalculation")
	if err != nil {
		return fmt.Errorf("failed to store reputation history: %w", err)
	}

	return nil
}

// VerifySeller updates the verification status of a seller
func (s *SellerService) VerifySeller(ctx context.Context, sellerID uuid.UUID, verified bool) error {
	query := `UPDATE sellers SET verified = $1, updated_at = now() WHERE user_id = $2`
	_, err := s.db.ExecContext(ctx, query, verified, sellerID)
	if err != nil {
		return fmt.Errorf("failed to update seller verification: %w", err)
	}

	// Recalculate reputation as verification affects score
	return s.RecalculateReputation(ctx, sellerID)
}

// Private helper methods

func (s *SellerService) getSellerByID(ctx context.Context, sellerID uuid.UUID) (*Seller, error) {
	query := `
		SELECT id, user_id, name, bio, profile_image, location, verified, created_at, updated_at
		FROM sellers
		WHERE id = $1`

	var seller Seller
	var locationJSON []byte
	err := s.db.QueryRowContext(ctx, query, sellerID).Scan(
		&seller.ID, &seller.UserID, &seller.Name, &seller.Bio, &seller.ProfileImage,
		&locationJSON, &seller.Verified, &seller.CreatedAt, &seller.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("seller not found")
		}
		return nil, fmt.Errorf("failed to get seller: %w", err)
	}

	// Parse location JSON
	if len(locationJSON) > 0 {
		if err := json.Unmarshal(locationJSON, &seller.Location); err != nil {
			seller.Location = Location{} // Default empty location
		}
	}

	return &seller, nil
}

func (s *SellerService) getSellerByUserID(ctx context.Context, userID uuid.UUID) (*Seller, error) {
	query := `
		SELECT id, user_id, name, bio, profile_image, location, verified, created_at, updated_at
		FROM sellers
		WHERE user_id = $1`

	var seller Seller
	var locationJSON []byte
	err := s.db.QueryRowContext(ctx, query, userID).Scan(
		&seller.ID, &seller.UserID, &seller.Name, &seller.Bio, &seller.ProfileImage,
		&locationJSON, &seller.Verified, &seller.CreatedAt, &seller.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Parse location JSON
	if len(locationJSON) > 0 {
		if err := json.Unmarshal(locationJSON, &seller.Location); err != nil {
			seller.Location = Location{} // Default empty location
		}
	}

	return &seller, nil
}

func (s *SellerService) getSellerStats(ctx context.Context, sellerID uuid.UUID) (*SellerStats, error) {
	query := `
		SELECT avg_rating, total_reviews, five_star_reviews, positive_reviews, negative_reviews,
		       recent_reviews, total_orders, completed_orders, recent_orders, total_sales, recent_sales
		FROM seller_stats
		WHERE seller_id = $1`

	var stats SellerStats
	err := s.db.QueryRowContext(ctx, query, sellerID).Scan(
		&stats.AvgRating, &stats.TotalReviews, &stats.FiveStarReviews, &stats.PositiveReviews,
		&stats.NegativeReviews, &stats.RecentReviews, &stats.TotalOrders, &stats.CompletedOrders,
		&stats.RecentOrders, &stats.TotalSales, &stats.RecentSales,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			// Return default stats if no data found
			return &SellerStats{}, nil
		}
		return nil, fmt.Errorf("failed to get seller stats: %w", err)
	}

	return &stats, nil
}

func (s *SellerService) getRecentReviews(ctx context.Context, sellerID uuid.UUID, limit int) ([]Review, error) {
	query := `
		SELECT r.id, r.order_id, r.buyer_id, u.name, r.seller_id, r.rating, r.comment, r.created_at
		FROM reviews r
		JOIN users u ON r.buyer_id = u.id
		WHERE r.seller_id = $1
		ORDER BY r.created_at DESC
		LIMIT $2`

	rows, err := s.db.QueryContext(ctx, query, sellerID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query recent reviews: %w", err)
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var review Review
		err := rows.Scan(
			&review.ID, &review.OrderID, &review.BuyerID, &review.BuyerName,
			&review.SellerID, &review.Rating, &review.Comment, &review.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reviews = append(reviews, review)
	}

	return reviews, nil
}

func (s *SellerService) validateReviewEligibility(ctx context.Context, buyerID uuid.UUID, orderID uuid.UUID) error {
	// Check if order exists, is completed, and belongs to buyer
	query := `
		SELECT status, buyer_id FROM orders 
		WHERE id = $1 AND buyer_id = $2`

	var status string
	var orderBuyerID uuid.UUID
	err := s.db.QueryRowContext(ctx, query, orderID, buyerID).Scan(&status, &orderBuyerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("order not found or does not belong to buyer")
		}
		return fmt.Errorf("failed to validate order: %w", err)
	}

	if status != "completed" {
		return fmt.Errorf("can only review completed orders")
	}

	return nil
}

func (s *SellerService) createSeller(ctx context.Context, userID uuid.UUID, req *UpdateSellerRequest) error {
	query := `
		INSERT INTO sellers (user_id, name, bio, profile_image, location, verified)
		VALUES ($1, $2, $3, $4, $5, false)
		RETURNING id, created_at, updated_at`

	locationJSON, err := json.Marshal(req.Location)
	if err != nil {
		return fmt.Errorf("failed to marshal location: %w", err)
	}

	_, err = s.db.ExecContext(ctx, query, userID, req.Name, req.Bio, req.ProfileImage, locationJSON)
	if err != nil {
		return fmt.Errorf("failed to create seller: %w", err)
	}

	return nil
}

func (s *SellerService) updateSeller(ctx context.Context, userID uuid.UUID, req *UpdateSellerRequest) error {
	query := `
		UPDATE sellers 
		SET name = COALESCE($2, name),
		    bio = COALESCE($3, bio),
		    profile_image = COALESCE($4, profile_image),
		    location = COALESCE($5, location),
		    updated_at = now()
		WHERE user_id = $1`

	locationJSON, err := json.Marshal(req.Location)
	if err != nil {
		return fmt.Errorf("failed to marshal location: %w", err)
	}

	_, err = s.db.ExecContext(ctx, query, userID, req.Name, req.Bio, req.ProfileImage, locationJSON)
	if err != nil {
		return fmt.Errorf("failed to update seller: %w", err)
	}

	return nil
}
