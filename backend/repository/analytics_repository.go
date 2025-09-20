package repository

import (
	"context"
	"database/sql"
	"time"
	"github.com/Andrew-mugwe/agroai/models"

	"github.com/google/uuid"
)

type AnalyticsRepository interface {
	LogEvent(ctx context.Context, event *models.AnalyticsEvent) error
	GetUserEvents(ctx context.Context, userID uuid.UUID, role string, startTime time.Time) ([]*models.AnalyticsEvent, error)
	GetEventCounts(ctx context.Context, userID uuid.UUID, role string, eventTypes []string, startTime time.Time) (map[string]int, error)
	GetNGOManagedFarmers(ctx context.Context, ngoID uuid.UUID) ([]uuid.UUID, error)
	GetTrends(ctx context.Context, userID uuid.UUID, role string, eventType string, timeframe models.TimeFrame, startTime time.Time) ([]*models.TrendPoint, error)
}

type analyticsRepository struct {
	db *sql.DB
}

func NewAnalyticsRepository(db *sql.DB) AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) LogEvent(ctx context.Context, event *models.AnalyticsEvent) error {
	query := `
		INSERT INTO analytics_events (user_id, role, event_type, metadata)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`

	return r.db.QueryRowContext(
		ctx,
		query,
		event.UserID,
		event.Role,
		event.EventType,
		event.Metadata,
	).Scan(&event.ID, &event.CreatedAt)
}

func (r *analyticsRepository) GetUserEvents(ctx context.Context, userID uuid.UUID, role string, startTime time.Time) ([]*models.AnalyticsEvent, error) {
	query := `
		SELECT id, user_id, role, event_type, metadata, created_at
		FROM analytics_events
		WHERE user_id = $1 AND role = $2 AND created_at >= $3
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID, role, startTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*models.AnalyticsEvent
	for rows.Next() {
		event := &models.AnalyticsEvent{}
		err := rows.Scan(
			&event.ID,
			&event.UserID,
			&event.Role,
			&event.EventType,
			&event.Metadata,
			&event.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (r *analyticsRepository) GetEventCounts(ctx context.Context, userID uuid.UUID, role string, eventTypes []string, startTime time.Time) (map[string]int, error) {
	query := `
		SELECT event_type, COUNT(*)
		FROM analytics_events
		WHERE user_id = $1 
		AND role = $2 
		AND event_type = ANY($3)
		AND created_at >= $4
		GROUP BY event_type`

	rows, err := r.db.QueryContext(ctx, query, userID, role, eventTypes, startTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var eventType string
		var count int
		if err := rows.Scan(&eventType, &count); err != nil {
			return nil, err
		}
		counts[eventType] = count
	}

	return counts, nil
}

func (r *analyticsRepository) GetNGOManagedFarmers(ctx context.Context, ngoID uuid.UUID) ([]uuid.UUID, error) {
	query := `
		SELECT farmer_id
		FROM ngo_users
		WHERE ngo_id = $1`

	rows, err := r.db.QueryContext(ctx, query, ngoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var farmerIDs []uuid.UUID
	for rows.Next() {
		var farmerID uuid.UUID
		if err := rows.Scan(&farmerID); err != nil {
			return nil, err
		}
		farmerIDs = append(farmerIDs, farmerID)
	}

	return farmerIDs, nil
}

func (r *analyticsRepository) GetTrends(ctx context.Context, userID uuid.UUID, role string, eventType string, timeframe models.TimeFrame, startTime time.Time) ([]*models.TrendPoint, error) {
	var interval string
	switch timeframe {
	case models.TimeFrameDaily:
		interval = "1 day"
	case models.TimeFrameWeekly:
		interval = "1 week"
	case models.TimeFrameMonthly:
		interval = "1 month"
	default:
		interval = "1 week"
	}

	query := `
		WITH dates AS (
			SELECT generate_series(
				date_trunc($1, $2::timestamp),
				date_trunc($1, now()),
				$3::interval
			) as date
		)
		SELECT 
			dates.date,
			COALESCE(COUNT(ae.id), 0) as count
		FROM dates
		LEFT JOIN analytics_events ae ON 
			date_trunc($1, ae.created_at) = dates.date
			AND ae.user_id = $4
			AND ae.role = $5
			AND ae.event_type = $6
		GROUP BY dates.date
		ORDER BY dates.date ASC`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		timeframe,
		startTime,
		interval,
		userID,
		role,
		eventType,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []*models.TrendPoint
	for rows.Next() {
		point := &models.TrendPoint{}
		if err := rows.Scan(&point.Date, &point.Value); err != nil {
			return nil, err
		}
		points = append(points, point)
	}

	return points, nil
}
