package services

import (
	"database/sql"
	"fmt"
	"time"
)

type TraderService struct {
	db *sql.DB
}

func NewTraderService(db *sql.DB) *TraderService {
	return &TraderService{db: db}
}

type Product struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type Order struct {
	ID         string    `json:"id"`
	ProductID  string    `json:"product_id"`
	BuyerID    string    `json:"buyer_id"`
	Quantity   int       `json:"quantity"`
	UnitPrice  float64   `json:"unit_price"`
	TotalPrice float64   `json:"total_price"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

type Analytics struct {
	TotalRevenue float64 `json:"total_revenue"`
	TotalOrders  int     `json:"total_orders"`
	TopProducts  []struct {
		Name     string  `json:"name"`
		Revenue  float64 `json:"revenue"`
		Quantity int     `json:"quantity"`
	} `json:"top_products"`
	MonthlyTrends []struct {
		Month   string  `json:"month"`
		Revenue float64 `json:"revenue"`
		Orders  int     `json:"orders"`
	} `json:"monthly_trends"`
}

// GetProducts returns a trader's product listings with optional filtering
func (s *TraderService) GetProducts(traderID string, category string, status string) ([]Product, error) {
	query := `
		SELECT id, name, description, price, stock, category, status, created_at
		FROM marketplace_products
		WHERE trader_id = $1
	`
	args := []interface{}{traderID}

	if category != "" {
		query += " AND category = $2"
		args = append(args, category)
	}
	if status != "" {
		query += " AND status = $" + fmt.Sprint(len(args)+1)
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC"

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying products: %v", err)
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.Description,
			&p.Price,
			&p.Stock,
			&p.Category,
			&p.Status,
			&p.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning product: %v", err)
		}
		products = append(products, p)
	}

	return products, nil
}

// GetOrders returns a trader's orders with optional filtering
func (s *TraderService) GetOrders(traderID string, status string, startDate, endDate time.Time) ([]Order, error) {
	query := `
		SELECT id, product_id, buyer_id, quantity, unit_price, total_price, status, created_at
		FROM orders
		WHERE trader_id = $1
	`
	args := []interface{}{traderID}

	if status != "" {
		query += " AND status = $2"
		args = append(args, status)
	}
	if !startDate.IsZero() {
		query += " AND created_at >= $" + fmt.Sprint(len(args)+1)
		args = append(args, startDate)
	}
	if !endDate.IsZero() {
		query += " AND created_at <= $" + fmt.Sprint(len(args)+1)
		args = append(args, endDate)
	}

	query += " ORDER BY created_at DESC"

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying orders: %v", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		if err := rows.Scan(
			&o.ID,
			&o.ProductID,
			&o.BuyerID,
			&o.Quantity,
			&o.UnitPrice,
			&o.TotalPrice,
			&o.Status,
			&o.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning order: %v", err)
		}
		orders = append(orders, o)
	}

	return orders, nil
}

// GetAnalytics returns trading analytics for a trader
func (s *TraderService) GetAnalytics(traderID string) (*Analytics, error) {
	var analytics Analytics

	// Get total revenue and orders
	err := s.db.QueryRow(`
		SELECT 
			COALESCE(SUM(total_price), 0) as total_revenue,
			COUNT(*) as total_orders
		FROM orders
		WHERE trader_id = $1 AND status != 'cancelled'
	`, traderID).Scan(&analytics.TotalRevenue, &analytics.TotalOrders)
	if err != nil {
		return nil, fmt.Errorf("error getting totals: %v", err)
	}

	// Get top products
	rows, err := s.db.Query(`
		SELECT 
			p.name,
			SUM(o.total_price) as revenue,
			SUM(o.quantity) as quantity
		FROM orders o
		JOIN marketplace_products p ON o.product_id = p.id
		WHERE o.trader_id = $1 AND o.status != 'cancelled'
		GROUP BY p.name
		ORDER BY revenue DESC
		LIMIT 5
	`, traderID)
	if err != nil {
		return nil, fmt.Errorf("error getting top products: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var product struct {
			Name     string  `json:"name"`
			Revenue  float64 `json:"revenue"`
			Quantity int     `json:"quantity"`
		}
		if err := rows.Scan(&product.Name, &product.Revenue, &product.Quantity); err != nil {
			return nil, fmt.Errorf("error scanning top product: %v", err)
		}
		analytics.TopProducts = append(analytics.TopProducts, product)
	}

	// Get monthly trends (last 6 months)
	trendRows, err := s.db.Query(`
		WITH months AS (
			SELECT generate_series(
				date_trunc('month', NOW()) - interval '5 months',
				date_trunc('month', NOW()),
				interval '1 month'
			) as month
		)
		SELECT 
			to_char(m.month, 'Mon') as month,
			COALESCE(SUM(o.total_price), 0) as revenue,
			COUNT(o.id) as orders
		FROM months m
		LEFT JOIN orders o ON 
			date_trunc('month', o.created_at) = m.month AND
			o.trader_id = $1 AND
			o.status != 'cancelled'
		GROUP BY m.month
		ORDER BY m.month
	`, traderID)
	if err != nil {
		return nil, fmt.Errorf("error getting monthly trends: %v", err)
	}
	defer trendRows.Close()

	for trendRows.Next() {
		var trend struct {
			Month   string  `json:"month"`
			Revenue float64 `json:"revenue"`
			Orders  int     `json:"orders"`
		}
		if err := trendRows.Scan(&trend.Month, &trend.Revenue, &trend.Orders); err != nil {
			return nil, fmt.Errorf("error scanning trend: %v", err)
		}
		analytics.MonthlyTrends = append(analytics.MonthlyTrends, trend)
	}

	return &analytics, nil
}
