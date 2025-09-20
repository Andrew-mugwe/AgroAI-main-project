package models

import (
	"time"

	"github.com/google/uuid"
)

type ProductCategory string

const (
	CategorySeeds      ProductCategory = "seeds"
	CategoryFertilizer ProductCategory = "fertilizer"
	CategoryTools      ProductCategory = "tools"
	CategoryMachinery  ProductCategory = "machinery"
	CategoryOther      ProductCategory = "other"
)

type Product struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	TraderID    uuid.UUID       `json:"trader_id" db:"trader_id"`
	Name        string          `json:"name" db:"name" validate:"required,min=3,max=255"`
	Description string          `json:"description" db:"description" validate:"required,min=10"`
	Price       float64         `json:"price" db:"price" validate:"required,gt=0"`
	Stock       int             `json:"stock" db:"stock" validate:"required,gte=0"`
	Category    ProductCategory `json:"category" db:"category" validate:"required,oneof=seeds fertilizer tools machinery other"`
	ImageURL    string          `json:"image_url,omitempty" db:"image_url"`
	IsActive    bool            `json:"is_active" db:"is_active"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

type CreateProductRequest struct {
	Name        string          `json:"name" validate:"required,min=3,max=255"`
	Description string          `json:"description" validate:"required,min=10"`
	Price       float64         `json:"price" validate:"required,gt=0"`
	Stock       int             `json:"stock" validate:"required,gte=0"`
	Category    ProductCategory `json:"category" validate:"required,oneof=seeds fertilizer tools machinery other"`
	ImageURL    string          `json:"image_url,omitempty"`
}

type UpdateProductRequest struct {
	Name        *string          `json:"name,omitempty" validate:"omitempty,min=3,max=255"`
	Description *string          `json:"description,omitempty" validate:"omitempty,min=10"`
	Price       *float64         `json:"price,omitempty" validate:"omitempty,gt=0"`
	Stock       *int             `json:"stock,omitempty" validate:"omitempty,gte=0"`
	Category    *ProductCategory `json:"category,omitempty" validate:"omitempty,oneof=seeds fertilizer tools machinery other"`
	ImageURL    *string          `json:"image_url,omitempty"`
	IsActive    *bool            `json:"is_active,omitempty"`
}
