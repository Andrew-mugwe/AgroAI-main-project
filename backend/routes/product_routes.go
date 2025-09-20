package routes

import (
	"github.com/Andrew-mugwe/agroai/handlers"

	"github.com/gorilla/mux"
)

func RegisterProductRoutes(router *mux.Router, productHandler *handlers.ProductHandler, authMiddleware mux.MiddlewareFunc) {
	// Protected routes - require trader role
	traderRouter := router.PathPrefix("/api/trader").Subrouter()
	traderRouter.Use(authMiddleware)

	// Product management endpoints
	traderRouter.HandleFunc("/products", productHandler.CreateProduct).Methods("POST")
	traderRouter.HandleFunc("/products", productHandler.GetTraderProducts).Methods("GET")
	traderRouter.HandleFunc("/products/{id}", productHandler.UpdateProduct).Methods("PUT")
	traderRouter.HandleFunc("/products/{id}", productHandler.DeleteProduct).Methods("DELETE")
}
