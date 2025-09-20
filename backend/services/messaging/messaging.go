package messaging

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

// MessagingService handles messaging operations
type MessagingService struct {
	db *sql.DB
}

// Conversation represents a conversation
type Conversation struct {
	ID        int       `json:"id"`
	Type      string    `json:"type"`
	CreatedAt time.Time `json:"created_at"`
	Members   []Member  `json:"members,omitempty"`
}

// Member represents a conversation member
type Member struct {
	ID        int       `json:"id"`
	UserID    string    `json:"user_id"`
	Role      string    `json:"role"`
	JoinedAt  time.Time `json:"joined_at"`
}

// Message represents a message
type Message struct {
	ID             int       `json:"id"`
	ConversationID int       `json:"conversation_id"`
	SenderID       string    `json:"sender_id"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"created_at"`
	Status         string    `json:"status"`
	SenderName     string    `json:"sender_name,omitempty"`
	SenderRole     string    `json:"sender_role,omitempty"`
}

// ConversationPreview represents a conversation with latest message
type ConversationPreview struct {
	ID           int       `json:"id"`
	Type         string    `json:"type"`
	CreatedAt    time.Time `json:"created_at"`
	LatestMessage *Message `json:"latest_message,omitempty"`
	MemberCount  int       `json:"member_count"`
	OtherMembers []string  `json:"other_members,omitempty"`
}

// NewMessagingService creates a new messaging service
func NewMessagingService(db *sql.DB) *MessagingService {
	return &MessagingService{db: db}
}

