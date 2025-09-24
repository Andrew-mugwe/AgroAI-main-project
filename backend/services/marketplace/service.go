package marketplace

// Flow14.1.1

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type Product struct {
	ID                 string   `json:"id"`
	SellerID           string   `json:"seller_id"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	Category           string   `json:"category"`
	PriceCents         int64    `json:"price_cents"`
	Currency           string   `json:"currency"`
	Stock              int      `json:"stock"`
	Images             []string `json:"images"`
	CreatedAt          string   `json:"created_at"`
	UpdatedAt          string   `json:"updated_at"`
	SellerName         *string  `json:"seller_name,omitempty"`
	SellerVerified     *bool    `json:"seller_verified,omitempty"`
	SellerRating       *float64 `json:"seller_rating,omitempty"`
	SellerReviewsCount *int     `json:"seller_reviews_count,omitempty"`
}

type Meta struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`
}

type ListFilter struct {
	Page     int
	Limit    int
	Category string
	MinPrice *int64
	MaxPrice *int64
	Query    string
	SellerID string
	Sort     string
}

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// DB exposes the underlying *sql.DB for simple read helpers where pragmatic.
func (s *Service) DB() *sql.DB { return s.db }

func (s *Service) ListPublicProducts(ctx context.Context, f ListFilter) ([]Product, Meta, error) {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.Limit <= 0 || f.Limit > 100 {
		f.Limit = 12
	}
	offset := (f.Page - 1) * f.Limit

	where := []string{"1=1"}
	args := []interface{}{}
	ai := 1
	if f.Category != "" {
		where = append(where, fmt.Sprintf("category = $%d", ai))
		args = append(args, f.Category)
		ai++
	}
	if f.SellerID != "" {
		where = append(where, fmt.Sprintf("seller_id = $%d", ai))
		args = append(args, f.SellerID)
		ai++
	}
	if f.MinPrice != nil {
		where = append(where, fmt.Sprintf("price_cents >= $%d", ai))
		args = append(args, *f.MinPrice)
		ai++
	}
	if f.MaxPrice != nil {
		where = append(where, fmt.Sprintf("price_cents <= $%d", ai))
		args = append(args, *f.MaxPrice)
		ai++
	}
	if strings.TrimSpace(f.Query) != "" {
		where = append(where, fmt.Sprintf("search_tsv @@ plainto_tsquery('simple', $%d)", ai))
		args = append(args, f.Query)
		ai++
	}

	sort := "created_at DESC"
	switch f.Sort {
	case "price_asc":
		sort = "price_cents ASC"
	case "price_desc":
		sort = "price_cents DESC"
	}

	countSQL := "SELECT COUNT(*) FROM public_products WHERE " + strings.Join(where, " AND ")
	var total int
	if err := s.db.QueryRowContext(ctx, countSQL, args...).Scan(&total); err != nil {
		return nil, Meta{}, err
	}

	query := "SELECT id, seller_id, title, description, category, price_cents, currency, stock, images, created_at, updated_at, seller_name, seller_verified, seller_rating, seller_reviews_count FROM public_products WHERE " + strings.Join(where, " AND ") + " ORDER BY " + sort + " LIMIT $%d OFFSET $%d"
	query = fmt.Sprintf(query, ai, ai+1)
	args = append(args, f.Limit, offset)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, Meta{}, err
	}
	defer rows.Close()

	products := []Product{}
	for rows.Next() {
		var p Product
		var imagesJSON []byte
		if err := rows.Scan(&p.ID, &p.SellerID, &p.Title, &p.Description, &p.Category, &p.PriceCents, &p.Currency, &p.Stock, &imagesJSON, &p.CreatedAt, &p.UpdatedAt, &p.SellerName, &p.SellerVerified, &p.SellerRating, &p.SellerReviewsCount); err != nil {
			return nil, Meta{}, err
		}
		// naive JSON array of strings
		p.Images = parseStringArrayJSON(imagesJSON)
		products = append(products, p)
	}
	return products, Meta{Page: f.Page, Limit: f.Limit, Total: total}, nil
}

func (s *Service) GetPublicProduct(ctx context.Context, id string) (Product, error) {
	var p Product
	var imagesJSON []byte
	err := s.db.QueryRowContext(ctx, `
        SELECT id, seller_id, title, description, category, price_cents, currency, stock, images, created_at, updated_at, seller_name, seller_verified, seller_rating, seller_reviews_count
        FROM public_products WHERE id = $1
    `, id).Scan(&p.ID, &p.SellerID, &p.Title, &p.Description, &p.Category, &p.PriceCents, &p.Currency, &p.Stock, &imagesJSON, &p.CreatedAt, &p.UpdatedAt, &p.SellerName, &p.SellerVerified, &p.SellerRating, &p.SellerReviewsCount)
	if err != nil {
		return Product{}, err
	}
	p.Images = parseStringArrayJSON(imagesJSON)
	return p, nil
}

func (s *Service) SearchProducts(ctx context.Context, q string, limit int) ([]Product, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	rows, err := s.db.QueryContext(ctx, `
        SELECT id, seller_id, title, description, category, price_cents, currency, stock, images, created_at, updated_at
        FROM public_products WHERE search_tsv @@ plainto_tsquery('simple', $1) ORDER BY ts_rank(search_tsv, plainto_tsquery('simple', $1)) DESC LIMIT $2
    `, q, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Product{}
	for rows.Next() {
		var p Product
		var imagesJSON []byte
		if err := rows.Scan(&p.ID, &p.SellerID, &p.Title, &p.Description, &p.Category, &p.PriceCents, &p.Currency, &p.Stock, &imagesJSON, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		p.Images = parseStringArrayJSON(imagesJSON)
		out = append(out, p)
	}
	return out, nil
}

func parseStringArrayJSON(b []byte) []string {
	if len(b) == 0 {
		return nil
	}
	s := strings.TrimSpace(string(b))
	s = strings.TrimPrefix(s, "[")
	s = strings.TrimSuffix(s, "]")
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		out = append(out, strings.Trim(strings.TrimSpace(p), `"`))
	}
	return out
}
