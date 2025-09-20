package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
	OrderStatusRefunded   OrderStatus = "refunded"
)

// PaymentStatus represents the payment status of an order
type PaymentStatus string

const (
	PaymentStatusPending           PaymentStatus = "pending"
	PaymentStatusPaid              PaymentStatus = "paid"
	PaymentStatusFailed            PaymentStatus = "failed"
	PaymentStatusRefunded          PaymentStatus = "refunded"
	PaymentStatusPartiallyRefunded PaymentStatus = "partially_refunded"
)

// Address represents a shipping or billing address
type Address struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Company     string `json:"company,omitempty"`
	Address1    string `json:"address1"`
	Address2    string `json:"address2,omitempty"`
	City        string `json:"city"`
	State       string `json:"state"`
	PostalCode  string `json:"postal_code"`
	Country     string `json:"country"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
}

// Value implements the driver.Valuer interface for database storage
func (a Address) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Scan implements the sql.Scanner interface for database retrieval
func (a *Address) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	
	return json.Unmarshal(bytes, a)
}

// Order represents a marketplace order
type Order struct {
	ID                    uuid.UUID     `json:"id" db:"id"`
	OrderNumber           string        `json:"order_number" db:"order_number"`
	UserID                uuid.UUID     `json:"user_id" db:"user_id"`
	SellerID              uuid.UUID     `json:"seller_id" db:"seller_id"`
	Status                OrderStatus   `json:"status" db:"status"`
	Subtotal              decimal.Decimal `json:"subtotal" db:"subtotal"`
	TaxAmount             decimal.Decimal `json:"tax_amount" db:"tax_amount"`
	ShippingAmount        decimal.Decimal `json:"shipping_amount" db:"shipping_amount"`
	TotalAmount           decimal.Decimal `json:"total_amount" db:"total_amount"`
	Currency              string        `json:"currency" db:"currency"`
	PaymentStatus         PaymentStatus `json:"payment_status" db:"payment_status"`
	PaymentMethod         string        `json:"payment_method" db:"payment_method"`
	PaymentTransactionID  string        `json:"payment_transaction_id" db:"payment_transaction_id"`
	ShippingAddress       Address       `json:"shipping_address" db:"shipping_address"`
	BillingAddress        Address       `json:"billing_address" db:"billing_address"`
	Notes                 string        `json:"notes" db:"notes"`
	CreatedAt             time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time     `json:"updated_at" db:"updated_at"`
	ShippedAt             *time.Time    `json:"shipped_at" db:"shipped_at"`
	DeliveredAt           *time.Time    `json:"delivered_at" db:"delivered_at"`
	
	// Related data
	Items                 []OrderItem   `json:"items,omitempty"`
	StatusHistory         []OrderStatusHistory `json:"status_history,omitempty"`
	PaymentTransactions   []PaymentTransaction `json:"payment_transactions,omitempty"`
}

// OrderItem represents an item within an order
type OrderItem struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	OrderID     uuid.UUID       `json:"order_id" db:"order_id"`
	ProductID   string          `json:"product_id" db:"product_id"`
	ProductName string          `json:"product_name" db:"product_name"`
	ProductSKU  string          `json:"product_sku" db:"product_sku"`
	Quantity    int             `json:"quantity" db:"quantity"`
	UnitPrice   decimal.Decimal `json:"unit_price" db:"unit_price"`
	TotalPrice  decimal.Decimal `json:"total_price" db:"total_price"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
}

// OrderStatusHistory represents the history of status changes for an order
type OrderStatusHistory struct {
	ID        uuid.UUID   `json:"id" db:"id"`
	OrderID   uuid.UUID   `json:"order_id" db:"order_id"`
	Status    OrderStatus `json:"status" db:"status"`
	Notes     string      `json:"notes" db:"notes"`
	CreatedAt time.Time   `json:"created_at" db:"created_at"`
	CreatedBy *uuid.UUID  `json:"created_by" db:"created_by"`
}

// PaymentTransaction represents a payment transaction
type PaymentTransaction struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	OrderID          uuid.UUID       `json:"order_id" db:"order_id"`
	TransactionID    string          `json:"transaction_id" db:"transaction_id"`
	Provider         string          `json:"provider" db:"provider"`
	Amount           decimal.Decimal `json:"amount" db:"amount"`
	Currency         string          `json:"currency" db:"currency"`
	Status           PaymentStatus   `json:"status" db:"status"`
	ProviderResponse map[string]interface{} `json:"provider_response" db:"provider_response"`
	Metadata         map[string]interface{} `json:"metadata" db:"metadata"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at" db:"updated_at"`
}

// CreateOrderRequest represents the request to create an order
type CreateOrderRequest struct {
	Items           []CreateOrderItemRequest `json:"items" validate:"required,min=1"`
	ShippingAddress Address                  `json:"shipping_address" validate:"required"`
	BillingAddress  Address                  `json:"billing_address" validate:"required"`
	PaymentMethod   string                   `json:"payment_method" validate:"required"`
	Notes           string                   `json:"notes"`
}

// CreateOrderItemRequest represents an item in the create order request
type CreateOrderItemRequest struct {
	ProductID string `json:"product_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}

// UpdateOrderStatusRequest represents the request to update order status
type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" validate:"required"`
	Notes  string      `json:"notes"`
}

// OrderResponse represents the response for order operations
type OrderResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    *Order `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

// OrdersListResponse represents the response for listing orders
type OrdersListResponse struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Data    []Order `json:"data"`
	Total   int     `json:"total"`
	Page    int     `json:"page"`
	Limit   int     `json:"limit"`
	Error   string  `json:"error,omitempty"`
}
