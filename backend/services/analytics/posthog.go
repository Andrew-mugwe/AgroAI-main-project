package analytics

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// PostHogClient handles PostHog analytics tracking
type PostHogClient struct {
	apiKey    string
	apiHost   string
	client    *http.Client
	batchSize int
}

// PostHogEvent represents a PostHog event
type PostHogEvent struct {
	Event      string                 `json:"event"`
	DistinctID string                 `json:"distinct_id"`
	Properties map[string]interface{} `json:"properties"`
	Timestamp  time.Time              `json:"timestamp"`
}

// PostHogBatch represents a batch of events for PostHog
type PostHogBatch struct {
	Batch  []PostHogEvent `json:"batch"`
	APIKey string         `json:"api_key"`
}

// NewPostHogClient creates a new PostHog client
func NewPostHogClient() *PostHogClient {
	apiKey := os.Getenv("POSTHOG_API_KEY")
	apiHost := os.Getenv("POSTHOG_API_HOST")
	if apiHost == "" {
		apiHost = "https://app.posthog.com"
	}

	return &PostHogClient{
		apiKey:    apiKey,
		apiHost:   apiHost,
		client:    &http.Client{Timeout: 5 * time.Second},
		batchSize: 50,
	}
}

// TrackEvent sends a single event to PostHog
func (p *PostHogClient) TrackEvent(ctx context.Context, distinctID string, event string, properties map[string]interface{}) error {
	if p.apiKey == "" {
		// PostHog not configured, skip tracking
		return nil
	}

	eventData := PostHogEvent{
		Event:      event,
		DistinctID: distinctID,
		Properties: properties,
		Timestamp:  time.Now(),
	}

	// Set default properties
	if eventData.Properties == nil {
		eventData.Properties = make(map[string]interface{})
	}
	eventData.Properties["$lib"] = "agroai-backend"
	eventData.Properties["$lib_version"] = "1.0.0"

	return p.sendBatch(ctx, []PostHogEvent{eventData})
}

// TrackBatch sends a batch of events to PostHog
func (p *PostHogClient) TrackBatch(ctx context.Context, events []PostHogEvent) error {
	if p.apiKey == "" || len(events) == 0 {
		return nil
	}

	// Process in batches
	for i := 0; i < len(events); i += p.batchSize {
		end := i + p.batchSize
		if end > len(events) {
			end = len(events)
		}

		batch := events[i:end]
		if err := p.sendBatch(ctx, batch); err != nil {
			return fmt.Errorf("failed to send batch %d-%d: %w", i, end, err)
		}
	}

	return nil
}

