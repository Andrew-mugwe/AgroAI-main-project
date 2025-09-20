package disputes

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/escrow"
	"github.com/google/uuid"
)

// DisputeService handles dispute operations
type DisputeService struct {
	db        *sql.DB
	escrowSvc *escrow.EscrowService
}

// NewDisputeService creates a new dispute service
func NewDisputeService(db *sql.DB, escrowSvc *escrow.EscrowService) *DisputeService {
	return &DisputeService{
		db:        db,
		escrowSvc: escrowSvc,
	}
}

// OpenDispute opens a new dispute
func (s *DisputeService) OpenDispute(req *models.DisputeRequest) (*models.Dispute, error) {
	// Validate request
	if err := s.validateDisputeRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Check if dispute already exists for this order
	existingDispute, err := s.GetDisputeByOrder(req.OrderID)
	if err == nil && existingDispute != nil {
		return nil, fmt.Errorf("dispute already exists for order %s", req.OrderID)
	}

	// Get escrow for this order
	escrows, err := s.escrowSvc.GetEscrowsByOrder(req.OrderID)
	if err != nil || len(escrows) == 0 {
		return nil, fmt.Errorf("no escrow found for order %s", req.OrderID)
	}

	escrow := escrows[0] // Use the first (and should be only) escrow

	// Create dispute
	dispute := &models.Dispute{
		ID:          uuid.New(),
		EscrowID:    escrow.ID,
		OrderID:     req.OrderID,
		BuyerID:     req.BuyerID,
		SellerID:    escrow.SellerID,
		Status:      models.DisputeStatusOpen,
		Reason:      req.Reason,
		Description: req.Description,
		Evidence:    req.Evidence,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Metadata:    req.Metadata,
	}

	// Insert into database
	query := `
		INSERT INTO disputes (id, escrow_id, order_id, buyer_id, seller_id, status, reason, 
		                     description, evidence, created_at, updated_at, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err = s.db.Exec(query,
		dispute.ID,
		dispute.EscrowID,
		dispute.OrderID,
		dispute.BuyerID,
		dispute.SellerID,
		dispute.Status,
		dispute.Reason,
		dispute.Description,
		dispute.Evidence,
		dispute.CreatedAt,
		dispute.UpdatedAt,
		dispute.Metadata,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create dispute: %w", err)
	}

	// Log the dispute creation
	fmt.Printf("🚨 Dispute opened: %s for order %s (Reason: %s)\n",
		dispute.ID, req.OrderID, req.Reason)

	return dispute, nil
}

// AddSellerResponse adds a seller's response to a dispute
func (s *DisputeService) AddSellerResponse(disputeID uuid.UUID, sellerID uuid.UUID, note string, evidence []string) error {
	// Get dispute
	dispute, err := s.GetDispute(disputeID)
	if err != nil {
		return fmt.Errorf("failed to get dispute: %w", err)
	}

	// Verify seller
	if dispute.SellerID != sellerID {
		return fmt.Errorf("unauthorized: seller %s cannot respond to dispute %s", sellerID, disputeID)
	}

	// Check if dispute can be responded to
	if !dispute.CanRespond() {
		return fmt.Errorf("dispute %s cannot be responded to (status: %s)", disputeID, dispute.Status)
	}

	// Update dispute status to under review
	now := time.Now()
	query := `
		UPDATE disputes 
		SET status = $1, updated_at = $2, metadata = jsonb_set(COALESCE(metadata, '{}'), '{seller_response}', $3)
		WHERE id = $4
	`

	sellerResponse := map[string]interface{}{
		"note":      note,
		"evidence":  evidence,
		"timestamp": now,
		"seller_id": sellerID,
	}

	_, err = s.db.Exec(query, models.DisputeStatusUnderReview, now, sellerResponse, disputeID)
	if err != nil {
		return fmt.Errorf("failed to update dispute: %w", err)
	}

	fmt.Printf("📝 Seller response added to dispute: %s\n", disputeID)
	return nil
}

// EscalateDispute escalates a dispute to admin/NGO review
func (s *DisputeService) EscalateDispute(disputeID uuid.UUID, escalatedBy uuid.UUID) error {
	// Get dispute
	dispute, err := s.GetDispute(disputeID)
	if err != nil {
		return fmt.Errorf("failed to get dispute: %w", err)
	}

	// Check if dispute can be escalated
	if !dispute.CanEscalate() {
		return fmt.Errorf("dispute %s cannot be escalated (status: %s)", disputeID, dispute.Status)
	}

	// Update dispute status
	now := time.Now()
	query := `
		UPDATE disputes 
		SET status = $1, updated_at = $2, escalated_at = $3, 
		    metadata = jsonb_set(COALESCE(metadata, '{}'), '{escalated_by}', $4)
		WHERE id = $5
	`

	_, err = s.db.Exec(query, models.DisputeStatusEscalated, now, now, escalatedBy, disputeID)
	if err != nil {
		return fmt.Errorf("failed to escalate dispute: %w", err)
	}

	fmt.Printf("⚖️ Dispute escalated: %s\n", disputeID)
	return nil
}

// ResolveDispute resolves a dispute with a decision
func (s *DisputeService) ResolveDispute(req *models.DisputeResolutionRequest) error {
	// Get dispute
	dispute, err := s.GetDispute(req.DisputeID)
	if err != nil {
		return fmt.Errorf("failed to get dispute: %w", err)
	}

	// Check if dispute can be resolved
	if !dispute.CanResolve() {
		return fmt.Errorf("dispute %s cannot be resolved (status: %s)", req.DisputeID, dispute.Status)
	}

	// Determine new status based on resolution
	var newStatus models.DisputeStatus
	switch req.Resolution {
	case models.DisputeResolutionBuyerFavor:
		newStatus = models.DisputeStatusResolvedBuyer
	case models.DisputeResolutionSellerFavor:
		newStatus = models.DisputeStatusResolvedSeller
	case models.DisputeResolutionPartial, models.DisputeResolutionNoFault:
		// For partial or no-fault resolutions, default to buyer favor for refund
		newStatus = models.DisputeStatusResolvedBuyer
	default:
		return fmt.Errorf("invalid resolution: %s", req.Resolution)
	}

	// Update dispute
	now := time.Now()
	query := `
		UPDATE disputes 
		SET status = $1, resolution = $2, resolution_note = $3, resolved_by = $4, 
		    resolved_at = $5, updated_at = $6
		WHERE id = $7
	`

	_, err = s.db.Exec(query, newStatus, req.Resolution, req.ResolutionNote,
		req.ResolvedBy, now, now, req.DisputeID)
	if err != nil {
		return fmt.Errorf("failed to resolve dispute: %w", err)
	}

	// Trigger escrow action based on resolution
	if newStatus == models.DisputeStatusResolvedBuyer {
		// Refund buyer
		err = s.escrowSvc.RefundEscrow(dispute.EscrowID, fmt.Sprintf("Dispute resolved in buyer's favor: %s", req.ResolutionNote))
		if err != nil {
			return fmt.Errorf("failed to refund escrow: %w", err)
		}
		fmt.Printf("💰 Escrow refunded due to dispute resolution: %s\n", dispute.EscrowID)
	} else if newStatus == models.DisputeStatusResolvedSeller {
		// Release to seller (this would need seller account info in real implementation)
		fmt.Printf("💸 Escrow would be released to seller due to dispute resolution: %s\n", dispute.EscrowID)
	}

	fmt.Printf("✅ Dispute resolved: %s (Resolution: %s)\n", req.DisputeID, req.Resolution)
	return nil
}

// GetDispute retrieves a dispute by ID
func (s *DisputeService) GetDispute(disputeID uuid.UUID) (*models.Dispute, error) {
	query := `
		SELECT id, escrow_id, order_id, buyer_id, seller_id, status, reason, 
		       description, evidence, resolution_note, resolution, resolved_by,
		       created_at, updated_at, resolved_at, escalated_at, metadata
		FROM disputes 
		WHERE id = $1
	`

	row := s.db.QueryRow(query, disputeID)

	var dispute models.Dispute
	err := row.Scan(
		&dispute.ID,
		&dispute.EscrowID,
		&dispute.OrderID,
		&dispute.BuyerID,
		&dispute.SellerID,
		&dispute.Status,
		&dispute.Reason,
		&dispute.Description,
		&dispute.Evidence,
		&dispute.ResolutionNote,
		&dispute.Resolution,
		&dispute.ResolvedBy,
		&dispute.CreatedAt,
		&dispute.UpdatedAt,
		&dispute.ResolvedAt,
		&dispute.EscalatedAt,
		&dispute.Metadata,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("dispute not found")
		}
		return nil, fmt.Errorf("failed to get dispute: %w", err)
	}

	return &dispute, nil
}

// GetDisputeByOrder retrieves a dispute by order ID
func (s *DisputeService) GetDisputeByOrder(orderID uuid.UUID) (*models.Dispute, error) {
	query := `
		SELECT id, escrow_id, order_id, buyer_id, seller_id, status, reason, 
		       description, evidence, resolution_note, resolution, resolved_by,
		       created_at, updated_at, resolved_at, escalated_at, metadata
		FROM disputes 
		WHERE order_id = $1
		LIMIT 1
	`

	row := s.db.QueryRow(query, orderID)

	var dispute models.Dispute
	err := row.Scan(
		&dispute.ID,
		&dispute.EscrowID,
		&dispute.OrderID,
		&dispute.BuyerID,
		&dispute.SellerID,
		&dispute.Status,
		&dispute.Reason,
		&dispute.Description,
		&dispute.Evidence,
		&dispute.ResolutionNote,
		&dispute.Resolution,
		&dispute.ResolvedBy,
		&dispute.CreatedAt,
		&dispute.UpdatedAt,
		&dispute.ResolvedAt,
		&dispute.EscalatedAt,
		&dispute.Metadata,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("dispute not found")
		}
		return nil, fmt.Errorf("failed to get dispute: %w", err)
	}

	return &dispute, nil
}

// GetDisputesByUser retrieves disputes for a specific user
func (s *DisputeService) GetDisputesByUser(userID uuid.UUID, userType string) ([]*models.Dispute, error) {
	var query string
	if userType == "buyer" {
		query = `
			SELECT id, escrow_id, order_id, buyer_id, seller_id, status, reason, 
			       description, evidence, resolution_note, resolution, resolved_by,
			       created_at, updated_at, resolved_at, escalated_at, metadata
			FROM disputes 
			WHERE buyer_id = $1
			ORDER BY created_at DESC
		`
	} else if userType == "seller" {
		query = `
			SELECT id, escrow_id, order_id, buyer_id, seller_id, status, reason, 
			       description, evidence, resolution_note, resolution, resolved_by,
			       created_at, updated_at, resolved_at, escalated_at, metadata
			FROM disputes 
			WHERE seller_id = $1
			ORDER BY created_at DESC
		`
	} else {
		return nil, fmt.Errorf("invalid user type: %s", userType)
	}

	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query disputes: %w", err)
	}
	defer rows.Close()

	var disputes []*models.Dispute
	for rows.Next() {
		var dispute models.Dispute
		err := rows.Scan(
			&dispute.ID,
			&dispute.EscrowID,
			&dispute.OrderID,
			&dispute.BuyerID,
			&dispute.SellerID,
			&dispute.Status,
			&dispute.Reason,
			&dispute.Description,
			&dispute.Evidence,
			&dispute.ResolutionNote,
			&dispute.Resolution,
			&dispute.ResolvedBy,
			&dispute.CreatedAt,
			&dispute.UpdatedAt,
			&dispute.ResolvedAt,
			&dispute.EscalatedAt,
			&dispute.Metadata,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan dispute: %w", err)
		}
		disputes = append(disputes, &dispute)
	}

	return disputes, nil
}

// GetDisputeSummary retrieves dispute statistics
func (s *DisputeService) GetDisputeSummary() (*models.DisputeSummary, error) {
	query := `
		SELECT 
			COUNT(*) as total_disputes,
			COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_disputes,
			COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END) as under_review_disputes,
			COUNT(CASE WHEN status IN ('RESOLVED_BUYER', 'RESOLVED_SELLER') THEN 1 END) as resolved_disputes,
			COUNT(CASE WHEN status = 'ESCALATED' THEN 1 END) as escalated_disputes,
			COUNT(CASE WHEN status = 'RESOLVED_BUYER' THEN 1 END) as buyer_wins,
			COUNT(CASE WHEN status = 'RESOLVED_SELLER' THEN 1 END) as seller_wins,
			AVG(CASE WHEN resolved_at IS NOT NULL THEN 
				EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 
			END) as avg_resolution_time_hours
		FROM disputes
	`

	row := s.db.QueryRow(query)

	var summary models.DisputeSummary
	err := row.Scan(
		&summary.TotalDisputes,
		&summary.OpenDisputes,
		&summary.UnderReviewDisputes,
		&summary.ResolvedDisputes,
		&summary.EscalatedDisputes,
		&summary.BuyerWins,
		&summary.SellerWins,
		&summary.AverageResolutionTimeHours,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get dispute summary: %w", err)
	}

	return &summary, nil
}

// validateDisputeRequest validates the dispute request
func (s *DisputeService) validateDisputeRequest(req *models.DisputeRequest) error {
	if req.OrderID == uuid.Nil {
		return fmt.Errorf("order_id is required")
	}
	if req.BuyerID == uuid.Nil {
		return fmt.Errorf("buyer_id is required")
	}
	if !req.Reason.IsValid() {
		return fmt.Errorf("invalid dispute reason: %s", req.Reason)
	}
	if req.Description == "" {
		return fmt.Errorf("description is required")
	}
	return nil
}
