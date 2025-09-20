package orders

import (
	"context"
	"fmt"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/repository"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// OrderService handles order business logic
type OrderService struct {
	orderRepo   *repository.OrderRepository
	productRepo repository.ProductRepository
}

// NewOrderService creates a new order service
func NewOrderService(orderRepo *repository.OrderRepository, productRepo repository.ProductRepository) *OrderService {
	return &OrderService{
		orderRepo:   orderRepo,
		productRepo: productRepo,
	}
}

// CreateOrder creates a new order from cart items
func (s *OrderService) CreateOrder(ctx context.Context, userID uuid.UUID, req *models.CreateOrderRequest) (*models.Order, error) {
	// Validate request
	if len(req.Items) == 0 {
		return nil, fmt.Errorf("order must contain at least one item")
	}

	// Get first product to determine seller (assuming all items are from same seller for simplicity)
	productID, err := uuid.Parse(req.Items[0].ProductID)
	if err != nil {
		return nil, fmt.Errorf("invalid product ID: %w", err)
	}

	firstProduct, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}

	// Create order
	order := &models.Order{
		UserID:          userID,
		SellerID:        firstProduct.TraderID, // Use TraderID as SellerID
		Status:          models.OrderStatusPending,
		Currency:        "KES",
		PaymentStatus:   models.PaymentStatusPending,
		PaymentMethod:   req.PaymentMethod,
		ShippingAddress: req.ShippingAddress,
		BillingAddress:  req.BillingAddress,
		Notes:           req.Notes,
	}

	// Calculate totals
	var subtotal decimal.Decimal
	var items []models.OrderItem

	for _, itemReq := range req.Items {
		// Get product details
		productID, err := uuid.Parse(itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("invalid product ID %s: %w", itemReq.ProductID, err)
		}

		product, err := s.productRepo.GetByID(ctx, productID)
		if err != nil {
			return nil, fmt.Errorf("failed to get product %s: %w", itemReq.ProductID, err)
		}

		// Check stock availability
		if product.Stock < itemReq.Quantity {
			return nil, fmt.Errorf("insufficient stock for product %s", product.Name)
		}

		// Calculate item total
		unitPrice := decimal.NewFromFloat(product.Price)
		itemTotal := unitPrice.Mul(decimal.NewFromInt(int64(itemReq.Quantity)))

		// Create order item
		orderItem := models.OrderItem{
			ProductID:   product.ID.String(),
			ProductName: product.Name,
			ProductSKU:  fmt.Sprintf("SKU-%s", product.ID.String()[:8]), // Generate SKU from ID
			Quantity:    itemReq.Quantity,
			UnitPrice:   unitPrice,
			TotalPrice:  itemTotal,
		}

		items = append(items, orderItem)
		subtotal = subtotal.Add(itemTotal)
	}

	// Calculate tax (8% for demo)
	taxRate := decimal.NewFromFloat(0.08)
	taxAmount := subtotal.Mul(taxRate)

	// Calculate shipping (fixed amount for demo)
	shippingAmount := decimal.NewFromFloat(15.00)

	// Calculate total
	totalAmount := subtotal.Add(taxAmount).Add(shippingAmount)

	// Set calculated amounts
	order.Subtotal = subtotal
	order.TaxAmount = taxAmount
	order.ShippingAmount = shippingAmount
	order.TotalAmount = totalAmount

	// Create order in database
	if err := s.orderRepo.CreateOrder(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Add order items
	for i := range items {
		items[i].OrderID = order.ID
		if err := s.orderRepo.AddOrderItem(ctx, &items[i]); err != nil {
			return nil, fmt.Errorf("failed to add order item: %w", err)
		}
	}

	order.Items = items

	// Add initial status history
	if err := s.orderRepo.UpdateOrderStatus(ctx, order.ID, models.OrderStatusPending, "Order created", &userID); err != nil {
		return nil, fmt.Errorf("failed to add status history: %w", err)
	}

	return order, nil
}

// GetOrder retrieves an order by ID
func (s *OrderService) GetOrder(ctx context.Context, orderID uuid.UUID) (*models.Order, error) {
	return s.orderRepo.GetOrderByID(ctx, orderID)
}

// GetUserOrders retrieves orders for a specific user
func (s *OrderService) GetUserOrders(ctx context.Context, userID uuid.UUID, page, limit int) ([]models.Order, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetOrdersByUserID(ctx, userID, limit, offset)
}

// GetSellerOrders retrieves orders for a specific seller
func (s *OrderService) GetSellerOrders(ctx context.Context, sellerID uuid.UUID, page, limit int) ([]models.Order, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetOrdersBySellerID(ctx, sellerID, limit, offset)
}

// UpdateOrderStatus updates the status of an order
func (s *OrderService) UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, status models.OrderStatus, notes string, updatedBy *uuid.UUID) error {
	// Validate status transition
	if err := s.validateStatusTransition(orderID, status); err != nil {
		return err
	}

	return s.orderRepo.UpdateOrderStatus(ctx, orderID, status, notes, updatedBy)
}

