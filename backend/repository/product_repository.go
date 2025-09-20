package repository

import (
	"context"
	"database/sql"
	"github.com/Andrew-mugwe/agroai/models"

	"github.com/google/uuid"
)

type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	Update(ctx context.Context, product *models.Product) error
	Delete(ctx context.Context, id uuid.UUID, traderID uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Product, error)
	GetByTrader(ctx context.Context, traderID uuid.UUID, limit, offset int) ([]*models.Product, error)
	CountByTrader(ctx context.Context, traderID uuid.UUID) (int, error)
}

type productRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(ctx context.Context, product *models.Product) error {
	query := `
        INSERT INTO marketplace_products (
            trader_id, name, description, price, stock, category, image_url, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at, updated_at`

	return r.db.QueryRowContext(
		ctx,
		query,
		product.TraderID,
		product.Name,
		product.Description,
		product.Price,
		product.Stock,
		product.Category,
		product.ImageURL,
		product.IsActive,
	).Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)
}

func (r *productRepository) Update(ctx context.Context, product *models.Product) error {
	query := `
        UPDATE marketplace_products
        SET name = $1, description = $2, price = $3, stock = $4, 
            category = $5, image_url = $6, is_active = $7
        WHERE id = $8 AND trader_id = $9
        RETURNING updated_at`

	result, err := r.db.ExecContext(
		ctx,
		query,
		product.Name,
		product.Description,
		product.Price,
		product.Stock,
		product.Category,
		product.ImageURL,
		product.IsActive,
		product.ID,
		product.TraderID,
	)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *productRepository) Delete(ctx context.Context, id uuid.UUID, traderID uuid.UUID) error {
	query := `
        DELETE FROM marketplace_products
        WHERE id = $1 AND trader_id = $2`

	result, err := r.db.ExecContext(ctx, query, id, traderID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *productRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	query := `
        SELECT id, trader_id, name, description, price, stock,
               category, image_url, is_active, created_at, updated_at
        FROM marketplace_products
        WHERE id = $1`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&product.ID,
		&product.TraderID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.Category,
		&product.ImageURL,
		&product.IsActive,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (r *productRepository) GetByTrader(ctx context.Context, traderID uuid.UUID, limit, offset int) ([]*models.Product, error) {
	query := `
        SELECT id, trader_id, name, description, price, stock,
               category, image_url, is_active, created_at, updated_at
        FROM marketplace_products
        WHERE trader_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, traderID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		product := &models.Product{}
		err := rows.Scan(
			&product.ID,
			&product.TraderID,
			&product.Name,
			&product.Description,
			&product.Price,
			&product.Stock,
			&product.Category,
			&product.ImageURL,
			&product.IsActive,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

func (r *productRepository) CountByTrader(ctx context.Context, traderID uuid.UUID) (int, error) {
	var count int
	query := `
        SELECT COUNT(*)
        FROM marketplace_products
        WHERE trader_id = $1`

	err := r.db.QueryRowContext(ctx, query, traderID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
