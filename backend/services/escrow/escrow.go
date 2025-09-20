package escrow

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/payments"
	"github.com/Andrew-mugwe/agroai/services/payouts"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// EscrowService handles escrow operations
type EscrowService struct {
	db         *sql.DB
	paymentSvc *payments.PaymentService
	payoutSvc  *payouts.PayoutService
}

// NewEscrowService creates a new escrow service
func NewEscrowService(db *sql.DB, paymentSvc *payments.PaymentService, payoutSvc *payouts.PayoutService) *EscrowService {
	return &EscrowService{
		db:         db,
		paymentSvc: paymentSvc,
		payoutSvc:  payoutSvc,
	}
}

// CreateEscrow creates a new escrow transaction
func (s *EscrowService) CreateEscrow(req *models.EscrowRequest) (*models.EscrowResponse, error) {
	// Validate request
	if err := s.validateEscrowRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Generate escrow ID
	escrowID := uuid.New()

	// Create escrow record
	escrow := &models.Escrow{
		ID:        escrowID,
		OrderID:   req.OrderID,
		BuyerID:   req.BuyerID,
		SellerID:  req.SellerID,
		Amount:    req.Amount,
		Currency:  req.Currency,
		Status:    models.EscrowStatusHeld,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Metadata:  req.Metadata,
	}

	// Insert into database
	query := `
		INSERT INTO escrows (id, order_id, buyer_id, seller_id, amount, currency, status, created_at, updated_at, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := s.db.Exec(query,
		escrow.ID,
		escrow.OrderID,
		escrow.BuyerID,
		escrow.SellerID,
		escrow.Amount,
		escrow.Currency,
		escrow.Status,
		escrow.CreatedAt,
		escrow.UpdatedAt,
		escrow.Metadata,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create escrow: %w", err)
	}

	// Log the escrow creation
	fmt.Printf("✅ Escrow created: %s for order %s (Amount: %s %s)\n",
		escrow.ID, req.OrderID, req.Amount.String(), req.Currency)

	return &models.EscrowResponse{
		EscrowID:  escrow.ID,
		Status:    escrow.Status,
		Amount:    escrow.Amount,
		Currency:  escrow.Currency,
		CreatedAt: escrow.CreatedAt,
		Message:   "Escrow created successfully",
	}, nil
}

// ReleaseEscrow releases funds to the seller
func (s *EscrowService) ReleaseEscrow(escrowID uuid.UUID, sellerAccountID string, provider string) error {
	// Get escrow details
	escrow, err := s.GetEscrow(escrowID)
	if err != nil {
		return fmt.Errorf("failed to get escrow: %w", err)
	}

	// Check if escrow can be released
	if !escrow.CanRelease() {
		return fmt.Errorf("escrow %s cannot be released (status: %s)", escrowID, escrow.Status)
	}

	// Create payout request
	payoutReq := &models.PayoutRequest{
		SellerID:    escrow.SellerID,
		Amount:      escrow.Amount,
		Currency:    escrow.Currency,
		Provider:    provider,
		AccountID:   sellerAccountID,
		Description: fmt.Sprintf("Payout for order %s", escrow.OrderID),
		Metadata: map[string]interface{}{
			"escrow_id": escrow.ID.String(),
			"order_id":  escrow.OrderID.String(),
		},
	}

	// Process payout
	payoutResp, err := s.payoutSvc.ProcessPayout(payoutReq)
	if err != nil {
		return fmt.Errorf("failed to process payout: %w", err)
	}

	// Update escrow status
	now := time.Now()
	query := `
		UPDATE escrows 
		SET status = $1, updated_at = $2, released_at = $3, payment_id = $4
		WHERE id = $5
	`

	_, err = s.db.Exec(query, models.EscrowStatusReleased, now, now, payoutResp.PayoutID, escrowID)
	if err != nil {
		return fmt.Errorf("failed to update escrow status: %w", err)
	}

	fmt.Printf("✅ Escrow released: %s → Payout: %s (Amount: %s %s)\n",
		escrowID, payoutResp.PayoutID, escrow.Amount.String(), escrow.Currency)

	return nil
}

// RefundEscrow refunds the buyer
func (s *EscrowService) RefundEscrow(escrowID uuid.UUID, reason string) error {
	// Get escrow details
	escrow, err := s.GetEscrow(escrowID)
	if err != nil {
		return fmt.Errorf("failed to get escrow: %w", err)
	}

	// Check if escrow can be refunded
	if !escrow.CanRefund() {
		return fmt.Errorf("escrow %s cannot be refunded (status: %s)", escrowID, escrow.Status)
	}

	// Process refund
	amountFloat, _ := escrow.Amount.Float64()
	err = s.paymentSvc.RefundPayment("stripe", escrow.PaymentID, amountFloat)
	if err != nil {
		return fmt.Errorf("failed to process refund: %w", err)
	}

	// Update escrow status
	now := time.Now()
	query := `
		UPDATE escrows 
		SET status = $1, updated_at = $2, refunded_at = $3
		WHERE id = $4
	`

	_, err = s.db.Exec(query, models.EscrowStatusRefunded, now, now, escrowID)
	if err != nil {
		return fmt.Errorf("failed to update escrow status: %w", err)
	}

	fmt.Printf("✅ Escrow refunded: %s (Amount: %s %s) - Reason: %s\n",
		escrowID, escrow.Amount.String(), escrow.Currency, reason)

	return nil
}

// GetEscrow retrieves an escrow by ID
func (s *EscrowService) GetEscrow(escrowID uuid.UUID) (*models.Escrow, error) {
	query := `
		SELECT id, order_id, buyer_id, seller_id, amount, currency, status, 
		       payment_id, created_at, updated_at, released_at, refunded_at, metadata
		FROM escrows 
		WHERE id = $1
	`

	row := s.db.QueryRow(query, escrowID)

	var escrow models.Escrow
	err := row.Scan(
		&escrow.ID,
		&escrow.OrderID,
		&escrow.BuyerID,
		&escrow.SellerID,
		&escrow.Amount,
		&escrow.Currency,
		&escrow.Status,
		&escrow.PaymentID,
		&escrow.CreatedAt,
		&escrow.UpdatedAt,
		&escrow.ReleasedAt,
		&escrow.RefundedAt,
		&escrow.Metadata,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("escrow not found")
		}
		return nil, fmt.Errorf("failed to get escrow: %w", err)
	}

	return &escrow, nil
}

// GetEscrowsByOrder retrieves escrows for a specific order
func (s *EscrowService) GetEscrowsByOrder(orderID uuid.UUID) ([]*models.Escrow, error) {
	query := `
		SELECT id, order_id, buyer_id, seller_id, amount, currency, status, 
		       payment_id, created_at, updated_at, released_at, refunded_at, metadata
		FROM escrows 
		WHERE order_id = $1
		ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to query escrows: %w", err)
	}
	defer rows.Close()

	var escrows []*models.Escrow
	for rows.Next() {
		var escrow models.Escrow
		err := rows.Scan(
			&escrow.ID,
			&escrow.OrderID,
			&escrow.BuyerID,
			&escrow.SellerID,
			&escrow.Amount,
			&escrow.Currency,
			&escrow.Status,
			&escrow.PaymentID,
			&escrow.CreatedAt,
			&escrow.UpdatedAt,
			&escrow.ReleasedAt,
			&escrow.RefundedAt,
			&escrow.Metadata,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan escrow: %w", err)
		}
		escrows = append(escrows, &escrow)
	}

	return escrows, nil
}

