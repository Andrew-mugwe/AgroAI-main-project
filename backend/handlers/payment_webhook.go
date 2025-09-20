package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/orders"
	"github.com/Andrew-mugwe/agroai/utils"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// PaymentWebhookHandler handles payment webhooks
type PaymentWebhookHandler struct {
	orderService *orders.OrderService
}

// NewPaymentWebhookHandler creates a new payment webhook handler
func NewPaymentWebhookHandler(orderService *orders.OrderService) *PaymentWebhookHandler {
	return &PaymentWebhookHandler{
		orderService: orderService,
	}
}

// StripeWebhook handles Stripe webhook events
func (h *PaymentWebhookHandler) StripeWebhook(w http.ResponseWriter, r *http.Request) {
	// Parse webhook payload
	var event map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid webhook payload")
		return
	}

	// Extract event type
	eventType, ok := event["type"].(string)
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event type")
		return
	}

	// Handle different event types
	switch eventType {
	case "payment_intent.succeeded":
		h.handleStripePaymentSuccess(w, r, event)
	case "payment_intent.payment_failed":
		h.handleStripePaymentFailure(w, r, event)
	case "charge.dispute.created":
		h.handleStripeDispute(w, r, event)
	default:
		utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "ignored"})
	}
}

// MpesaWebhook handles M-Pesa webhook events
func (h *PaymentWebhookHandler) MpesaWebhook(w http.ResponseWriter, r *http.Request) {
	// Parse webhook payload
	var event map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid webhook payload")
		return
	}

	// Extract transaction details
	transactionID, ok := event["TransactionID"].(string)
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid transaction ID")
		return
	}

	// Extract amount
	amount, ok := event["Amount"].(float64)
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid amount")
		return
	}

	// Extract result code
	resultCode, ok := event["ResultCode"].(float64)
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid result code")
		return
	}

	// Handle based on result code
	if resultCode == 0 {
		h.handleMpesaPaymentSuccess(w, r, transactionID, amount)
	} else {
		h.handleMpesaPaymentFailure(w, r, transactionID, resultCode)
	}
}

// handleStripePaymentSuccess handles successful Stripe payments
func (h *PaymentWebhookHandler) handleStripePaymentSuccess(w http.ResponseWriter, r *http.Request, event map[string]interface{}) {
	// Extract payment intent data
	data, ok := event["data"].(map[string]interface{})
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event data")
		return
	}

	paymentIntent, ok := data["object"].(map[string]interface{})
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid payment intent")
		return
	}

	// Extract transaction details
	transactionID, _ := paymentIntent["id"].(string)
	amount, _ := paymentIntent["amount"].(float64)
	currency, _ := paymentIntent["currency"].(string)
	metadata, _ := paymentIntent["metadata"].(map[string]interface{})

	// Convert amount from cents
	amountDecimal := decimal.NewFromFloat(amount / 100)

	// Extract order ID from metadata
	orderIDStr, ok := metadata["order_id"].(string)
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing order ID")
		return
	}

	// Parse order ID
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Update order payment status
	if err := h.orderService.UpdatePaymentStatus(r.Context(), orderID, models.PaymentStatusPaid, transactionID); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update payment status")
		return
	}

	// Add payment transaction record
	if err := h.orderService.AddPaymentTransaction(r.Context(), orderID, transactionID, "stripe", amountDecimal, currency, models.PaymentStatusPaid, metadata); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to add payment transaction")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "success"})
}

// handleStripePaymentFailure handles failed Stripe payments
func (h *PaymentWebhookHandler) handleStripePaymentFailure(w http.ResponseWriter, r *http.Request, event map[string]interface{}) {
	// Extract payment intent data
	data, ok := event["data"].(map[string]interface{})
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event data")
		return
	}

	paymentIntent, ok := data["object"].(map[string]interface{})
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid payment intent")
		return
	}

	// Extract transaction details
	transactionID, _ := paymentIntent["id"].(string)
	metadata, _ := paymentIntent["metadata"].(map[string]interface{})

	// Extract order ID from metadata
	orderIDStr, ok := metadata["order_id"].(string)
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing order ID")
		return
	}

	// Parse order ID
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Update order payment status
	if err := h.orderService.UpdatePaymentStatus(r.Context(), orderID, models.PaymentStatusFailed, transactionID); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update payment status")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "failure_handled"})
}

// handleStripeDispute handles Stripe disputes
func (h *PaymentWebhookHandler) handleStripeDispute(w http.ResponseWriter, r *http.Request, event map[string]interface{}) {
	// Extract dispute data
	data, ok := event["data"].(map[string]interface{})
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid event data")
		return
	}

	dispute, ok := data["object"].(map[string]interface{})
	if !ok {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid dispute")
		return
	}

	// Log dispute for manual review
	disputeID, _ := dispute["id"].(string)
	chargeID, _ := dispute["charge"].(string)
	reason, _ := dispute["reason"].(string)

	fmt.Printf("Stripe dispute created: %s, Charge: %s, Reason: %s\n", disputeID, chargeID, reason)

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "dispute_logged"})
}

// handleMpesaPaymentSuccess handles successful M-Pesa payments
func (h *PaymentWebhookHandler) handleMpesaPaymentSuccess(w http.ResponseWriter, r *http.Request, transactionID string, amount float64) {
	// For demo purposes, we'll need to extract order ID from transaction metadata
	// In production, this would come from the webhook payload

	// Convert amount
	amountDecimal := decimal.NewFromFloat(amount)

	// For demo, we'll use a mock order ID
	// In production, this would be extracted from the webhook payload

	// Parse order ID (for demo, create a valid UUID)
	orderID, err := uuid.Parse("00000000-0000-0000-0000-000000000000")
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Update order payment status
	if err := h.orderService.UpdatePaymentStatus(r.Context(), orderID, models.PaymentStatusPaid, transactionID); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update payment status")
		return
	}

	// Add payment transaction record
	metadata := map[string]interface{}{
		"provider":   "mpesa",
		"phone":      "254708374149",
		"mpesa_code": fmt.Sprintf("QAI%s", transactionID),
	}

	if err := h.orderService.AddPaymentTransaction(r.Context(), orderID, transactionID, "mpesa", amountDecimal, "KES", models.PaymentStatusPaid, metadata); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to add payment transaction")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "success"})
}

// handleMpesaPaymentFailure handles failed M-Pesa payments
func (h *PaymentWebhookHandler) handleMpesaPaymentFailure(w http.ResponseWriter, r *http.Request, transactionID string, resultCode float64) {
	// Log failure for manual review
	fmt.Printf("M-Pesa payment failed: %s, Result Code: %.0f\n", transactionID, resultCode)

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "failure_logged"})
}
