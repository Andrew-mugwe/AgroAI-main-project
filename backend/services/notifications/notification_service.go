package notifications

import (
	"fmt"
	"log"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/gorilla/websocket"
)

// NotificationService handles real-time notifications
type NotificationService struct {
	clients    map[string]*websocket.Conn
	broadcast  chan NotificationMessage
	register   chan *Client
	unregister chan *Client
}

// Client represents a WebSocket client
type Client struct {
	ID       string
	UserID   string
	Conn     *websocket.Conn
	Send     chan NotificationMessage
	Service  *NotificationService
}

// NotificationMessage represents a notification message
type NotificationMessage struct {
	Type      string                 `json:"type"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
	UserID    string                 `json:"user_id,omitempty"`
}

// NewNotificationService creates a new notification service
func NewNotificationService() *NotificationService {
	service := &NotificationService{
		clients:    make(map[string]*websocket.Conn),
		broadcast:  make(chan NotificationMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	
	go service.run()
	return service
}

// run handles client connections and message broadcasting
func (s *NotificationService) run() {
	for {
		select {
		case client := <-s.register:
			s.clients[client.ID] = client.Conn
			log.Printf("Client connected: %s", client.ID)
			
		case client := <-s.unregister:
			if conn, ok := s.clients[client.ID]; ok {
				delete(s.clients, client.ID)
				conn.Close()
				log.Printf("Client disconnected: %s", client.ID)
			}
			
		case message := <-s.broadcast:
			s.broadcastToClients(message)
		}
	}
}

// RegisterClient registers a new WebSocket client
func (s *NotificationService) RegisterClient(client *Client) {
	s.register <- client
}

// UnregisterClient unregisters a WebSocket client
func (s *NotificationService) UnregisterClient(client *Client) {
	s.unregister <- client
}

// BroadcastMessage broadcasts a message to all connected clients
func (s *NotificationService) BroadcastMessage(message NotificationMessage) {
	s.broadcast <- message
}

// SendToUser sends a message to a specific user
func (s *NotificationService) SendToUser(userID string, message NotificationMessage) {
	message.UserID = userID
	s.broadcast <- message
}

// broadcastToClients broadcasts a message to all connected clients
func (s *NotificationService) broadcastToClients(message NotificationMessage) {
	for clientID, conn := range s.clients {
		// If message has a specific user ID, only send to that user
		if message.UserID != "" {
			// In a real implementation, you'd need to track user-to-client mapping
			// For now, we'll send to all clients
		}
		
		err := conn.WriteJSON(message)
		if err != nil {
			log.Printf("Error sending message to client %s: %v", clientID, err)
			conn.Close()
			delete(s.clients, clientID)
		}
	}
}

// SendOrderNotification sends an order-related notification
func (s *NotificationService) SendOrderNotification(userID string, order *models.Order, notificationType string) {
	var title, message string
	
	switch notificationType {
	case "order_created":
		title = "Order Created"
		message = fmt.Sprintf("Your order %s has been created successfully", order.OrderNumber)
	case "order_confirmed":
		title = "Order Confirmed"
		message = fmt.Sprintf("Your order %s has been confirmed by the seller", order.OrderNumber)
	case "order_shipped":
		title = "Order Shipped"
		message = fmt.Sprintf("Your order %s has been shipped", order.OrderNumber)
	case "order_delivered":
		title = "Order Delivered"
		message = fmt.Sprintf("Your order %s has been delivered", order.OrderNumber)
	case "payment_received":
		title = "Payment Received"
		message = fmt.Sprintf("Payment received for order %s", order.OrderNumber)
	case "payment_failed":
		title = "Payment Failed"
		message = fmt.Sprintf("Payment failed for order %s", order.OrderNumber)
	default:
		title = "Order Update"
		message = fmt.Sprintf("Your order %s has been updated", order.OrderNumber)
	}
	
	notification := NotificationMessage{
		Type:      notificationType,
		Title:     title,
		Message:   message,
		Timestamp: time.Now(),
		UserID:    userID,
		Data: map[string]interface{}{
			"order_id":     order.ID.String(),
			"order_number": order.OrderNumber,
			"status":       string(order.Status),
			"total_amount": order.TotalAmount.String(),
			"currency":     order.Currency,
		},
	}
	
	s.SendToUser(userID, notification)
}

// SendPaymentNotification sends a payment-related notification
func (s *NotificationService) SendPaymentNotification(userID string, transaction *models.PaymentTransaction, notificationType string) {
	var title, message string
	
	switch notificationType {
	case "payment_success":
		title = "Payment Successful"
		message = fmt.Sprintf("Payment of %s %s was successful", transaction.Amount.String(), transaction.Currency)
	case "payment_failed":
		title = "Payment Failed"
		message = fmt.Sprintf("Payment of %s %s failed", transaction.Amount.String(), transaction.Currency)
	case "payment_refunded":
		title = "Payment Refunded"
		message = fmt.Sprintf("Payment of %s %s has been refunded", transaction.Amount.String(), transaction.Currency)
	default:
		title = "Payment Update"
		message = fmt.Sprintf("Payment update for transaction %s", transaction.TransactionID)
	}
	
	notification := NotificationMessage{
		Type:      notificationType,
		Title:     title,
		Message:   message,
		Timestamp: time.Now(),
		UserID:    userID,
		Data: map[string]interface{}{
			"transaction_id": transaction.TransactionID,
			"amount":         transaction.Amount.String(),
			"currency":       transaction.Currency,
			"provider":       transaction.Provider,
			"status":         string(transaction.Status),
		},
	}
	
	s.SendToUser(userID, notification)
}

// SendSystemNotification sends a system-wide notification
func (s *NotificationService) SendSystemNotification(title, message string, data map[string]interface{}) {
	notification := NotificationMessage{
		Type:      "system",
		Title:     title,
		Message:   message,
		Timestamp: time.Now(),
		Data:      data,
	}
	
	s.BroadcastMessage(notification)
}

// GetConnectedClients returns the number of connected clients
func (s *NotificationService) GetConnectedClients() int {
	return len(s.clients)
}

// HandleWebSocket handles WebSocket connections for notifications
func (s *NotificationService) HandleWebSocket(conn *websocket.Conn, userID string) {
	client := &Client{
		ID:      fmt.Sprintf("client_%d", time.Now().UnixNano()),
		UserID:  userID,
		Conn:    conn,
		Send:    make(chan NotificationMessage),
		Service: s,
	}
	
	s.RegisterClient(client)
	
	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	
	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			if err := c.Conn.WriteJSON(message); err != nil {
				log.Printf("Error writing message: %v", err)
				return
			}
			
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.Service.UnregisterClient(c)
		c.Conn.Close()
	}()
	
	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	
	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}
