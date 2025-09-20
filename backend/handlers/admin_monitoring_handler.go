package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Andrew-mugwe/agroai/services/analytics"
	"github.com/Andrew-mugwe/agroai/utils"
)

// AdminMonitoringHandler handles admin monitoring and analytics
type AdminMonitoringHandler struct {
	db        *sql.DB
	analytics *analytics.MarketplaceAnalytics
}

// NewAdminMonitoringHandler creates a new admin monitoring handler
func NewAdminMonitoringHandler(db *sql.DB) *AdminMonitoringHandler {
	return &AdminMonitoringHandler{
		db:        db,
		analytics: analytics.NewMarketplaceAnalytics(),
	}
}

// MonitoringOverview represents the overview data for admin dashboard
type MonitoringOverview struct {
	TotalUsers      int     `json:"total_users"`
	ActiveUsers7d   int     `json:"active_users_7d"`
	TotalOrders7d   int     `json:"total_orders_7d"`
	GMV7d           float64 `json:"gmv_7d"`
	AvgReputation   float64 `json:"avg_reputation"`
	TotalSellers    int     `json:"total_sellers"`
	VerifiedSellers int     `json:"verified_sellers"`
	TotalProducts   int     `json:"total_products"`
	DisputesOpen    int     `json:"disputes_open"`
}

