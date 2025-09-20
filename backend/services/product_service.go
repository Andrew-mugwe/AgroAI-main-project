package services

import (
	"context"
	"database/sql"
	"errors"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/repository"

	"github.com/google/uuid"
)

var (
	ErrProductUnauthorized = errors.New("unauthorized: only traders can manage products")
	ErrNotFound     = errors.New("product not found")
)

type ProductService interface {
	CreateProduct(ctx context.Context, traderID uuid.UUID, req *models.CreateProductRequest) (*models.Product, error)
	UpdateProduct(ctx context.Context, productID, traderID uuid.UUID, req *models.UpdateProductRequest) (*models.Product, error)
	DeleteProduct(ctx context.Context, productID, traderID uuid.UUID) error
	GetTraderProducts(ctx context.Context, traderID uuid.UUID, page, pageSize int) ([]*models.Product, int, error)
	GetProductByID(ctx context.Context, productID uuid.UUID) (*models.Product, error)
}

type productService struct {
	productRepo repository.ProductRepository
}

func NewProductService(productRepo repository.ProductRepository) ProductService {
	return &productService{
		productRepo: productRepo,
	}
}

func (s *productService) CreateProduct(ctx context.Context, traderID uuid.UUID, req *models.CreateProductRequest) (*models.Product, error) {
	// Note: Role verification should be done at the handler level

	product := &models.Product{
		TraderID:    traderID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		Category:    req.Category,
		ImageURL:    req.ImageURL,
		IsActive:    true,
	}

	err := s.productRepo.Create(ctx, product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (s *productService) UpdateProduct(ctx context.Context, productID, traderID uuid.UUID, req *models.UpdateProductRequest) (*models.Product, error) {
	// Get existing product
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}

	// Verify ownership
	if product.TraderID != traderID {
		return nil, ErrProductUnauthorized
	}

	// Update fields if provided
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.Category != nil {
		product.Category = *req.Category
	}
	if req.ImageURL != nil {
		product.ImageURL = *req.ImageURL
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	err = s.productRepo.Update(ctx, product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (s *productService) DeleteProduct(ctx context.Context, productID, traderID uuid.UUID) error {
	// Verify product exists and belongs to trader
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return err
	}

	if product.TraderID != traderID {
		return ErrProductUnauthorized
	}

	return s.productRepo.Delete(ctx, productID, traderID)
}

func (s *productService) GetTraderProducts(ctx context.Context, traderID uuid.UUID, page, pageSize int) ([]*models.Product, int, error) {
	// Get total count
	total, err := s.productRepo.CountByTrader(ctx, traderID)
	if err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize
	if offset < 0 {
		offset = 0
	}

	// Get products
	products, err := s.productRepo.GetByTrader(ctx, traderID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (s *productService) GetProductByID(ctx context.Context, productID uuid.UUID) (*models.Product, error) {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return product, nil
}
