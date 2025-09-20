package routes

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/repository"
	"github.com/Andrew-mugwe/agroai/services"
	"github.com/Andrew-mugwe/agroai/services/disputes"
	"github.com/Andrew-mugwe/agroai/services/escrow"
	"github.com/Andrew-mugwe/agroai/services/logger"
	"github.com/Andrew-mugwe/agroai/services/messaging"
	notifications "github.com/Andrew-mugwe/agroai/services/notifications"
	"github.com/Andrew-mugwe/agroai/services/orders"
	"github.com/Andrew-mugwe/agroai/services/payments"
	"github.com/Andrew-mugwe/agroai/services/payouts"
	"github.com/Andrew-mugwe/agroai/services/reputation"
	"github.com/Andrew-mugwe/agroai/services/sellers"
	"github.com/Andrew-mugwe/agroai/services/websocket"
)

func InitRoutes(router *mux.Router, db *sql.DB) {
	// Create services
	authService := services.NewAuthService(db)
	userService := services.NewUserService(db)
	dashboardService := services.NewDashboardService(db)
	traderService := services.NewTraderService(db)

	// Create cache service
	cacheService, err := services.NewCacheService()
	if err != nil {
		log.Printf("Warning: Cache service initialization failed: %v", err)
		cacheService = nil
	}

	// Create activity logger
	activityLogger := logger.NewActivityLogger(db)
	activityLoggerMiddleware := middleware.NewActivityLoggerMiddleware(activityLogger)

	// Create repositories
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	// Create seller service and handler
	sellerService := sellers.NewSellerService(db)
	sellerHandler := handlers.NewSellerHandler(sellerService)

	// Create admin monitoring handler
	adminMonitoringHandler := handlers.NewAdminMonitoringHandler(db)

	// Create handlers
	authHandler := handlers.NewAuthHandler(authService, activityLoggerMiddleware)
	userHandler := handlers.NewUserHandler(userService, authService, activityLoggerMiddleware)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService, cacheService)
	traderHandler := handlers.NewTraderHandler(traderService, cacheService)
	logsHandler := handlers.NewLogsHandler(activityLogger)
	adminLogsHandler := handlers.NewAdminLogsHandler(activityLogger)

	// Initialize payment providers
	paymentSvc := payments.NewPaymentService()
	payments.RegisterProvider("stripe", payments.NewStripeProvider())
	payments.RegisterProvider("mpesa", payments.NewMpesaProvider())
	payments.RegisterProvider("paypal", payments.NewPaypalProvider())

	// Create order service and handler
	orderService := orders.NewOrderService(orderRepo, productRepo)
	orderHandler := handlers.NewOrderHandler(orderService)

	// Auth routes
	router.HandleFunc("/api/auth/signup", authHandler.SignUp).Methods("POST")
	router.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST")

	// User routes
	router.HandleFunc("/api/user/role",
		middleware.AuthMiddleware(userHandler.UpdateRole)).Methods("POST")

	// Dashboard routes
	router.HandleFunc("/api/user/dashboard",
		middleware.AuthMiddleware(dashboardHandler.GetDashboard)).Methods("GET")

	// Role-specific dashboard routes
	router.HandleFunc("/api/farmer/dashboard",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware(models.RoleFarmer)(dashboardHandler.GetDashboard),
		)).Methods("GET")

	router.HandleFunc("/api/ngo/dashboard",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware(models.RoleNGO)(dashboardHandler.GetDashboard),
		)).Methods("GET")

	router.HandleFunc("/api/trader/dashboard",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware(models.RoleTrader)(dashboardHandler.GetDashboard),
		)).Methods("GET")

	// Trader routes
	router.HandleFunc("/api/trader/products",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleTrader)(traderHandler.GetProducts),
		)).Methods("GET")

	router.HandleFunc("/api/trader/orders",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleTrader)(traderHandler.GetOrders),
		)).Methods("GET")

	router.HandleFunc("/api/trader/analytics",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleTrader)(traderHandler.GetAnalytics),
		)).Methods("GET")

	// Logs routes
	router.HandleFunc("/api/logs", logsHandler.LogFrontendEvents).Methods("POST")

	// Admin routes
	router.HandleFunc("/api/admin/logs",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleAdmin)(adminLogsHandler.GetAdminLogs),
		)).Methods("GET")

	router.HandleFunc("/api/admin/logs/stats",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleAdmin)(adminLogsHandler.GetAdminLogStats),
		)).Methods("GET")

	router.HandleFunc("/api/admin/logs/cleanup",
		middleware.AuthMiddleware(
			middleware.RequireRole(models.RoleAdmin)(adminLogsHandler.CleanupOldLogs),
		)).Methods("POST")

	// Initialize notification routes
	InitNotificationRoutes(router, db)

	// Add notification handlers
	realtimeNotificationService := notifications.NewNotificationService()
	notificationHandler := handlers.NewNotificationHandler(realtimeNotificationService)

	// Notification routes with JWT authentication
	router.HandleFunc("/api/notifications",
		middleware.AuthMiddleware(notificationHandler.GetNotifications)).Methods("GET")

	// Health check routes (no authentication required)
	router.HandleFunc("/api/health", handlers.HealthCheck).Methods("GET")
	router.HandleFunc("/api/health/ready", handlers.ReadinessCheck).Methods("GET")
	router.HandleFunc("/api/health/live", handlers.LivenessCheck).Methods("GET")

	router.HandleFunc("/api/notifications/read/{id}",
		middleware.AuthMiddleware(notificationHandler.MarkNotificationRead)).Methods("POST")

	router.HandleFunc("/api/notifications/stats",
		middleware.AuthMiddleware(notificationHandler.GetNotificationStats)).Methods("GET")

	// Initialize messaging routes
	InitMessagingRoutes(router, db)

	// Initialize pest detection routes
	InitPestRoutes(router, db)

	// Initialize escrow and payout services
	payoutSvc := payouts.NewPayoutService()
	escrowService := escrow.NewEscrowService(db, paymentSvc, payoutSvc)
	escrowHandler := handlers.NewEscrowHandler(escrowService, payoutSvc)

	// Initialize dispute services
	disputeService := disputes.NewDisputeService(db, escrowService)
	disputeHandler := handlers.NewDisputeHandler(disputeService)

	// Initialize reputation services
	reputationService := reputation.NewReputationService(db)
	ratingHandler := handlers.NewRatingHandler(reputationService)

	// Initialize marketplace messaging services
	marketplaceMessagingService := messaging.NewMarketplaceMessagingService(db)
	marketplaceMessageHandler := handlers.NewMarketplaceMessageHandler(marketplaceMessagingService)
	wsService := websocket.NewMarketplaceWebSocketService()

	// Seller services already initialized above

	// Start WebSocket service in background
	go wsService.Run()

	// Payment routes
	router.HandleFunc("/api/payments/create", handlers.CreatePayment).Methods("POST")
	router.HandleFunc("/api/payments/refund", handlers.RefundPayment).Methods("POST")
	router.HandleFunc("/api/payments/verify/{transaction_id}", handlers.VerifyPayment).Methods("GET")
	router.HandleFunc("/api/payments/providers", handlers.GetPaymentProviders).Methods("GET")

	// Escrow routes
	router.HandleFunc("/api/escrow/create", escrowHandler.CreateEscrow).Methods("POST")
	router.HandleFunc("/api/escrow/get", escrowHandler.GetEscrow).Methods("GET")
	router.HandleFunc("/api/escrow/release", escrowHandler.ReleaseEscrow).Methods("POST")
	router.HandleFunc("/api/escrow/refund", escrowHandler.RefundEscrow).Methods("POST")
	router.HandleFunc("/api/escrow/summary", escrowHandler.GetEscrowSummary).Methods("GET")
	router.HandleFunc("/api/escrow/health", escrowHandler.HealthCheck).Methods("GET")

	// Payout routes
	router.HandleFunc("/api/payouts/process", escrowHandler.ProcessPayout).Methods("POST")
	router.HandleFunc("/api/payouts/capabilities", escrowHandler.GetPayoutCapabilities).Methods("GET")

	// Dispute routes
	router.HandleFunc("/api/disputes/open", disputeHandler.OpenDispute).Methods("POST")
	router.HandleFunc("/api/disputes/respond", disputeHandler.RespondToDispute).Methods("POST")
	router.HandleFunc("/api/disputes/escalate", disputeHandler.EscalateDispute).Methods("POST")
	router.HandleFunc("/api/disputes/resolve", disputeHandler.ResolveDispute).Methods("POST")
	router.HandleFunc("/api/disputes/get", disputeHandler.GetDispute).Methods("GET")
	router.HandleFunc("/api/disputes/user", disputeHandler.GetDisputesByUser).Methods("GET")
	router.HandleFunc("/api/disputes/summary", disputeHandler.GetDisputeSummary).Methods("GET")
	router.HandleFunc("/api/disputes/health", disputeHandler.HealthCheck).Methods("GET")

	// Reputation & Ratings routes
	router.HandleFunc("/api/ratings", ratingHandler.CreateRating).Methods("POST")
	router.HandleFunc("/api/sellers/{sellerId}/reputation", ratingHandler.GetSellerReputation).Methods("GET")
	router.HandleFunc("/api/reputation/history/{userId}", ratingHandler.GetReputationHistory).Methods("GET")
	router.HandleFunc("/api/admin/reputation/recalculate/{userId}", ratingHandler.RecalculateReputation).Methods("POST")
	router.HandleFunc("/api/admin/reputation/report", ratingHandler.GetReputationReport).Methods("GET")
	router.HandleFunc("/api/reputation/health", ratingHandler.HealthCheck).Methods("GET")

	// Marketplace Messaging routes
	router.HandleFunc("/api/marketplace/thread", middleware.AuthMiddleware(marketplaceMessageHandler.CreateThread)).Methods("POST")
	router.HandleFunc("/api/marketplace/thread/{threadRef}/message", middleware.AuthMiddleware(marketplaceMessageHandler.SendMessage)).Methods("POST")
	router.HandleFunc("/api/marketplace/thread/{threadRef}/messages", middleware.AuthMiddleware(marketplaceMessageHandler.GetThreadMessages)).Methods("GET")
	router.HandleFunc("/api/marketplace/threads", middleware.AuthMiddleware(marketplaceMessageHandler.GetUserThreads)).Methods("GET")
	router.HandleFunc("/api/marketplace/thread/{threadRef}", middleware.AuthMiddleware(marketplaceMessageHandler.GetThreadInfo)).Methods("GET")
	router.HandleFunc("/api/marketplace/thread/{threadRef}/escalate", middleware.AuthMiddleware(marketplaceMessageHandler.EscalateThread)).Methods("POST")
	router.HandleFunc("/api/marketplace/thread/{threadRef}/participants", middleware.AuthMiddleware(marketplaceMessageHandler.AddParticipant)).Methods("POST")
	router.HandleFunc("/api/marketplace/health", marketplaceMessageHandler.HealthCheck).Methods("GET")

	// WebSocket endpoint for real-time messaging
	router.HandleFunc("/ws/marketplace", wsService.HandleWebSocket).Methods("GET")

	// Enhanced Seller routes
	router.HandleFunc("/api/sellers/{id}", sellerHandler.GetSellerProfile).Methods("GET")
	router.HandleFunc("/api/sellers/{id}/reviews", sellerHandler.GetSellerReviews).Methods("GET")
	router.HandleFunc("/api/sellers/{id}/review", middleware.AuthMiddleware(sellerHandler.CreateReview)).Methods("POST")
	router.HandleFunc("/api/sellers/{id}", middleware.AuthMiddleware(sellerHandler.UpdateSellerProfile)).Methods("PATCH")

	// Admin Seller routes
	router.HandleFunc("/api/admin/sellers", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(adminMonitoringHandler.GetSellers))).Methods("GET")
	router.HandleFunc("/api/admin/sellers/{id}/verify", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(sellerHandler.VerifySeller))).Methods("PATCH")
	router.HandleFunc("/api/admin/sellers/{id}/recalculate-reputation", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(sellerHandler.RecalculateReputation))).Methods("POST")

	// Admin Monitoring routes
	router.HandleFunc("/api/admin/monitoring/overview", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(adminMonitoringHandler.GetMonitoringOverview))).Methods("GET")
	router.HandleFunc("/api/admin/monitoring/reputation-distribution", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(adminMonitoringHandler.GetReputationDistribution))).Methods("GET")
	router.HandleFunc("/api/admin/monitoring/disputes-over-time", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(adminMonitoringHandler.GetDisputesOverTime))).Methods("GET")
	router.HandleFunc("/api/admin/alerts", middleware.AuthMiddleware(middleware.RequireRole(models.RoleAdmin)(adminMonitoringHandler.CreateAlert))).Methods("POST")

	// Order routes
	router.HandleFunc("/api/orders", middleware.AuthMiddleware(orderHandler.CreateOrder)).Methods("POST")
	router.HandleFunc("/api/orders/{id}", middleware.AuthMiddleware(orderHandler.GetOrder)).Methods("GET")
	router.HandleFunc("/api/orders", middleware.AuthMiddleware(orderHandler.GetUserOrders)).Methods("GET")
	router.HandleFunc("/api/seller/orders", middleware.AuthMiddleware(orderHandler.GetSellerOrders)).Methods("GET")
	router.HandleFunc("/api/orders/{id}/status", middleware.AuthMiddleware(orderHandler.UpdateOrderStatus)).Methods("PUT")
	router.HandleFunc("/api/orders/{id}/payment", middleware.AuthMiddleware(orderHandler.ProcessPayment)).Methods("POST")
	router.HandleFunc("/api/orders/{id}/status", orderHandler.GetOrderStatus).Methods("GET")

	// Health check route
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")
}