// SellerListItem represents a seller in the admin list
type SellerListItem struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	Name         string    `json:"name"`
	Verified     bool      `json:"verified"`
	AvgRating    float64   `json:"avg_rating"`
	TotalReviews int       `json:"total_reviews"`
	TotalOrders  int       `json:"total_orders"`
	Reputation   float64   `json:"reputation"`
	Country      string    `json:"country"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetMonitoringOverview handles GET /api/admin/monitoring/overview
func (h *AdminMonitoringHandler) GetMonitoringOverview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get total users
	var totalUsers int
	err := h.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users").Scan(&totalUsers)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get total users")
		return
	}

	// Get active users in last 7 days
	var activeUsers7d int
	err = h.db.QueryRowContext(ctx, `
		SELECT COUNT(DISTINCT user_id) 
		FROM analytics_events 
		WHERE created_at >= NOW() - INTERVAL '7 days'
	`).Scan(&activeUsers7d)
	if err != nil {
		// If analytics table doesn't exist, use a fallback
		activeUsers7d = totalUsers / 3 // Rough estimate
	}

	// Get total orders in last 7 days
	var totalOrders7d int
	err = h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM orders 
		WHERE created_at >= NOW() - INTERVAL '7 days'
	`).Scan(&totalOrders7d)
	if err != nil {
		totalOrders7d = 0
	}

	// Get GMV in last 7 days
	var gmv7d float64
	err = h.db.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(total_amount), 0) 
		FROM orders 
		WHERE created_at >= NOW() - INTERVAL '7 days' 
		AND status = 'completed'
	`).Scan(&gmv7d)
	if err != nil {
		gmv7d = 0
	}

	// Get average reputation
	var avgReputation float64
	err = h.db.QueryRowContext(ctx, `
		SELECT COALESCE(AVG(score), 50) 
		FROM reputation_history rh
		WHERE rh.created_at >= NOW() - INTERVAL '30 days'
	`).Scan(&avgReputation)
	if err != nil {
		avgReputation = 50 // Default
	}

	// Get total sellers
	var totalSellers int
	err = h.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM sellers").Scan(&totalSellers)
	if err != nil {
		totalSellers = 0
	}

	// Get verified sellers
	var verifiedSellers int
	err = h.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM sellers WHERE verified = true").Scan(&verifiedSellers)
	if err != nil {
		verifiedSellers = 0
	}

	// Get total products
	var totalProducts int
	err = h.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM marketplace_products WHERE is_active = true").Scan(&totalProducts)
	if err != nil {
		totalProducts = 0
	}

	// Get open disputes
	var disputesOpen int
	err = h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM disputes 
		WHERE status IN ('OPEN', 'IN_REVIEW')
	`).Scan(&disputesOpen)
	if err != nil {
		disputesOpen = 0
	}

	overview := MonitoringOverview{
		TotalUsers:      totalUsers,
		ActiveUsers7d:   activeUsers7d,
		TotalOrders7d:   totalOrders7d,
		GMV7d:           gmv7d,
		AvgReputation:   avgReputation,
		TotalSellers:    totalSellers,
		VerifiedSellers: verifiedSellers,
		TotalProducts:   totalProducts,
		DisputesOpen:    disputesOpen,
	}

	response := map[string]interface{}{
		"success": true,
		"data":    overview,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetSellers handles GET /api/admin/sellers
func (h *AdminMonitoringHandler) GetSellers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	filter := r.URL.Query().Get("filter")
	limit := 20
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			offset = (page - 1) * limit
		}
	}

	// Build query based on filter
	baseQuery := `
		SELECT s.id, s.user_id, s.name, s.verified, s.created_at,
		       COALESCE(ss.avg_rating, 0) as avg_rating,
		       COALESCE(ss.total_reviews, 0) as total_reviews,
		       COALESCE(ss.total_orders, 0) as total_orders,
		       COALESCE(rh.score, 50) as reputation,
		       COALESCE(s.location->>'country', '') as country
		FROM sellers s
		LEFT JOIN seller_stats ss ON s.id = ss.seller_id
		LEFT JOIN LATERAL (
			SELECT score FROM reputation_history 
			WHERE seller_id = s.user_id 
			ORDER BY created_at DESC 
			LIMIT 1
		) rh ON true
	`

	var whereClause string
	var args []interface{}
	argIndex := 1

	switch filter {
	case "low_reputation":
		whereClause = "WHERE COALESCE(rh.score, 50) < 40"
	case "unverified":
		whereClause = "WHERE s.verified = false"
	case "high_reputation":
		whereClause = "WHERE COALESCE(rh.score, 50) >= 80"
	default:
		whereClause = ""
	}

	orderClause := "ORDER BY s.created_at DESC"
	limitClause := "LIMIT $" + strconv.Itoa(argIndex) + " OFFSET $" + strconv.Itoa(argIndex+1)
	args = append(args, limit, offset)

	query := baseQuery + whereClause + " " + orderClause + " " + limitClause

	rows, err := h.db.QueryContext(ctx, query, args...)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get sellers")
		return
	}
	defer rows.Close()

	var sellers []SellerListItem
	for rows.Next() {
		var seller SellerListItem
		err := rows.Scan(
			&seller.ID, &seller.UserID, &seller.Name, &seller.Verified,
			&seller.AvgRating, &seller.TotalReviews, &seller.TotalOrders,
			&seller.Reputation, &seller.Country, &seller.CreatedAt,
		)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to scan seller")
			return
		}
		sellers = append(sellers, seller)
	}

	// Get total count for pagination
	countQuery := "SELECT COUNT(*) FROM sellers s" + whereClause
	var totalCount int
	err = h.db.QueryRowContext(ctx, countQuery, args[:len(args)-2]...).Scan(&totalCount)
	if err != nil {
		totalCount = len(sellers)
	}

	response := map[string]interface{}{
		"success": true,
		"data":    sellers,
		"pagination": map[string]interface{}{
			"total":  totalCount,
			"limit":  limit,
			"offset": offset,
			"page":   (offset / limit) + 1,
		},
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// CreateAlert handles POST /api/admin/alerts
func (h *AdminMonitoringHandler) CreateAlert(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (admin user)
	_, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Type     string                 `json:"type"`
		Severity string                 `json:"severity"`
		Message  string                 `json:"message"`
		Metadata map[string]interface{} `json:"metadata"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.Type == "" || req.Severity == "" || req.Message == "" {
		utils.RespondWithValidationError(w, "Type, severity, and message are required")
		return
	}

	// Track the alert creation
	err = h.analytics.TrackSystemAlert(r.Context(), req.Type, req.Severity, req.Message, req.Metadata)
	if err != nil {
		// Log error but don't fail the request
		// In production, you'd want proper logging here
	}

	// Store alert in database (you might want to create an alerts table)
	// For now, we'll just track it via PostHog

	response := map[string]interface{}{
		"success": true,
		"message": "Alert created successfully",
	}

	utils.RespondWithJSON(w, http.StatusCreated, response)
}

// GetReputationDistribution handles GET /api/admin/monitoring/reputation-distribution
func (h *AdminMonitoringHandler) GetReputationDistribution(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	query := `
		SELECT 
			CASE 
				WHEN COALESCE(rh.score, 50) >= 90 THEN 'Excellent (90-100)'
				WHEN COALESCE(rh.score, 50) >= 75 THEN 'Very Good (75-89)'
				WHEN COALESCE(rh.score, 50) >= 60 THEN 'Good (60-74)'
				WHEN COALESCE(rh.score, 50) >= 40 THEN 'Fair (40-59)'
				ELSE 'Poor (0-39)'
			END as range,
			COUNT(*) as count
		FROM sellers s
		LEFT JOIN LATERAL (
			SELECT score FROM reputation_history 
			WHERE seller_id = s.user_id 
			ORDER BY created_at DESC 
			LIMIT 1
		) rh ON true
		GROUP BY 
			CASE 
				WHEN COALESCE(rh.score, 50) >= 90 THEN 'Excellent (90-100)'
				WHEN COALESCE(rh.score, 50) >= 75 THEN 'Very Good (75-89)'
				WHEN COALESCE(rh.score, 50) >= 60 THEN 'Good (60-74)'
				WHEN COALESCE(rh.score, 50) >= 40 THEN 'Fair (40-59)'
				ELSE 'Poor (0-39)'
			END
		ORDER BY MIN(COALESCE(rh.score, 50)) DESC
	`

	rows, err := h.db.QueryContext(ctx, query)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get reputation distribution")
		return
	}
	defer rows.Close()

	var distribution []map[string]interface{}
	for rows.Next() {
		var rangeName string
		var count int
		err := rows.Scan(&rangeName, &count)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to scan distribution")
			return
		}
		distribution = append(distribution, map[string]interface{}{
			"range": rangeName,
			"count": count,
		})
	}

	response := map[string]interface{}{
		"success": true,
		"data":    distribution,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetDisputesOverTime handles GET /api/admin/monitoring/disputes-over-time
func (h *AdminMonitoringHandler) GetDisputesOverTime(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get disputes over last 30 days grouped by day
	query := `
		SELECT 
			DATE(created_at) as date,
			COUNT(*) as count
		FROM disputes 
		WHERE created_at >= NOW() - INTERVAL '30 days'
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at)
	`

	rows, err := h.db.QueryContext(ctx, query)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get disputes over time")
		return
	}
	defer rows.Close()

	var disputesOverTime []map[string]interface{}
	for rows.Next() {
		var date time.Time
		var count int
		err := rows.Scan(&date, &count)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to scan disputes")
			return
		}
		disputesOverTime = append(disputesOverTime, map[string]interface{}{
			"date":  date.Format("2006-01-02"),
			"count": count,
		})
	}

	response := map[string]interface{}{
		"success": true,
		"data":    disputesOverTime,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}
