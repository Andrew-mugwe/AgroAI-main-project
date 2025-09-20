package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/orders"
	"github.com/Andrew-mugwe/agroai/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/shopspring/decimal"
)

// OrderHandler handles order-related HTTP requests
type OrderHandler struct {
	orderService *orders.OrderService
}

// NewOrderHandler creates a new order handler
func NewOrderHandler(orderService *orders.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// CreateOrder handles order creation
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Parse request
	var req models.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.Items == nil || len(req.Items) == 0 {
		utils.RespondWithValidationError(w, "Items are required")
		return
	}

	// Create order
	order, err := h.orderService.CreateOrder(r.Context(), userID, &req)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create order")
		return
	}

	// Return response
	response := models.OrderResponse{
		Success: true,
		Message: "Order created successfully",
		Data:    order,
	}

	utils.RespondWithJSON(w, http.StatusCreated, response)
}

// GetOrder handles getting a single order
func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get order ID from URL
	vars := mux.Vars(r)
	orderID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Get order
	order, err := h.orderService.GetOrder(r.Context(), orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Order not found")
		return
	}

	// Check if user owns the order
	if order.UserID != userID {
		utils.RespondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	// Return response
	response := models.OrderResponse{
		Success: true,
		Message: "Order retrieved successfully",
		Data:    order,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetUserOrders handles getting user's orders
func (h *OrderHandler) GetUserOrders(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Get orders
	orders, err := h.orderService.GetUserOrders(r.Context(), userID, page, limit)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get orders")
		return
	}

	// Return response
	response := models.OrdersListResponse{
		Success: true,
		Message: "Orders retrieved successfully",
		Data:    orders,
		Total:   len(orders),
		Page:    page,
		Limit:   limit,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetSellerOrders handles getting seller's orders
func (h *OrderHandler) GetSellerOrders(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Get orders (assuming userID is sellerID for simplicity)
	orders, err := h.orderService.GetSellerOrders(r.Context(), userID, page, limit)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get orders")
		return
	}

	// Return response
	response := models.OrdersListResponse{
		Success: true,
		Message: "Orders retrieved successfully",
		Data:    orders,
		Total:   len(orders),
		Page:    page,
		Limit:   limit,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// UpdateOrderStatus handles updating order status
func (h *OrderHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get order ID from URL
	vars := mux.Vars(r)
	orderID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Parse request
	var req models.UpdateOrderStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.Status == "" {
		utils.RespondWithValidationError(w, "Status is required")
		return
	}

	// Update order status
	err = h.orderService.UpdateOrderStatus(r.Context(), orderID, req.Status, req.Notes, &userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update order status")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success": true,
		"message": "Order status updated successfully",
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// ProcessPayment handles payment processing
func (h *OrderHandler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	_, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get order ID from URL
	vars := mux.Vars(r)
	orderID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Parse request
	var req struct {
		PaymentMethod string          `json:"payment_method" validate:"required"`
		Amount        decimal.Decimal `json:"amount" validate:"required"`
		Currency      string          `json:"currency" validate:"required"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if req.PaymentMethod == "" {
		utils.RespondWithValidationError(w, "Payment method is required")
		return
	}
	if req.Amount.IsZero() {
		utils.RespondWithValidationError(w, "Amount is required")
		return
	}
	if req.Currency == "" {
		utils.RespondWithValidationError(w, "Currency is required")
		return
	}

	// Process payment
	transaction, err := h.orderService.ProcessPayment(r.Context(), orderID, req.PaymentMethod, req.Amount, req.Currency)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to process payment")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success":        true,
		"message":        "Payment processed successfully",
		"transaction_id": transaction.TransactionID,
		"status":         transaction.Status,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetOrderStatus handles getting order status
func (h *OrderHandler) GetOrderStatus(w http.ResponseWriter, r *http.Request) {
	// Get order ID from URL
	vars := mux.Vars(r)
	orderID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Get order
	order, err := h.orderService.GetOrder(r.Context(), orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Order not found")
		return
	}

	// Return response
	response := map[string]interface{}{
		"success":        true,
		"order_number":   order.OrderNumber,
		"status":         order.Status,
		"payment_status": order.PaymentStatus,
		"total_amount":   order.TotalAmount,
		"currency":       order.Currency,
		"created_at":     order.CreatedAt,
		"updated_at":     order.UpdatedAt,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}
