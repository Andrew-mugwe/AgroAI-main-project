package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/google/uuid"
)

// OrderRepository handles order data operations
type OrderRepository struct {
	db *sql.DB
}

// NewOrderRepository creates a new order repository
func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// CreateOrder creates a new order
func (r *OrderRepository) CreateOrder(ctx context.Context, order *models.Order) error {
	query := `
		INSERT INTO orders (
			user_id, seller_id, status, subtotal, tax_amount, shipping_amount, 
			total_amount, currency, payment_status, payment_method, 
			shipping_address, billing_address, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, order_number, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		order.UserID, order.SellerID, order.Status, order.Subtotal, order.TaxAmount,
		order.ShippingAmount, order.TotalAmount, order.Currency, order.PaymentStatus,
		order.PaymentMethod, order.ShippingAddress, order.BillingAddress, order.Notes,
	).Scan(&order.ID, &order.OrderNumber, &order.CreatedAt, &order.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}

	return nil
}

// GetOrderByID retrieves an order by ID
func (r *OrderRepository) GetOrderByID(ctx context.Context, orderID uuid.UUID) (*models.Order, error) {
	query := `
		SELECT id, order_number, user_id, seller_id, status, subtotal, tax_amount, 
		       shipping_amount, total_amount, currency, payment_status, payment_method,
		       payment_transaction_id, shipping_address, billing_address, notes,
		       created_at, updated_at, shipped_at, delivered_at
		FROM orders 
		WHERE id = $1`

	order := &models.Order{}
	err := r.db.QueryRowContext(ctx, query, orderID).Scan(
		&order.ID, &order.OrderNumber, &order.UserID, &order.SellerID, &order.Status,
		&order.Subtotal, &order.TaxAmount, &order.ShippingAmount, &order.TotalAmount,
		&order.Currency, &order.PaymentStatus, &order.PaymentMethod, &order.PaymentTransactionID,
		&order.ShippingAddress, &order.BillingAddress, &order.Notes,
		&order.CreatedAt, &order.UpdatedAt, &order.ShippedAt, &order.DeliveredAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("order not found")
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	// Load related data
	if err := r.loadOrderItems(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to load order items: %w", err)
	}

	if err := r.loadOrderStatusHistory(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to load order status history: %w", err)
	}

	if err := r.loadPaymentTransactions(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to load payment transactions: %w", err)
	}

	return order, nil
}

// GetOrdersByUserID retrieves orders for a specific user
func (r *OrderRepository) GetOrdersByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Order, error) {
	query := `
		SELECT id, order_number, user_id, seller_id, status, subtotal, tax_amount, 
		       shipping_amount, total_amount, currency, payment_status, payment_method,
		       payment_transaction_id, shipping_address, billing_address, notes,
		       created_at, updated_at, shipped_at, delivered_at
		FROM orders 
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		order := models.Order{}
		err := rows.Scan(
			&order.ID, &order.OrderNumber, &order.UserID, &order.SellerID, &order.Status,
			&order.Subtotal, &order.TaxAmount, &order.ShippingAmount, &order.TotalAmount,
			&order.Currency, &order.PaymentStatus, &order.PaymentMethod, &order.PaymentTransactionID,
			&order.ShippingAddress, &order.BillingAddress, &order.Notes,
			&order.CreatedAt, &order.UpdatedAt, &order.ShippedAt, &order.DeliveredAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	return orders, nil
}

// GetOrdersBySellerID retrieves orders for a specific seller
func (r *OrderRepository) GetOrdersBySellerID(ctx context.Context, sellerID uuid.UUID, limit, offset int) ([]models.Order, error) {
	query := `
		SELECT id, order_number, user_id, seller_id, status, subtotal, tax_amount, 
		       shipping_amount, total_amount, currency, payment_status, payment_method,
		       payment_transaction_id, shipping_address, billing_address, notes,
		       created_at, updated_at, shipped_at, delivered_at
		FROM orders 
		WHERE seller_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, sellerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		order := models.Order{}
		err := rows.Scan(
			&order.ID, &order.OrderNumber, &order.UserID, &order.SellerID, &order.Status,
			&order.Subtotal, &order.TaxAmount, &order.ShippingAmount, &order.TotalAmount,
			&order.Currency, &order.PaymentStatus, &order.PaymentMethod, &order.PaymentTransactionID,
			&order.ShippingAddress, &order.BillingAddress, &order.Notes,
			&order.CreatedAt, &order.UpdatedAt, &order.ShippedAt, &order.DeliveredAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	return orders, nil
}

// UpdateOrderStatus updates the status of an order
func (r *OrderRepository) UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, status models.OrderStatus, notes string, updatedBy *uuid.UUID) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update order status
	updateQuery := `
		UPDATE orders 
		SET status = $1, updated_at = NOW()
		WHERE id = $2`

	_, err = tx.ExecContext(ctx, updateQuery, status, orderID)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	// Add status history entry
	historyQuery := `
		INSERT INTO order_status_history (order_id, status, notes, created_by)
		VALUES ($1, $2, $3, $4)`

	_, err = tx.ExecContext(ctx, historyQuery, orderID, status, notes, updatedBy)
	if err != nil {
		return fmt.Errorf("failed to add status history: %w", err)
	}

	// Update specific timestamps based on status
	if status == models.OrderStatusShipped {
		_, err = tx.ExecContext(ctx, "UPDATE orders SET shipped_at = NOW() WHERE id = $1", orderID)
		if err != nil {
			return fmt.Errorf("failed to update shipped_at: %w", err)
		}
	} else if status == models.OrderStatusDelivered {
		_, err = tx.ExecContext(ctx, "UPDATE orders SET delivered_at = NOW() WHERE id = $1", orderID)
		if err != nil {
			return fmt.Errorf("failed to update delivered_at: %w", err)
		}
	}

	return tx.Commit()
}

// UpdatePaymentStatus updates the payment status of an order
func (r *OrderRepository) UpdatePaymentStatus(ctx context.Context, orderID uuid.UUID, paymentStatus models.PaymentStatus, transactionID string) error {
	query := `
		UPDATE orders 
		SET payment_status = $1, payment_transaction_id = $2, updated_at = NOW()
		WHERE id = $3`

	_, err := r.db.ExecContext(ctx, query, paymentStatus, transactionID, orderID)
	if err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	return nil
}

// AddOrderItem adds an item to an order
func (r *OrderRepository) AddOrderItem(ctx context.Context, item *models.OrderItem) error {
	query := `
		INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at`

	err := r.db.QueryRowContext(ctx, query,
		item.OrderID, item.ProductID, item.ProductName, item.ProductSKU,
		item.Quantity, item.UnitPrice, item.TotalPrice,
	).Scan(&item.ID, &item.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to add order item: %w", err)
	}

	return nil
}

// AddPaymentTransaction adds a payment transaction record
func (r *OrderRepository) AddPaymentTransaction(ctx context.Context, transaction *models.PaymentTransaction) error {
	query := `
		INSERT INTO payment_transactions (order_id, transaction_id, provider, amount, currency, status, provider_response, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		transaction.OrderID, transaction.TransactionID, transaction.Provider,
		transaction.Amount, transaction.Currency, transaction.Status,
		transaction.ProviderResponse, transaction.Metadata,
	).Scan(&transaction.ID, &transaction.CreatedAt, &transaction.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to add payment transaction: %w", err)
	}

	return nil
}

// loadOrderItems loads order items for an order
func (r *OrderRepository) loadOrderItems(ctx context.Context, order *models.Order) error {
	query := `
		SELECT id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, created_at
		FROM order_items 
		WHERE order_id = $1
		ORDER BY created_at`

	rows, err := r.db.QueryContext(ctx, query, order.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		item := models.OrderItem{}
		err := rows.Scan(
			&item.ID, &item.OrderID, &item.ProductID, &item.ProductName,
			&item.ProductSKU, &item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.CreatedAt,
		)
		if err != nil {
			return err
		}
		items = append(items, item)
	}

	order.Items = items
	return nil
}

// loadOrderStatusHistory loads status history for an order
func (r *OrderRepository) loadOrderStatusHistory(ctx context.Context, order *models.Order) error {
	query := `
		SELECT id, order_id, status, notes, created_at, created_by
		FROM order_status_history 
		WHERE order_id = $1
		ORDER BY created_at`

	rows, err := r.db.QueryContext(ctx, query, order.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var history []models.OrderStatusHistory
	for rows.Next() {
		entry := models.OrderStatusHistory{}
		err := rows.Scan(
			&entry.ID, &entry.OrderID, &entry.Status, &entry.Notes, &entry.CreatedAt, &entry.CreatedBy,
		)
		if err != nil {
			return err
		}
		history = append(history, entry)
	}

	order.StatusHistory = history
	return nil
}

// loadPaymentTransactions loads payment transactions for an order
func (r *OrderRepository) loadPaymentTransactions(ctx context.Context, order *models.Order) error {
	query := `
		SELECT id, order_id, transaction_id, provider, amount, currency, status, provider_response, metadata, created_at, updated_at
		FROM payment_transactions 
		WHERE order_id = $1
		ORDER BY created_at`

	rows, err := r.db.QueryContext(ctx, query, order.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var transactions []models.PaymentTransaction
	for rows.Next() {
		transaction := models.PaymentTransaction{}
		err := rows.Scan(
			&transaction.ID, &transaction.OrderID, &transaction.TransactionID, &transaction.Provider,
			&transaction.Amount, &transaction.Currency, &transaction.Status,
			&transaction.ProviderResponse, &transaction.Metadata, &transaction.CreatedAt, &transaction.UpdatedAt,
		)
		if err != nil {
			return err
		}
		transactions = append(transactions, transaction)
	}

	order.PaymentTransactions = transactions
	return nil
}
