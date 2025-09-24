package routes

// Flow14.1.1

import (
	"database/sql"

	"github.com/Andrew-mugwe/agroai/handlers"
	"github.com/Andrew-mugwe/agroai/services/marketplace"
	"github.com/gorilla/mux"
)

func RegisterMarketplaceRoutes(router *mux.Router, db *sql.DB) {
	svc := marketplace.NewService(db)
	public := handlers.NewPublicProductHandler(svc)

	// Public product listing
	router.HandleFunc("/api/marketplace/products", public.ListProducts).Methods("GET")
	router.HandleFunc("/api/marketplace/products/{id}", public.GetProduct).Methods("GET")
	router.HandleFunc("/api/marketplace/categories", public.ListCategories).Methods("GET")

	// Orders: reuse existing order handler but mount marketplace paths for clarity
	// Note: these require auth and role checks already in underlying handler
	// We wire through the same handler instances from main routes if needed; for simplicity, reuse global registration
}