// sendBatch sends a batch of events to PostHog
func (p *PostHogClient) sendBatch(ctx context.Context, events []PostHogEvent) error {
	if len(events) == 0 {
		return nil
	}

	batch := PostHogBatch{
		Batch:  events,
		APIKey: p.apiKey,
	}

	jsonData, err := json.Marshal(batch)
	if err != nil {
		return fmt.Errorf("failed to marshal batch: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", p.apiHost+"/capture/", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("PostHog API returned status %d", resp.StatusCode)
	}

	return nil
}

// Marketplace Events
const (
	// Product events
	EventProductViewed          = "product_viewed"
	EventProductAddedToCart     = "product_added_to_cart"
	EventProductRemovedFromCart = "product_removed_from_cart"

	// Seller events
	EventSellerProfileViewed = "seller_profile_viewed"
	EventSellerVerified      = "seller_verified"
	EventSellerUnverified    = "seller_unverified"

	// Review events
	EventReviewSubmitted = "review_submitted"
	EventReviewDeleted   = "review_deleted"

	// Order events
	EventOrderCreated   = "order_created"
	EventOrderCompleted = "order_completed"
	EventOrderCancelled = "order_cancelled"

	// Payment events
	EventPaymentInitiated = "payment_initiated"
	EventPaymentSucceeded = "payment_succeeded"
	EventPaymentFailed    = "payment_failed"

	// Messaging events
	EventMessageStarted = "message_started"
	EventMessageSent    = "message_sent"

	// Notification events
	EventNotificationSent = "notification_sent"
	EventNotificationRead = "notification_read"

	// Admin events
	EventAdminAction = "admin_action"
	EventSystemAlert = "system_alert"
)

// MarketplaceAnalytics provides marketplace-specific analytics tracking
type MarketplaceAnalytics struct {
	posthog *PostHogClient
}

// NewMarketplaceAnalytics creates a new marketplace analytics instance
func NewMarketplaceAnalytics() *MarketplaceAnalytics {
	return &MarketplaceAnalytics{
		posthog: NewPostHogClient(),
	}
}

// TrackProductViewed tracks when a product is viewed
func (m *MarketplaceAnalytics) TrackProductViewed(ctx context.Context, userID, productID, sellerID string, country string) error {
	return m.posthog.TrackEvent(ctx, userID, EventProductViewed, map[string]interface{}{
		"product_id": productID,
		"seller_id":  sellerID,
		"country":    country,
		"user_role":  "buyer",
	})
}

// TrackSellerProfileViewed tracks when a seller profile is viewed
func (m *MarketplaceAnalytics) TrackSellerProfileViewed(ctx context.Context, userID, sellerID string, country string) error {
	return m.posthog.TrackEvent(ctx, userID, EventSellerProfileViewed, map[string]interface{}{
		"seller_id": sellerID,
		"country":   country,
	})
}

// TrackReviewSubmitted tracks when a review is submitted
func (m *MarketplaceAnalytics) TrackReviewSubmitted(ctx context.Context, userID, sellerID, orderID string, rating int, country string) error {
	return m.posthog.TrackEvent(ctx, userID, EventReviewSubmitted, map[string]interface{}{
		"seller_id": sellerID,
		"order_id":  orderID,
		"rating":    rating,
		"country":   country,
	})
}

// TrackSellerVerified tracks when a seller is verified
func (m *MarketplaceAnalytics) TrackSellerVerified(ctx context.Context, sellerID string, verified bool, adminID string) error {
	event := EventSellerVerified
	if !verified {
		event = EventSellerUnverified
	}

	return m.posthog.TrackEvent(ctx, adminID, event, map[string]interface{}{
		"seller_id": sellerID,
		"verified":  verified,
		"user_role": "admin",
	})
}

// TrackOrderCreated tracks when an order is created
func (m *MarketplaceAnalytics) TrackOrderCreated(ctx context.Context, userID, orderID, sellerID string, amount float64, currency, country string) error {
	return m.posthog.TrackEvent(ctx, userID, EventOrderCreated, map[string]interface{}{
		"order_id":  orderID,
		"seller_id": sellerID,
		"amount":    amount,
		"currency":  currency,
		"country":   country,
	})
}

// TrackPaymentSucceeded tracks when a payment succeeds
func (m *MarketplaceAnalytics) TrackPaymentSucceeded(ctx context.Context, userID, orderID, transactionID, paymentMethod string, amount float64, currency string) error {
	return m.posthog.TrackEvent(ctx, userID, EventPaymentSucceeded, map[string]interface{}{
		"order_id":       orderID,
		"transaction_id": transactionID,
		"payment_method": paymentMethod,
		"amount":         amount,
		"currency":       currency,
	})
}

// TrackMessageStarted tracks when a message conversation is started
func (m *MarketplaceAnalytics) TrackMessageStarted(ctx context.Context, userID, sellerID, threadID string, country string) error {
	return m.posthog.TrackEvent(ctx, userID, EventMessageStarted, map[string]interface{}{
		"seller_id": sellerID,
		"thread_id": threadID,
		"country":   country,
	})
}

// TrackNotificationSent tracks when a notification is sent
func (m *MarketplaceAnalytics) TrackNotificationSent(ctx context.Context, userID, notificationType string, country string) error {
	return m.posthog.TrackEvent(ctx, userID, EventNotificationSent, map[string]interface{}{
		"notification_type": notificationType,
		"country":           country,
	})
}

// TrackAdminAction tracks admin actions
func (m *MarketplaceAnalytics) TrackAdminAction(ctx context.Context, adminID, action, targetType, targetID string) error {
	return m.posthog.TrackEvent(ctx, adminID, EventAdminAction, map[string]interface{}{
		"action":      action,
		"target_type": targetType,
		"target_id":   targetID,
		"user_role":   "admin",
	})
}

// TrackSystemAlert tracks system alerts
func (m *MarketplaceAnalytics) TrackSystemAlert(ctx context.Context, alertType, severity, message string, metadata map[string]interface{}) error {
	properties := map[string]interface{}{
		"alert_type": alertType,
		"severity":   severity,
		"message":    message,
	}

	// Add metadata
	for k, v := range metadata {
		properties[k] = v
	}

	return m.posthog.TrackEvent(ctx, "system", EventSystemAlert, properties)
}
