package models

import (
	"time"

	"github.com/google/uuid"
)

// DisputeStatus represents the current status of a dispute
type DisputeStatus string

const (
	DisputeStatusOpen           DisputeStatus = "OPEN"
	DisputeStatusUnderReview    DisputeStatus = "UNDER_REVIEW"
	DisputeStatusResolvedBuyer  DisputeStatus = "RESOLVED_BUYER"
	DisputeStatusResolvedSeller DisputeStatus = "RESOLVED_SELLER"
	DisputeStatusEscalated      DisputeStatus = "ESCALATED"
)

// DisputeReason represents the reason for opening a dispute
type DisputeReason string

const (
	DisputeReasonUndelivered DisputeReason = "undelivered"
	DisputeReasonDamaged     DisputeReason = "damaged"
	DisputeReasonWrongItem   DisputeReason = "wrong_item"
	DisputeReasonOther       DisputeReason = "other"
)

// DisputeResolution represents the resolution decision
type DisputeResolution string

const (
	DisputeResolutionBuyerFavor  DisputeResolution = "buyer_favor"
	DisputeResolutionSellerFavor DisputeResolution = "seller_favor"
	DisputeResolutionPartial     DisputeResolution = "partial"
	DisputeResolutionNoFault     DisputeResolution = "no_fault"
)

// Dispute represents a dispute between buyer and seller
type Dispute struct {
	ID             uuid.UUID              `json:"id" db:"id"`
	EscrowID       uuid.UUID              `json:"escrow_id" db:"escrow_id"`
	OrderID        uuid.UUID              `json:"order_id" db:"order_id"`
	BuyerID        uuid.UUID              `json:"buyer_id" db:"buyer_id"`
	SellerID       uuid.UUID              `json:"seller_id" db:"seller_id"`
	Status         DisputeStatus          `json:"status" db:"status"`
	Reason         DisputeReason          `json:"reason" db:"reason"`
	Description    string                 `json:"description" db:"description"`
	Evidence       []string               `json:"evidence" db:"evidence"` // File paths/URLs
	ResolutionNote string                 `json:"resolution_note" db:"resolution_note"`
	Resolution     DisputeResolution      `json:"resolution" db:"resolution"`
	ResolvedBy     *uuid.UUID             `json:"resolved_by" db:"resolved_by"` // Admin/NGO ID
	CreatedAt      time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at" db:"updated_at"`
	ResolvedAt     *time.Time             `json:"resolved_at" db:"resolved_at"`
	EscalatedAt    *time.Time             `json:"escalated_at" db:"escalated_at"`
	Metadata       map[string]interface{} `json:"metadata" db:"metadata"`
}

// DisputeRequest represents a request to open a dispute
type DisputeRequest struct {
	OrderID     uuid.UUID              `json:"order_id" validate:"required"`
	BuyerID     uuid.UUID              `json:"buyer_id" validate:"required"`
	Reason      DisputeReason          `json:"reason" validate:"required"`
	Description string                 `json:"description" validate:"required"`
	Evidence    []string               `json:"evidence,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// DisputeResponse represents a response to a dispute
type DisputeResponse struct {
	DisputeID uuid.UUID              `json:"dispute_id"`
	SellerID  uuid.UUID              `json:"seller_id"`
	Note      string                 `json:"note"`
	Evidence  []string               `json:"evidence,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// DisputeResolutionRequest represents a request to resolve a dispute
type DisputeResolutionRequest struct {
	DisputeID      uuid.UUID              `json:"dispute_id" validate:"required"`
	Resolution     DisputeResolution      `json:"resolution" validate:"required"`
	ResolutionNote string                 `json:"resolution_note" validate:"required"`
	ResolvedBy     uuid.UUID              `json:"resolved_by" validate:"required"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
}

// DisputeSummary represents a summary of dispute statistics
type DisputeSummary struct {
	TotalDisputes              int     `json:"total_disputes"`
	OpenDisputes               int     `json:"open_disputes"`
	UnderReviewDisputes        int     `json:"under_review_disputes"`
	ResolvedDisputes           int     `json:"resolved_disputes"`
	EscalatedDisputes          int     `json:"escalated_disputes"`
	BuyerWins                  int     `json:"buyer_wins"`
	SellerWins                 int     `json:"seller_wins"`
	AverageResolutionTimeHours float64 `json:"average_resolution_time_hours"`
}

// DisputeTimeline represents the timeline of dispute events
type DisputeTimeline struct {
	Event     string                 `json:"event"`
	Timestamp time.Time              `json:"timestamp"`
	ActorID   uuid.UUID              `json:"actor_id"`
	ActorType string                 `json:"actor_type"` // buyer, seller, admin, ngo
	Details   string                 `json:"details"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// IsValidStatus checks if the dispute status is valid
func (s DisputeStatus) IsValid() bool {
	switch s {
	case DisputeStatusOpen, DisputeStatusUnderReview, DisputeStatusResolvedBuyer,
		DisputeStatusResolvedSeller, DisputeStatusEscalated:
		return true
	default:
		return false
	}
}

// IsValidReason checks if the dispute reason is valid
func (r DisputeReason) IsValid() bool {
	switch r {
	case DisputeReasonUndelivered, DisputeReasonDamaged, DisputeReasonWrongItem, DisputeReasonOther:
		return true
	default:
		return false
	}
}

// IsValidResolution checks if the dispute resolution is valid
func (r DisputeResolution) IsValid() bool {
	switch r {
	case DisputeResolutionBuyerFavor, DisputeResolutionSellerFavor,
		DisputeResolutionPartial, DisputeResolutionNoFault:
		return true
	default:
		return false
	}
}

// CanRespond checks if a dispute can be responded to
func (d *Dispute) CanRespond() bool {
	return d.Status == DisputeStatusOpen || d.Status == DisputeStatusUnderReview
}

// CanEscalate checks if a dispute can be escalated
func (d *Dispute) CanEscalate() bool {
	return d.Status == DisputeStatusUnderReview
}

// CanResolve checks if a dispute can be resolved
func (d *Dispute) CanResolve() bool {
	return d.Status == DisputeStatusUnderReview || d.Status == DisputeStatusEscalated
}

// IsResolved checks if a dispute is resolved
func (d *Dispute) IsResolved() bool {
	return d.Status == DisputeStatusResolvedBuyer || d.Status == DisputeStatusResolvedSeller
}

// GetStatusBadge returns the appropriate badge for the dispute status
func (d *Dispute) GetStatusBadge() string {
	switch d.Status {
	case DisputeStatusOpen:
		return "🚨 OPEN"
	case DisputeStatusUnderReview:
		return "🔍 UNDER REVIEW"
	case DisputeStatusResolvedBuyer:
		return "✅ RESOLVED (Buyer)"
	case DisputeStatusResolvedSeller:
		return "✅ RESOLVED (Seller)"
	case DisputeStatusEscalated:
		return "⚖️ ESCALATED"
	default:
		return "❓ UNKNOWN"
	}
}

// GetReasonDescription returns a human-readable description of the dispute reason
func (d *Dispute) GetReasonDescription() string {
	switch d.Reason {
	case DisputeReasonUndelivered:
		return "Item not delivered"
	case DisputeReasonDamaged:
		return "Item damaged during shipping"
	case DisputeReasonWrongItem:
		return "Wrong item received"
	case DisputeReasonOther:
		return "Other issue"
	default:
		return "Unknown reason"
	}
}
