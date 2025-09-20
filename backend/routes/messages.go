package routes

import (
	"database/sql"

	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services/messaging"
)

// InitMessagingRoutes initializes messaging routes
func InitMessagingRoutes(router *mux.Router, db *sql.DB) {
	// Create messaging service and handler
	messagingService := messaging.NewMessagingService(db)
	messageHandler := handlers.NewMessageHandler(messagingService)

	// Messaging routes with JWT authentication
	// POST /api/messages/:conversationId - send new message
	router.HandleFunc("/api/messages/{conversationId}",
		middleware.AuthMiddleware(messageHandler.SendMessage)).Methods("POST")

	// GET /api/messages/:conversationId - fetch thread
	router.HandleFunc("/api/messages/{conversationId}",
		middleware.AuthMiddleware(messageHandler.GetConversationMessages)).Methods("GET")

	// GET /api/messages/conversations - list user conversations
	router.HandleFunc("/api/messages/conversations",
		middleware.AuthMiddleware(messageHandler.GetUserConversations)).Methods("GET")

	// POST /api/messages/send - send message (legacy endpoint for backward compatibility)
	router.HandleFunc("/api/messages/send",
		middleware.AuthMiddleware(messageHandler.SendMessage)).Methods("POST")

	// POST /api/messages/conversations/create - create new conversation
	router.HandleFunc("/api/messages/conversations/create",
		middleware.AuthMiddleware(messageHandler.CreateConversation)).Methods("POST")
}
