package services

import (
	"database/sql"
	"errors"

	"github.com/Andrew-mugwe/agroai/models"
)

type DashboardService struct {
	db *sql.DB
}

func NewDashboardService(db *sql.DB) *DashboardService {
	return &DashboardService{db: db}
}

// DashboardData represents role-specific dashboard data
type DashboardData struct {
	Role      models.UserRole  `json:"role"`
	Summary   map[string]any   `json:"summary"`
	Alerts    []map[string]any `json:"alerts"`
	Analytics map[string]any   `json:"analytics"`
}

func (s *DashboardService) GetDashboard(user *models.User) (*DashboardData, error) {
	if user == nil {
		return nil, errors.New("user is required")
	}

	data := &DashboardData{
		Role:    user.Role,
		Summary: make(map[string]any),
		Alerts:  make([]map[string]any, 0),
	}

	switch user.Role {
	case models.RoleFarmer:
		return s.getFarmerDashboard(user, data)
	case models.RoleNGO:
		return s.getNGODashboard(user, data)
	case models.RoleTrader:
		return s.getTraderDashboard(user, data)
	default:
		return nil, errors.New("invalid role")
	}
}

func (s *DashboardService) getFarmerDashboard(user *models.User, data *DashboardData) (*DashboardData, error) {
	// Get farmer's crops
	var crops []struct {
		Name     string  `json:"name"`
		Area     float64 `json:"area"`
		Status   string  `json:"status"`
		Progress int     `json:"progress"`
	}
	err := s.db.QueryRow(`
		SELECT data FROM farmer_data 
		WHERE user_id = $1 AND type = 'crops'
	`, user.ID).Scan(&crops)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Get weather alerts
	var weatherAlerts []map[string]any
	err = s.db.QueryRow(`
		SELECT data FROM farmer_data 
		WHERE user_id = $1 AND type = 'weather_alerts'
	`, user.ID).Scan(&weatherAlerts)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	data.Summary = map[string]any{
		"crops":        crops,
		"totalArea":    calculateTotalArea(crops),
		"activeAlerts": len(weatherAlerts),
	}

	data.Alerts = weatherAlerts
	data.Analytics = map[string]any{
		"yieldTrend": []float64{85, 92, 88, 95}, // Example data
		"soilHealth": 87,
		"waterUsage": map[string]any{
			"current": 2500,
			"target":  2300,
			"trend":   "decreasing",
		},
	}

	return data, nil
}

func (s *DashboardService) getNGODashboard(user *models.User, data *DashboardData) (*DashboardData, error) {
	// Get farmer groups
	var groups []struct {
		Name      string `json:"name"`
		Members   int    `json:"members"`
		Location  string `json:"location"`
		Progress  int    `json:"progress"`
		Training  string `json:"training"`
		StartDate string `json:"start_date"`
	}
	err := s.db.QueryRow(`
		SELECT data FROM ngo_data 
		WHERE user_id = $1 AND type = 'farmer_groups'
	`, user.ID).Scan(&groups)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	data.Summary = map[string]any{
		"totalGroups":    len(groups),
		"totalFarmers":   calculateTotalFarmers(groups),
		"activeTraining": countActiveTraining(groups),
	}

	data.Analytics = map[string]any{
		"groupProgress": calculateGroupProgress(groups),
		"regionCoverage": map[string]int{
			"Central": 45,
			"Eastern": 30,
			"Western": 25,
		},
		"trainingCompletion": 78,
	}

	return data, nil
}

func (s *DashboardService) getTraderDashboard(user *models.User, data *DashboardData) (*DashboardData, error) {
	// Get active listings
	var listings []struct {
		ID       string  `json:"id"`
		Product  string  `json:"product"`
		Quantity int     `json:"quantity"`
		Price    float64 `json:"price"`
		Status   string  `json:"status"`
	}
	err := s.db.QueryRow(`
		SELECT data FROM marketplace_products 
		WHERE trader_id = $1 AND status = 'active'
	`, user.ID).Scan(&listings)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Get recent orders
	var orders []struct {
		ID        string  `json:"id"`
		Product   string  `json:"product"`
		Quantity  int     `json:"quantity"`
		Total     float64 `json:"total"`
		Status    string  `json:"status"`
		CreatedAt string  `json:"created_at"`
	}
	err = s.db.QueryRow(`
		SELECT data FROM orders 
		WHERE trader_id = $1 
		ORDER BY created_at DESC 
		LIMIT 5
	`, user.ID).Scan(&orders)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	data.Summary = map[string]any{
		"activeListings": len(listings),
		"recentOrders":   len(orders),
		"totalRevenue":   calculateTotalRevenue(orders),
	}

	data.Analytics = map[string]any{
		"salesTrend": []float64{12500, 15000, 13750, 16250},
		"topProducts": []map[string]any{
			{"name": "Maize", "percentage": 35},
			{"name": "Beans", "percentage": 25},
			{"name": "Rice", "percentage": 20},
		},
		"orderCompletion": 92,
	}

	return data, nil
}

// Helper functions

func calculateTotalArea(crops []struct {
	Name     string  `json:"name"`
	Area     float64 `json:"area"`
	Status   string  `json:"status"`
	Progress int     `json:"progress"`
}) float64 {
	var total float64
	for _, crop := range crops {
		total += crop.Area
	}
	return total
}

func calculateTotalFarmers(groups []struct {
	Name      string `json:"name"`
	Members   int    `json:"members"`
	Location  string `json:"location"`
	Progress  int    `json:"progress"`
	Training  string `json:"training"`
	StartDate string `json:"start_date"`
}) int {
	var total int
	for _, group := range groups {
		total += group.Members
	}
	return total
}

func countActiveTraining(groups []struct {
	Name      string `json:"name"`
	Members   int    `json:"members"`
	Location  string `json:"location"`
	Progress  int    `json:"progress"`
	Training  string `json:"training"`
	StartDate string `json:"start_date"`
}) int {
	var count int
	for _, group := range groups {
		if group.Progress < 100 {
			count++
		}
	}
	return count
}

func calculateGroupProgress(groups []struct {
	Name      string `json:"name"`
	Members   int    `json:"members"`
	Location  string `json:"location"`
	Progress  int    `json:"progress"`
	Training  string `json:"training"`
	StartDate string `json:"start_date"`
}) map[string]int {
	progress := make(map[string]int)
	for _, group := range groups {
		progress[group.Name] = group.Progress
	}
	return progress
}

func calculateTotalRevenue(orders []struct {
	ID        string  `json:"id"`
	Product   string  `json:"product"`
	Quantity  int     `json:"quantity"`
	Total     float64 `json:"total"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}) float64 {
	var total float64
	for _, order := range orders {
		if order.Status != "cancelled" {
			total += order.Total
		}
	}
	return total
}
