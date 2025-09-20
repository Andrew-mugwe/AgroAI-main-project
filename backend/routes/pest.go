package routes

import (
	"database/sql"

	"github.com/gorilla/mux"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services/pest"
)

// InitPestRoutes initializes pest detection routes
func InitPestRoutes(router *mux.Router, db *sql.DB) {
	// Create pest service and handler
	pestService := pest.NewPestService(db)
	pestHandler := handlers.NewPestHandler(pestService)

	// Pest detection routes with JWT authentication
	// POST /api/pests/report - upload image and create pest report
	router.HandleFunc("/api/pests/report",
		middleware.AuthMiddleware(pestHandler.CreatePestReport)).Methods("POST")

	// GET /api/pests/reports - get user's pest reports
	router.HandleFunc("/api/pests/reports",
		middleware.AuthMiddleware(pestHandler.GetUserPestReports)).Methods("GET")

	// GET /api/pests/analytics - get pest analytics
	router.HandleFunc("/api/pests/analytics",
		middleware.AuthMiddleware(pestHandler.GetPestAnalytics)).Methods("GET")

	// GET /api/pests/reports/all - get all pest reports (admin)
	router.HandleFunc("/api/pests/reports/all",
		middleware.AuthMiddleware(pestHandler.GetAllPestReports)).Methods("GET")

	// DELETE /api/pests/reports/:id - delete pest report
	router.HandleFunc("/api/pests/reports/{id}",
		middleware.AuthMiddleware(pestHandler.DeletePestReport)).Methods("DELETE")
}
