package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// EscrowStatus represents the current status of an escrow transaction
type EscrowStatus string

const (
	EscrowStatusHeld     EscrowStatus = "HELD"
	EscrowStatusReleased EscrowStatus = "RELEASED"
	EscrowStatusRefunded EscrowStatus = "REFUNDED"
	EscrowStatusDisputed EscrowStatus = "DISPUTED"
)

// Escrow represents a held payment for an order
type Escrow struct {
	ID         uuid.UUID              `json:"id" db:"id"`
	OrderID    uuid.UUID              `json:"order_id" db:"order_id"`
	BuyerID    uuid.UUID              `json:"buyer_id" db:"buyer_id"`
	SellerID   uuid.UUID              `json:"seller_id" db:"seller_id"`
	Amount     decimal.Decimal        `json:"amount" db:"amount"`
	Currency   string                 `json:"currency" db:"currency"`
	Status     EscrowStatus           `json:"status" db:"status"`
	PaymentID  string                 `json:"payment_id" db:"payment_id"` // Reference to payment provider transaction
	CreatedAt  time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at" db:"updated_at"`
	ReleasedAt *time.Time             `json:"released_at,omitempty" db:"released_at"`
	RefundedAt *time.Time             `json:"refunded_at,omitempty" db:"refunded_at"`
	Metadata   map[string]interface{} `json:"metadata,omitempty" db:"metadata"`
}

// EscrowRequest represents a request to create an escrow
type EscrowRequest struct {
	OrderID  uuid.UUID              `json:"order_id" validate:"required"`
	BuyerID  uuid.UUID              `json:"buyer_id" validate:"required"`
	SellerID uuid.UUID              `json:"seller_id" validate:"required"`
	Amount   decimal.Decimal        `json:"amount" validate:"required,gt=0"`
	Currency string                 `json:"currency" validate:"required,len=3"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// EscrowResponse represents the response after creating an escrow
type EscrowResponse struct {
	EscrowID  uuid.UUID       `json:"escrow_id"`
	Status    EscrowStatus    `json:"status"`
	Amount    decimal.Decimal `json:"amount"`
	Currency  string          `json:"currency"`
	CreatedAt time.Time       `json:"created_at"`
	Message   string          `json:"message"`
}

// PayoutRequest represents a request to payout a seller
type PayoutRequest struct {
	SellerID    uuid.UUID              `json:"seller_id" validate:"required"`
	Amount      decimal.Decimal        `json:"amount" validate:"required,gt=0"`
	Currency    string                 `json:"currency" validate:"required,len=3"`
	Provider    string                 `json:"provider" validate:"required,oneof=stripe mpesa paypal"`
	AccountID   string                 `json:"account_id" validate:"required"` // Seller's account ID with provider
	Description string                 `json:"description,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// PayoutResponse represents the response after processing a payout
type PayoutResponse struct {
	PayoutID    string          `json:"payout_id"`
	Status      string          `json:"status"`
	Amount      decimal.Decimal `json:"amount"`
	Currency    string          `json:"currency"`
	Provider    string          `json:"provider"`
	AccountID   string          `json:"account_id"`
	ProcessedAt time.Time       `json:"processed_at"`
	Message     string          `json:"message"`
}

// EscrowSummary represents a summary of escrow statistics
type EscrowSummary struct {
	TotalHeld     decimal.Decimal `json:"total_held"`
	TotalReleased decimal.Decimal `json:"total_released"`
	TotalRefunded decimal.Decimal `json:"total_refunded"`
	ActiveEscrows int             `json:"active_escrows"`
	Currency      string          `json:"currency"`
}

// IsValidStatus checks if the escrow status is valid
func (s EscrowStatus) IsValid() bool {
	switch s {
	case EscrowStatusHeld, EscrowStatusReleased, EscrowStatusRefunded, EscrowStatusDisputed:
		return true
	default:
		return false
	}
}

// CanRelease checks if the escrow can be released
func (e *Escrow) CanRelease() bool {
	return e.Status == EscrowStatusHeld
}

// CanRefund checks if the escrow can be refunded
func (e *Escrow) CanRefund() bool {
	return e.Status == EscrowStatusHeld || e.Status == EscrowStatusDisputed
}

// IsActive checks if the escrow is still active (not completed)
func (e *Escrow) IsActive() bool {
	return e.Status == EscrowStatusHeld || e.Status == EscrowStatusDisputed
}
