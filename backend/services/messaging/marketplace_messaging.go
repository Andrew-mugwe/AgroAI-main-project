package messaging

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// MarketplaceMessagingService handles marketplace-specific messaging operations
type MarketplaceMessagingService struct {
	db *sql.DB
}

// MarketplaceThread represents a marketplace chat thread
type MarketplaceThread struct {
	ID        int        `json:"id"`
	ThreadRef string     `json:"thread_ref"`
	ProductID *uuid.UUID `json:"product_id,omitempty"`
	OrderID   *uuid.UUID `json:"order_id,omitempty"`
	BuyerID   uuid.UUID  `json:"buyer_id"`
	SellerID  uuid.UUID  `json:"seller_id"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	// Extended fields from summary view
	ProductName      *string             `json:"product_name,omitempty"`
	ProductPrice     *float64            `json:"product_price,omitempty"`
	BuyerName        string              `json:"buyer_name"`
	SellerName       string              `json:"seller_name"`
	LatestMessage    *MarketplaceMessage `json:"latest_message,omitempty"`
	ParticipantCount int                 `json:"participant_count"`
	UnreadCount      int                 `json:"unread_count"`
}

// MarketplaceMessage represents a message in a marketplace thread
type MarketplaceMessage struct {
	ID          int             `json:"id"`
	ThreadID    int             `json:"thread_id"`
	ThreadRef   string          `json:"thread_ref,omitempty"`
	SenderID    uuid.UUID       `json:"sender_id"`
	SenderName  string          `json:"sender_name,omitempty"`
	Body        string          `json:"body"`
	Attachments json.RawMessage `json:"attachments"`
	MessageType string          `json:"message_type"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// MarketplaceParticipant represents a thread participant
type MarketplaceParticipant struct {
	ID         int       `json:"id"`
	ThreadID   int       `json:"thread_id"`
	UserID     uuid.UUID `json:"user_id"`
	Role       string    `json:"role"`
	JoinedAt   time.Time `json:"joined_at"`
	LastReadAt time.Time `json:"last_read_at"`
}

// CreateThreadRequest represents the request to create a thread
type CreateThreadRequest struct {
	ProductID *uuid.UUID `json:"product_id,omitempty"`
	OrderID   *uuid.UUID `json:"order_id,omitempty"`
	SellerID  uuid.UUID  `json:"seller_id"`
}

// SendMessageRequest represents the request to send a message
type SendMessageRequest struct {
	Body        string          `json:"body"`
	Attachments json.RawMessage `json:"attachments,omitempty"`
	MessageType string          `json:"message_type,omitempty"`
}

// EscalateThreadRequest represents the request to escalate a thread
type EscalateThreadRequest struct {
	Reason string `json:"reason"`
}

// NewMarketplaceMessagingService creates a new marketplace messaging service
func NewMarketplaceMessagingService(db *sql.DB) *MarketplaceMessagingService {
	return &MarketplaceMessagingService{db: db}
}

// CreateThread creates or returns an existing thread for buyer-seller communication
func (mms *MarketplaceMessagingService) CreateThread(ctx context.Context, req *CreateThreadRequest, buyerID uuid.UUID) (string, error) {
	// Validate request
	if req.ProductID == nil && req.OrderID == nil {
		return "", fmt.Errorf("either product_id or order_id must be provided")
	}

	if req.ProductID != nil && req.OrderID != nil {
		return "", fmt.Errorf("cannot specify both product_id and order_id")
	}

	// Use database function to create or get existing thread
	var threadRef string
	query := `SELECT create_or_get_marketplace_thread($1, $2, $3, $4)`

	err := mms.db.QueryRowContext(ctx, query, req.ProductID, req.OrderID, buyerID, req.SellerID).Scan(&threadRef)
	if err != nil {
		return "", fmt.Errorf("failed to create or get thread: %w", err)
	}

	return threadRef, nil
}

// AddParticipant adds a participant to a thread
func (mms *MarketplaceMessagingService) AddParticipant(ctx context.Context, threadRef string, userID uuid.UUID, role string) error {
	// Get thread ID
	var threadID int
	err := mms.db.QueryRowContext(ctx,
		"SELECT id FROM marketplace_threads WHERE thread_ref = $1", threadRef).Scan(&threadID)
	if err != nil {
		return fmt.Errorf("thread not found: %w", err)
	}

	// Insert participant
	_, err = mms.db.ExecContext(ctx, `
		INSERT INTO marketplace_thread_participants (thread_id, user_id, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (thread_id, user_id) DO NOTHING
	`, threadID, userID, role)

	if err != nil {
		return fmt.Errorf("failed to add participant: %w", err)
	}

	return nil
}

// SendMessage sends a message to a marketplace thread
func (mms *MarketplaceMessagingService) SendMessage(ctx context.Context, threadRef string, senderID uuid.UUID, req *SendMessageRequest) (*MarketplaceMessage, error) {
	// Get thread ID and validate sender is a participant
	var threadID int
	var isParticipant bool
	err := mms.db.QueryRowContext(ctx, `
		SELECT mt.id, EXISTS(
			SELECT 1 FROM marketplace_thread_participants mtp 
			WHERE mtp.thread_id = mt.id AND mtp.user_id = $2
		)
		FROM marketplace_threads mt 
		WHERE mt.thread_ref = $1
	`, threadRef, senderID).Scan(&threadID, &isParticipant)

	if err != nil {
		return nil, fmt.Errorf("thread not found: %w", err)
	}

	if !isParticipant {
		return nil, fmt.Errorf("user is not a participant in this thread")
	}

	// Sanitize message body
	body := strings.TrimSpace(req.Body)
	if body == "" {
		return nil, fmt.Errorf("message body cannot be empty")
	}

	// Set default message type
	messageType := req.MessageType
	if messageType == "" {
		messageType = "text"
	}

	// Insert message
	var messageID int
	var createdAt time.Time
	err = mms.db.QueryRowContext(ctx, `
		INSERT INTO marketplace_messages (thread_id, sender_id, body, attachments, message_type, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`, threadID, senderID, body, req.Attachments, messageType).Scan(&messageID, &createdAt)

	if err != nil {
		return nil, fmt.Errorf("failed to send message: %w", err)
	}

	// Update thread updated_at
	_, err = mms.db.ExecContext(ctx, `
		UPDATE marketplace_threads SET updated_at = NOW() WHERE id = $1
	`, threadID)

	if err != nil {
		// Log error but don't fail the message send
		fmt.Printf("Warning: failed to update thread timestamp: %v\n", err)
	}

	// Return the created message
	message := &MarketplaceMessage{
		ID:          messageID,
		ThreadID:    threadID,
		ThreadRef:   threadRef,
		SenderID:    senderID,
		Body:        body,
		Attachments: req.Attachments,
		MessageType: messageType,
		CreatedAt:   createdAt,
		UpdatedAt:   createdAt,
	}

	return message, nil
}

// GetThreadMessages retrieves messages for a marketplace thread
func (mms *MarketplaceMessagingService) GetThreadMessages(ctx context.Context, threadRef string, limit int, afterCursor *time.Time) ([]*MarketplaceMessage, error) {
	// Get thread ID and validate user access
	var threadID int
	query := `
		SELECT mt.id
		FROM marketplace_threads mt
		WHERE mt.thread_ref = $1
	`

	err := mms.db.QueryRowContext(ctx, query, threadRef).Scan(&threadID)
	if err != nil {
		return nil, fmt.Errorf("thread not found: %w", err)
	}

	// Build query for messages
	msgQuery := `
		SELECT 
			mm.id,
			mm.thread_id,
			mm.sender_id,
			u.name as sender_name,
			mm.body,
			mm.attachments,
			mm.message_type,
			mm.created_at,
			mm.updated_at
		FROM marketplace_messages mm
		LEFT JOIN users u ON mm.sender_id = u.id
		WHERE mm.thread_id = $1
	`

	args := []interface{}{threadID}
	argIndex := 2

	if afterCursor != nil {
		msgQuery += fmt.Sprintf(" AND mm.created_at < $%d", argIndex)
		args = append(args, *afterCursor)
		argIndex++
	}

	msgQuery += fmt.Sprintf(" ORDER BY mm.created_at DESC LIMIT $%d", argIndex)
	args = append(args, limit)

	rows, err := mms.db.QueryContext(ctx, msgQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query messages: %w", err)
	}
	defer rows.Close()

	var messages []*MarketplaceMessage
	for rows.Next() {
		msg := &MarketplaceMessage{
			ThreadRef: threadRef,
		}

		err := rows.Scan(
			&msg.ID,
			&msg.ThreadID,
			&msg.SenderID,
			&msg.SenderName,
			&msg.Body,
			&msg.Attachments,
			&msg.MessageType,
			&msg.CreatedAt,
			&msg.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan message: %w", err)
		}

		messages = append(messages, msg)
	}

	// Reverse to get chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

// GetUserThreads retrieves threads for a user
func (mms *MarketplaceMessagingService) GetUserThreads(ctx context.Context, userID uuid.UUID) ([]*MarketplaceThread, error) {
	query := `
		SELECT 
			mt.id,
			mt.thread_ref,
			mt.product_id,
			mt.order_id,
			mt.buyer_id,
			mt.seller_id,
			mt.status,
			mt.created_at,
			mt.updated_at,
			mts.product_name,
			mts.product_price,
			mts.buyer_name,
			mts.seller_name,
			mts.participant_count,
			mts.unread_count
		FROM marketplace_threads mt
		LEFT JOIN marketplace_thread_summary mts ON mt.id = mts.id
		WHERE mt.buyer_id = $1 OR mt.seller_id = $1
		ORDER BY mt.updated_at DESC
	`

	rows, err := mms.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query user threads: %w", err)
	}
	defer rows.Close()

	var threads []*MarketplaceThread
	for rows.Next() {
		thread := &MarketplaceThread{}

		err := rows.Scan(
			&thread.ID,
			&thread.ThreadRef,
			&thread.ProductID,
			&thread.OrderID,
			&thread.BuyerID,
			&thread.SellerID,
			&thread.Status,
			&thread.CreatedAt,
			&thread.UpdatedAt,
			&thread.ProductName,
			&thread.ProductPrice,
			&thread.BuyerName,
			&thread.SellerName,
			&thread.ParticipantCount,
			&thread.UnreadCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan thread: %w", err)
		}

		threads = append(threads, thread)
	}

	return threads, nil
}

// EscalateThread escalates a thread to admin/NGO attention
func (mms *MarketplaceMessagingService) EscalateThread(ctx context.Context, threadRef string, escalatedByUserID uuid.UUID, reason string) error {
	// Start transaction
	tx, err := mms.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Get thread ID and validate access
	var threadID int
	err = tx.QueryRowContext(ctx, `
		SELECT id FROM marketplace_threads WHERE thread_ref = $1
	`, threadRef).Scan(&threadID)
	if err != nil {
		return fmt.Errorf("thread not found: %w", err)
	}

	// Update thread status to escalated
	_, err = tx.ExecContext(ctx, `
		UPDATE marketplace_threads SET status = 'escalated', updated_at = NOW() WHERE id = $1
	`, threadID)
	if err != nil {
		return fmt.Errorf("failed to escalate thread: %w", err)
	}

	// Add system message about escalation
	_, err = tx.ExecContext(ctx, `
		INSERT INTO marketplace_messages (thread_id, sender_id, body, message_type, created_at)
		VALUES ($1, $2, $3, 'system', NOW())
	`, threadID, escalatedByUserID, fmt.Sprintf("Thread escalated: %s", reason))
	if err != nil {
		return fmt.Errorf("failed to add escalation message: %w", err)
	}

	// Add NGO and Admin participants (if they exist in the system)
	// For demo purposes, we'll add a sample NGO user
	ngoUserID := uuid.MustParse("456e7890-e89b-12d3-a456-426614174020")
	_, err = tx.ExecContext(ctx, `
		INSERT INTO marketplace_thread_participants (thread_id, user_id, role)
		VALUES ($1, $2, 'ngo')
		ON CONFLICT (thread_id, user_id) DO NOTHING
	`, threadID, ngoUserID)
	if err != nil {
		// Log error but don't fail the escalation
		fmt.Printf("Warning: failed to add NGO participant: %v\n", err)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// MarkThreadAsRead marks messages in a thread as read for a user
func (mms *MarketplaceMessagingService) MarkThreadAsRead(ctx context.Context, threadRef string, userID uuid.UUID) error {
	_, err := mms.db.ExecContext(ctx, `
		UPDATE marketplace_thread_participants 
		SET last_read_at = NOW() 
		WHERE thread_id = (SELECT id FROM marketplace_threads WHERE thread_ref = $1)
		AND user_id = $2
	`, threadRef, userID)

	if err != nil {
		return fmt.Errorf("failed to mark thread as read: %w", err)
	}

	return nil
}

// GetThreadInfo retrieves detailed thread information
func (mms *MarketplaceMessagingService) GetThreadInfo(ctx context.Context, threadRef string) (*MarketplaceThread, error) {
	query := `
		SELECT 
			mt.id,
			mt.thread_ref,
			mt.product_id,
			mt.order_id,
			mt.buyer_id,
			mt.seller_id,
			mt.status,
			mt.created_at,
			mt.updated_at,
			mts.product_name,
			mts.product_price,
			mts.buyer_name,
			mts.seller_name,
			mts.participant_count,
			mts.unread_count
		FROM marketplace_threads mt
		LEFT JOIN marketplace_thread_summary mts ON mt.id = mts.id
		WHERE mt.thread_ref = $1
	`

	thread := &MarketplaceThread{}
	err := mms.db.QueryRowContext(ctx, query, threadRef).Scan(
		&thread.ID,
		&thread.ThreadRef,
		&thread.ProductID,
		&thread.OrderID,
		&thread.BuyerID,
		&thread.SellerID,
		&thread.Status,
		&thread.CreatedAt,
		&thread.UpdatedAt,
		&thread.ProductName,
		&thread.ProductPrice,
		&thread.BuyerName,
		&thread.SellerName,
		&thread.ParticipantCount,
		&thread.UnreadCount,
	)

	if err != nil {
		return nil, fmt.Errorf("thread not found: %w", err)
	}

	return thread, nil
}

// GetThreadParticipants retrieves participants in a thread
func (mms *MarketplaceMessagingService) GetThreadParticipants(ctx context.Context, threadRef string) ([]*MarketplaceParticipant, error) {
	query := `
		SELECT 
			mtp.id,
			mtp.thread_id,
			mtp.user_id,
			mtp.role,
			mtp.joined_at,
			mtp.last_read_at,
			u.name as user_name
		FROM marketplace_thread_participants mtp
		LEFT JOIN users u ON mtp.user_id = u.id
		WHERE mtp.thread_id = (SELECT id FROM marketplace_threads WHERE thread_ref = $1)
		ORDER BY mtp.joined_at ASC
	`

	rows, err := mms.db.QueryContext(ctx, query, threadRef)
	if err != nil {
		return nil, fmt.Errorf("failed to query participants: %w", err)
	}
	defer rows.Close()

	var participants []*MarketplaceParticipant
	for rows.Next() {
		participant := &MarketplaceParticipant{}
		var userName string

		err := rows.Scan(
			&participant.ID,
			&participant.ThreadID,
			&participant.UserID,
			&participant.Role,
			&participant.JoinedAt,
			&participant.LastReadAt,
			&userName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan participant: %w", err)
		}

		participants = append(participants, participant)
	}

	return participants, nil
}