// GetEscrowSummary retrieves escrow statistics
func (s *EscrowService) GetEscrowSummary(currency string) (*models.EscrowSummary, error) {
	query := `
		SELECT 
			COALESCE(SUM(CASE WHEN status = 'HELD' THEN amount ELSE 0 END), 0) as total_held,
			COALESCE(SUM(CASE WHEN status = 'RELEASED' THEN amount ELSE 0 END), 0) as total_released,
			COALESCE(SUM(CASE WHEN status = 'REFUNDED' THEN amount ELSE 0 END), 0) as total_refunded,
			COUNT(CASE WHEN status = 'HELD' THEN 1 END) as active_escrows
		FROM escrows 
		WHERE currency = $1
	`

	row := s.db.QueryRow(query, currency)

	var summary models.EscrowSummary
	err := row.Scan(
		&summary.TotalHeld,
		&summary.TotalReleased,
		&summary.TotalRefunded,
		&summary.ActiveEscrows,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get escrow summary: %w", err)
	}

	summary.Currency = currency
	return &summary, nil
}

// validateEscrowRequest validates the escrow request
func (s *EscrowService) validateEscrowRequest(req *models.EscrowRequest) error {
	if req.OrderID == uuid.Nil {
		return fmt.Errorf("order_id is required")
	}
	if req.BuyerID == uuid.Nil {
		return fmt.Errorf("buyer_id is required")
	}
	if req.SellerID == uuid.Nil {
		return fmt.Errorf("seller_id is required")
	}
	if req.Amount.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("amount must be greater than zero")
	}
	if len(req.Currency) != 3 {
		return fmt.Errorf("currency must be 3 characters")
	}
	return nil
}
