package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Event types
const (
	// Farmer events
	EventFarmerCropAdded     = "farmer.crop_added"
	EventFarmerWeatherViewed = "farmer.weather_viewed"
	EventFarmerAlertRead     = "farmer.alert_read"

	// NGO events
	EventNGOTrainingCreated = "ngo.training_created"
	EventNGOFarmerOnboarded = "ngo.farmer_onboarded"
	EventNGOResourceShared  = "ngo.resource_shared"

	// Trader events
	EventTraderProductListed  = "trader.product_listed"
	EventTraderOrderReceived  = "trader.order_received"
	EventTraderOrderFulfilled = "trader.order_fulfilled"
)

// AnalyticsEvent represents an analytics event in the system
type AnalyticsEvent struct {
	ID        uuid.UUID       `json:"id" db:"id"`
	UserID    uuid.UUID       `json:"user_id" db:"user_id"`
	Role      string          `json:"role" db:"role"`
	EventType string          `json:"event_type" db:"event_type"`
	Metadata  json.RawMessage `json:"metadata" db:"metadata"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
}

// LogEventRequest represents the request to log an analytics event
type LogEventRequest struct {
	EventType string         `json:"event_type" validate:"required,event_type"`
	Metadata  map[string]any `json:"metadata" validate:"required"`
}

// TimeFrame represents the time period for analytics queries
type TimeFrame string

const (
	TimeFrameDaily   TimeFrame = "daily"
	TimeFrameWeekly  TimeFrame = "weekly"
	TimeFrameMonthly TimeFrame = "monthly"
)

// RoleSummary represents role-specific analytics summary
type RoleSummary struct {
	// Shared metrics
	TotalEvents int       `json:"total_events"`
	LastActive  time.Time `json:"last_active"`

	// Farmer metrics
	CropsAdded   *int `json:"crops_added,omitempty"`
	AlertsRead   *int `json:"alerts_read,omitempty"`
	WeatherViews *int `json:"weather_views,omitempty"`

	// NGO metrics
	TrainingsHosted  *int `json:"trainings_hosted,omitempty"`
	FarmersOnboarded *int `json:"farmers_onboarded,omitempty"`
	ResourcesShared  *int `json:"resources_shared,omitempty"`

	// Trader metrics
	ProductsListed  *int     `json:"products_listed,omitempty"`
	OrdersReceived  *int     `json:"orders_received,omitempty"`
	OrdersFulfilled *int     `json:"orders_fulfilled,omitempty"`
	TotalRevenue    *float64 `json:"total_revenue,omitempty"`
}

// TrendPoint represents a single point in a trend analysis
type TrendPoint struct {
	Date  time.Time `json:"date"`
	Value int       `json:"value"`
	Label string    `json:"label,omitempty"`
}

// TrendResponse represents the response for trend analysis
type TrendResponse struct {
	TimeFrame TimeFrame    `json:"timeframe"`
	Metric    string       `json:"metric"`
	Points    []TrendPoint `json:"points"`
}

// NGOUserRelation represents the relationship between an NGO and a farmer
type NGOUserRelation struct {
	NGOID     uuid.UUID `json:"ngo_id" db:"ngo_id"`
	FarmerID  uuid.UUID `json:"farmer_id" db:"farmer_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