// UpdatePaymentStatus updates the payment status of an order
func (s *OrderService) UpdatePaymentStatus(ctx context.Context, orderID uuid.UUID, paymentStatus models.PaymentStatus, transactionID string) error {
	return s.orderRepo.UpdatePaymentStatus(ctx, orderID, paymentStatus, transactionID)
}

// AddPaymentTransaction adds a payment transaction record
func (s *OrderService) AddPaymentTransaction(ctx context.Context, orderID uuid.UUID, transactionID, provider string, amount decimal.Decimal, currency string, status models.PaymentStatus, metadata map[string]interface{}) error {
	transaction := &models.PaymentTransaction{
		OrderID:       orderID,
		TransactionID: transactionID,
		Provider:      provider,
		Amount:        amount,
		Currency:      currency,
		Status:        status,
		Metadata:      metadata,
	}

	return s.orderRepo.AddPaymentTransaction(ctx, transaction)
}

// ProcessPayment processes a payment for an order
func (s *OrderService) ProcessPayment(ctx context.Context, orderID uuid.UUID, paymentMethod string, amount decimal.Decimal, currency string) (*models.PaymentTransaction, error) {
	// Get order
	order, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	// Validate payment amount
	if !amount.Equal(order.TotalAmount) {
		return nil, fmt.Errorf("payment amount does not match order total")
	}

	// Generate transaction ID
	transactionID := fmt.Sprintf("TXN_%s_%d", order.OrderNumber, time.Now().Unix())

	// Create payment transaction
	transaction := &models.PaymentTransaction{
		OrderID:       orderID,
		TransactionID: transactionID,
		Provider:      paymentMethod,
		Amount:        amount,
		Currency:      currency,
		Status:        models.PaymentStatusPending,
		Metadata: map[string]interface{}{
			"order_number": order.OrderNumber,
			"user_id":      order.UserID.String(),
			"created_at":   time.Now().Format(time.RFC3339),
		},
	}

	// Add transaction to database
	if err := s.orderRepo.AddPaymentTransaction(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to add payment transaction: %w", err)
	}

	// Update order payment status
	if err := s.orderRepo.UpdatePaymentStatus(ctx, orderID, models.PaymentStatusPending, transactionID); err != nil {
		return nil, fmt.Errorf("failed to update payment status: %w", err)
	}

	return transaction, nil
}

// validateStatusTransition validates if a status transition is allowed
func (s *OrderService) validateStatusTransition(orderID uuid.UUID, newStatus models.OrderStatus) error {
	// Get current order status
	order, err := s.orderRepo.GetOrderByID(context.Background(), orderID)
	if err != nil {
		return fmt.Errorf("failed to get order: %w", err)
	}

	// Define allowed transitions
	allowedTransitions := map[models.OrderStatus][]models.OrderStatus{
		models.OrderStatusPending:    {models.OrderStatusConfirmed, models.OrderStatusCancelled},
		models.OrderStatusConfirmed:  {models.OrderStatusProcessing, models.OrderStatusCancelled},
		models.OrderStatusProcessing: {models.OrderStatusShipped, models.OrderStatusCancelled},
		models.OrderStatusShipped:    {models.OrderStatusDelivered, models.OrderStatusCancelled},
		models.OrderStatusDelivered:  {models.OrderStatusRefunded},
		models.OrderStatusCancelled:  {}, // No transitions from cancelled
		models.OrderStatusRefunded:   {}, // No transitions from refunded
	}

	allowed, exists := allowedTransitions[order.Status]
	if !exists {
		return fmt.Errorf("invalid current status: %s", order.Status)
	}

	for _, allowedStatus := range allowed {
		if newStatus == allowedStatus {
			return nil
		}
	}

	return fmt.Errorf("invalid status transition from %s to %s", order.Status, newStatus)
}
