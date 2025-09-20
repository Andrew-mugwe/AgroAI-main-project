package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/Andrew-mugwe/agroai/services/messaging"
)

// MarketplaceWebSocketService handles WebSocket connections for marketplace messaging
type MarketplaceWebSocketService struct {
	clients    map[*Client]bool
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
	mutex      sync.RWMutex
}

// Client represents a WebSocket client
type Client struct {
	ID       uuid.UUID
	UserID   uuid.UUID
	Conn     *websocket.Conn
	Send     chan []byte
	Rooms    map[string]bool // Thread references this client is subscribed to
	LastPing time.Time
}

// Message represents a WebSocket message
type Message struct {
	Type      string                 `json:"type"`
	ThreadRef string                 `json:"thread_ref"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
}

// NewMarketplaceWebSocketService creates a new WebSocket service
func NewMarketplaceWebSocketService() *MarketplaceWebSocketService {
	return &MarketplaceWebSocketService{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message),
	}
}

// Run starts the WebSocket service
func (ws *MarketplaceWebSocketService) Run() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-ws.register:
			ws.registerClient(client)

		case client := <-ws.unregister:
			ws.unregisterClient(client)

		case message := <-ws.broadcast:
			ws.broadcastMessage(message)

		case <-ticker.C:
			ws.cleanupDeadConnections()
		}
	}
}

// registerClient registers a new client
func (ws *MarketplaceWebSocketService) registerClient(client *Client) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	ws.clients[client] = true
	log.Printf("Client %s connected", client.ID)
}

// unregisterClient unregisters a client
func (ws *MarketplaceWebSocketService) unregisterClient(client *Client) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	if _, ok := ws.clients[client]; ok {
		delete(ws.clients, client)
		close(client.Send)

		// Remove client from all rooms
		for threadRef := range client.Rooms {
			if room, exists := ws.rooms[threadRef]; exists {
				delete(room, client)
				if len(room) == 0 {
					delete(ws.rooms, threadRef)
				}
			}
		}

		log.Printf("Client %s disconnected", client.ID)
	}
}

// broadcastMessage broadcasts a message to all clients in a room
func (ws *MarketplaceWebSocketService) broadcastMessage(message *Message) {
	ws.mutex.RLock()
	defer ws.mutex.RUnlock()

	if room, exists := ws.rooms[message.ThreadRef]; exists {
		data, err := json.Marshal(message)
		if err != nil {
			log.Printf("Error marshaling message: %v", err)
			return
		}

		for client := range room {
			select {
			case client.Send <- data:
			default:
				close(client.Send)
				delete(ws.clients, client)
				delete(room, client)
			}
		}
	}
}

// cleanupDeadConnections removes dead connections
func (ws *MarketplaceWebSocketService) cleanupDeadConnections() {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	now := time.Now()
	for client := range ws.clients {
		if now.Sub(client.LastPing) > 60*time.Second {
			delete(ws.clients, client)
			close(client.Send)

			// Remove from rooms
			for threadRef := range client.Rooms {
				if room, exists := ws.rooms[threadRef]; exists {
					delete(room, client)
					if len(room) == 0 {
						delete(ws.rooms, threadRef)
					}
				}
			}
		}
	}
}

// subscribeToThread subscribes a client to a thread
func (ws *MarketplaceWebSocketService) subscribeToThread(client *Client, threadRef string) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	client.Rooms[threadRef] = true

	if ws.rooms[threadRef] == nil {
		ws.rooms[threadRef] = make(map[*Client]bool)
	}
	ws.rooms[threadRef][client] = true

	log.Printf("Client %s subscribed to thread %s", client.ID, threadRef)
}

// unsubscribeFromThread unsubscribes a client from a thread
func (ws *MarketplaceWebSocketService) unsubscribeFromThread(client *Client, threadRef string) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	delete(client.Rooms, threadRef)

	if room, exists := ws.rooms[threadRef]; exists {
		delete(room, client)
		if len(room) == 0 {
			delete(ws.rooms, threadRef)
		}
	}

	log.Printf("Client %s unsubscribed from thread %s", client.ID, threadRef)
}

// BroadcastNewMessage broadcasts a new message to thread participants
func (ws *MarketplaceWebSocketService) BroadcastNewMessage(threadRef string, message *messaging.MarketplaceMessage) {
	wsMessage := &Message{
		Type:      "new_message",
		ThreadRef: threadRef,
		Data: map[string]interface{}{
			"id":           message.ID,
			"sender_id":    message.SenderID,
			"sender_name":  message.SenderName,
			"body":         message.Body,
			"attachments":  message.Attachments,
			"message_type": message.MessageType,
			"created_at":   message.CreatedAt,
		},
		Timestamp: time.Now(),
	}

	select {
	case ws.broadcast <- wsMessage:
	default:
		log.Printf("Failed to broadcast message to thread %s", threadRef)
	}
}

// BroadcastThreadUpdate broadcasts thread status updates
func (ws *MarketplaceWebSocketService) BroadcastThreadUpdate(threadRef string, updateType string, data map[string]interface{}) {
	wsMessage := &Message{
		Type:      updateType,
		ThreadRef: threadRef,
		Data:      data,
		Timestamp: time.Now(),
	}

	select {
	case ws.broadcast <- wsMessage:
	default:
		log.Printf("Failed to broadcast update to thread %s", threadRef)
	}
}

// HandleWebSocket handles WebSocket connections
func (ws *MarketplaceWebSocketService) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Upgrade connection to WebSocket
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			// In production, you should implement proper origin checking
			return true
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// Extract user ID from query parameters or headers
	// In production, you should validate JWT token
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		conn.Close()
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		conn.Close()
		return
	}

	// Create client
	client := &Client{
		ID:       uuid.New(),
		UserID:   userID,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		Rooms:    make(map[string]bool),
		LastPing: time.Now(),
	}

	// Register client
	ws.register <- client

	// Start goroutines for reading and writing
	go ws.writePump(client)
	go ws.readPump(client)
}

// readPump pumps messages from the WebSocket connection to the hub
func (ws *MarketplaceWebSocketService) readPump(client *Client) {
	defer func() {
		ws.unregister <- client
		client.Conn.Close()
	}()

	client.Conn.SetReadLimit(512)
	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		client.LastPing = time.Now()
		return nil
	})

	for {
		var message map[string]interface{}
		err := client.Conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		ws.handleMessage(client, message)
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (ws *MarketplaceWebSocketService) writePump(client *Client) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message
			n := len(client.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-client.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage handles incoming WebSocket messages
func (ws *MarketplaceWebSocketService) handleMessage(client *Client, message map[string]interface{}) {
	messageType, ok := message["type"].(string)
	if !ok {
		return
	}

	switch messageType {
	case "subscribe":
		threadRef, ok := message["thread_ref"].(string)
		if ok {
			ws.subscribeToThread(client, threadRef)
		}

	case "unsubscribe":
		threadRef, ok := message["thread_ref"].(string)
		if ok {
			ws.unsubscribeFromThread(client, threadRef)
		}

	case "ping":
		client.LastPing = time.Now()

	default:
		log.Printf("Unknown message type: %s", messageType)
	}
}

// GetConnectedClients returns the number of connected clients
func (ws *MarketplaceWebSocketService) GetConnectedClients() int {
	ws.mutex.RLock()
	defer ws.mutex.RUnlock()
	return len(ws.clients)
}

// GetThreadSubscribers returns the number of subscribers for a thread
func (ws *MarketplaceWebSocketService) GetThreadSubscribers(threadRef string) int {
	ws.mutex.RLock()
	defer ws.mutex.RUnlock()

	if room, exists := ws.rooms[threadRef]; exists {
		return len(room)
	}
	return 0
}
