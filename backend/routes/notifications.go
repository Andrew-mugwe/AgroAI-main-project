package routes

import (
	"database/sql"

	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services/notifications"
)

// InitNotificationRoutes initializes notification routes
func InitNotificationRoutes(router *mux.Router, db *sql.DB) {
	// Create notification service
	realtimeNotificationService := notifications.NewNotificationService()

	// Create notification handler
	notificationHandler := handlers.NewNotificationHandler(realtimeNotificationService)

	// Notification routes
	router.HandleFunc("/api/notifications",
		middleware.AuthMiddleware(notificationHandler.GetNotifications)).Methods("GET")

	router.HandleFunc("/api/notifications/send",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleAdmin)(notificationHandler.SendNotification),
		)).Methods("POST")

	router.HandleFunc("/api/notifications/{id}/mark-read",
		middleware.AuthMiddleware(notificationHandler.MarkNotificationRead)).Methods("PATCH")

	router.HandleFunc("/api/notifications/mark-all-read",
		middleware.AuthMiddleware(notificationHandler.MarkAllNotificationsRead)).Methods("PATCH")

	router.HandleFunc("/api/notifications/{id}",
		middleware.AuthMiddleware(notificationHandler.DeleteNotification)).Methods("DELETE")

	router.HandleFunc("/api/notifications/stats",
		middleware.AuthMiddleware(notificationHandler.GetNotificationStats)).Methods("GET")
}