// CreateConversation creates a new conversation
func (ms *MessagingService) CreateConversation(ctx context.Context, convType string, memberIDs []string) (int, error) {
	if convType != "direct" && convType != "group" {
		return 0, fmt.Errorf("invalid conversation type: %s", convType)
	}

	if len(memberIDs) < 2 {
		return 0, fmt.Errorf("conversation must have at least 2 members")
	}

	tx, err := ms.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	// Create conversation
	var conversationID int
	err = tx.QueryRowContext(ctx, `
		INSERT INTO conversations (type, created_at)
		VALUES ($1, NOW())
		RETURNING id
	`, convType).Scan(&conversationID)
	if err != nil {
		return 0, fmt.Errorf("failed to create conversation: %v", err)
	}

	// Add members
	for _, userID := range memberIDs {
		// Validate user exists and get role
		var role string
		err = tx.QueryRowContext(ctx, `
			SELECT role FROM users WHERE id = $1
		`, userID).Scan(&role)
		if err != nil {
			return 0, fmt.Errorf("user not found: %s", userID)
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
			VALUES ($1, $2, $3, NOW())
		`, conversationID, userID, role)
		if err != nil {
			return 0, fmt.Errorf("failed to add member: %v", err)
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return conversationID, nil
}

// AddMember adds a member to a conversation
func (ms *MessagingService) AddMember(ctx context.Context, conversationID int, userID string, role string) error {
	_, err := ms.db.ExecContext(ctx, `
		INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (conversation_id, user_id) DO NOTHING
	`, conversationID, userID, role)
	return err
}

// SendMessage sends a message to a conversation
func (ms *MessagingService) SendMessage(ctx context.Context, conversationID int, senderID string, body string) (int, error) {
	// Validate sender is a member of the conversation
	var isMember bool
	err := ms.db.QueryRowContext(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM conversation_members 
			WHERE conversation_id = $1 AND user_id = $2
		)
	`, conversationID, senderID).Scan(&isMember)
	if err != nil {
		return 0, fmt.Errorf("failed to check membership: %v", err)
	}
	if !isMember {
		return 0, fmt.Errorf("user is not a member of this conversation")
	}

	// Sanitize message body
	body = strings.TrimSpace(body)
	if body == "" {
		return 0, fmt.Errorf("message body cannot be empty")
	}

	// Insert message
	var messageID int
	err = ms.db.QueryRowContext(ctx, `
		INSERT INTO messages (conversation_id, sender_id, body, created_at, status)
		VALUES ($1, $2, $3, NOW(), 'delivered')
		RETURNING id
	`, conversationID, senderID, body).Scan(&messageID)
	if err != nil {
		return 0, fmt.Errorf("failed to send message: %v", err)
	}

	return messageID, nil
}

// GetConversationMessages retrieves messages for a conversation
func (ms *MessagingService) GetConversationMessages(ctx context.Context, conversationID int, limit int, afterTimestamp *time.Time) ([]Message, error) {
	// Validate user has access to this conversation
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.body, m.created_at, m.status,
		       u.name as sender_name, u.role as sender_role
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.conversation_id = $1
	`
	args := []interface{}{conversationID}

	if afterTimestamp != nil {
		query += " AND m.created_at < $2"
		args = append(args, *afterTimestamp)
	}

	query += " ORDER BY m.created_at DESC LIMIT $"
	query += fmt.Sprintf("%d", len(args)+1)
	args = append(args, limit)

	rows, err := ms.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %v", err)
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(
			&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Body,
			&msg.CreatedAt, &msg.Status, &msg.SenderName, &msg.SenderRole,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan message: %v", err)
		}
		messages = append(messages, msg)
	}

	return messages, nil
}

// GetUserConversations retrieves conversations for a user
func (ms *MessagingService) GetUserConversations(ctx context.Context, userID string) ([]ConversationPreview, error) {
	query := `
		SELECT DISTINCT c.id, c.type, c.created_at,
		       COUNT(DISTINCT cm.user_id) as member_count,
		       ARRAY_AGG(DISTINCT cm2.user_id) FILTER (WHERE cm2.user_id != $1) as other_members
		FROM conversations c
		JOIN conversation_members cm ON c.id = cm.conversation_id
		LEFT JOIN conversation_members cm2 ON c.id = cm2.conversation_id
		WHERE cm.user_id = $1
		GROUP BY c.id, c.type, c.created_at
		ORDER BY c.created_at DESC
	`

	rows, err := ms.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get conversations: %v", err)
	}
	defer rows.Close()

	var conversations []ConversationPreview
	for rows.Next() {
		var conv ConversationPreview
		var otherMembersStr string
		err := rows.Scan(
			&conv.ID, &conv.Type, &conv.CreatedAt,
			&conv.MemberCount, &otherMembersStr,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan conversation: %v", err)
		}

		// Parse other members array
		if otherMembersStr != "" {
			otherMembersStr = strings.Trim(otherMembersStr, "{}")
			if otherMembersStr != "" {
				conv.OtherMembers = strings.Split(otherMembersStr, ",")
			}
		}

		// Get latest message
		latestMsg, err := ms.getLatestMessage(ctx, conv.ID)
		if err == nil {
			conv.LatestMessage = latestMsg
		}

		conversations = append(conversations, conv)
	}

	return conversations, nil
}

// getLatestMessage gets the latest message for a conversation
func (ms *MessagingService) getLatestMessage(ctx context.Context, conversationID int) (*Message, error) {
	var msg Message
	err := ms.db.QueryRowContext(ctx, `
		SELECT m.id, m.conversation_id, m.sender_id, m.body, m.created_at, m.status,
		       u.name as sender_name, u.role as sender_role
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at DESC
		LIMIT 1
	`, conversationID).Scan(
		&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Body,
		&msg.CreatedAt, &msg.Status, &msg.SenderName, &msg.SenderRole,
	)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

// FindOrCreateDirectConversation finds or creates a direct conversation between two users
func (ms *MessagingService) FindOrCreateDirectConversation(ctx context.Context, userID1, userID2 string) (int, error) {
	// Check if direct conversation already exists
	var conversationID int
	err := ms.db.QueryRowContext(ctx, `
		SELECT c.id
		FROM conversations c
		WHERE c.type = 'direct'
		AND EXISTS (
			SELECT 1 FROM conversation_members cm1 
			WHERE cm1.conversation_id = c.id AND cm1.user_id = $1
		)
		AND EXISTS (
			SELECT 1 FROM conversation_members cm2 
			WHERE cm2.conversation_id = c.id AND cm2.user_id = $2
		)
		AND (
			SELECT COUNT(*) FROM conversation_members cm3 
			WHERE cm3.conversation_id = c.id
		) = 2
	`, userID1, userID2).Scan(&conversationID)

	if err == nil {
		return conversationID, nil
	}

	// Create new direct conversation
	return ms.CreateConversation(ctx, "direct", []string{userID1, userID2})
}

// ValidateUserAccess validates that a user has access to a conversation
func (ms *MessagingService) ValidateUserAccess(ctx context.Context, userID string, conversationID int) error {
	var hasAccess bool
	err := ms.db.QueryRowContext(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM conversation_members 
			WHERE conversation_id = $1 AND user_id = $2
		)
	`, conversationID, userID).Scan(&hasAccess)
	if err != nil {
		return fmt.Errorf("failed to check access: %v", err)
	}
	if !hasAccess {
		return fmt.Errorf("access denied to conversation")
	}
	return nil
}
