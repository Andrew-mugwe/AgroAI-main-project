package services

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/repository"

	"github.com/google/uuid"
)

var (
	ErrInvalidRole      = errors.New("invalid role for analytics")
	ErrUnauthorized     = errors.New("unauthorized to access these analytics")
	ErrInvalidTimeframe = errors.New("invalid timeframe")
)

type AnalyticsService interface {
	LogEvent(ctx context.Context, userID uuid.UUID, role string, req *models.LogEventRequest) error
	GetSummary(ctx context.Context, userID uuid.UUID, role string) (*models.RoleSummary, error)
	GetTrends(ctx context.Context, userID uuid.UUID, role string, timeframe models.TimeFrame) (*models.TrendResponse, error)
}

type analyticsService struct {
	analyticsRepo repository.AnalyticsRepository
}

func NewAnalyticsService(analyticsRepo repository.AnalyticsRepository) AnalyticsService {
	return &analyticsService{
		analyticsRepo: analyticsRepo,
	}
}

func (s *analyticsService) LogEvent(ctx context.Context, userID uuid.UUID, role string, req *models.LogEventRequest) error {
	// Validate role matches event type prefix
	expectedPrefix := role + "."
	if role != "admin" && !strings.HasPrefix(req.EventType, expectedPrefix) {
		return ErrInvalidRole
	}

	// Convert metadata to JSON
	metadata, err := json.Marshal(req.Metadata)
	if err != nil {
		return err
	}

	event := &models.AnalyticsEvent{
		UserID:    userID,
		Role:      role,
		EventType: req.EventType,
		Metadata:  metadata,
	}

	return s.analyticsRepo.LogEvent(ctx, event)
}

func (s *analyticsService) GetSummary(ctx context.Context, userID uuid.UUID, role string) (*models.RoleSummary, error) {
	// Get events from last 30 days
	startTime := time.Now().AddDate(0, 0, -30)

	var eventTypes []string
	switch role {
	case "farmer":
		eventTypes = []string{
			models.EventFarmerCropAdded,
			models.EventFarmerWeatherViewed,
			models.EventFarmerAlertRead,
		}
	case "ngo":
		eventTypes = []string{
			models.EventNGOTrainingCreated,
			models.EventNGOFarmerOnboarded,
			models.EventNGOResourceShared,
		}
	case "trader":
		eventTypes = []string{
			models.EventTraderProductListed,
			models.EventTraderOrderReceived,
			models.EventTraderOrderFulfilled,
		}
	default:
		return nil, ErrInvalidRole
	}

	// Get event counts
	counts, err := s.analyticsRepo.GetEventCounts(ctx, userID, role, eventTypes, startTime)
	if err != nil {
		return nil, err
	}

	// Build role-specific summary
	summary := &models.RoleSummary{
		TotalEvents: 0,
		LastActive:  time.Now(),
	}

	for eventType, count := range counts {
		summary.TotalEvents += count

		switch eventType {
		// Farmer metrics
		case models.EventFarmerCropAdded:
			summary.CropsAdded = &count
		case models.EventFarmerAlertRead:
			summary.AlertsRead = &count
		case models.EventFarmerWeatherViewed:
			summary.WeatherViews = &count

		// NGO metrics
		case models.EventNGOTrainingCreated:
			summary.TrainingsHosted = &count
		case models.EventNGOFarmerOnboarded:
			summary.FarmersOnboarded = &count
		case models.EventNGOResourceShared:
			summary.ResourcesShared = &count

		// Trader metrics
		case models.EventTraderProductListed:
			summary.ProductsListed = &count
		case models.EventTraderOrderReceived:
			summary.OrdersReceived = &count
		case models.EventTraderOrderFulfilled:
			summary.OrdersFulfilled = &count
		}
	}

	// For NGOs, include aggregated farmer data
	if role == "ngo" {
		farmerIDs, err := s.analyticsRepo.GetNGOManagedFarmers(ctx, userID)
		if err != nil {
			return nil, err
		}

		for _, farmerID := range farmerIDs {
			farmerCounts, err := s.analyticsRepo.GetEventCounts(ctx, farmerID, "farmer", []string{
				models.EventFarmerCropAdded,
				models.EventFarmerAlertRead,
			}, startTime)
			if err != nil {
				continue
			}

			// Aggregate farmer metrics
			if count, ok := farmerCounts[models.EventFarmerCropAdded]; ok {
				if summary.CropsAdded == nil {
					summary.CropsAdded = &count
				} else {
					*summary.CropsAdded += count
				}
			}
		}
	}

	return summary, nil
}

func (s *analyticsService) GetTrends(ctx context.Context, userID uuid.UUID, role string, timeframe models.TimeFrame) (*models.TrendResponse, error) {
	// Validate timeframe
	switch timeframe {
	case models.TimeFrameDaily, models.TimeFrameWeekly, models.TimeFrameMonthly:
		// Valid
	default:
		return nil, ErrInvalidTimeframe
	}

	// Determine start time based on timeframe
	var startTime time.Time
	switch timeframe {
	case models.TimeFrameDaily:
		startTime = time.Now().AddDate(0, 0, -7) // Last 7 days
	case models.TimeFrameWeekly:
		startTime = time.Now().AddDate(0, 0, -28) // Last 4 weeks
	case models.TimeFrameMonthly:
		startTime = time.Now().AddDate(0, -6, 0) // Last 6 months
	}

	// Get primary metric for role
	var eventType string
	var metric string
	switch role {
	case "farmer":
		eventType = models.EventFarmerCropAdded
		metric = "Crops Added"
	case "ngo":
		eventType = models.EventNGOFarmerOnboarded
		metric = "Farmers Onboarded"
	case "trader":
		eventType = models.EventTraderOrderFulfilled
		metric = "Orders Fulfilled"
	default:
		return nil, ErrInvalidRole
	}

	// Get trend data
	points, err := s.analyticsRepo.GetTrends(ctx, userID, role, eventType, timeframe, startTime)
	if err != nil {
		return nil, err
	}

	// Convert []*TrendPoint to []TrendPoint
	trendPoints := make([]models.TrendPoint, len(points))
	for i, point := range points {
		trendPoints[i] = *point
	}

	// Format response
	response := &models.TrendResponse{
		TimeFrame: timeframe,
		Metric:    metric,
		Points:    trendPoints,
	}

	return response, nil
}
