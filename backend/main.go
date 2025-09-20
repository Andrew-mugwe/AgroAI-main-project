package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"github.com/Andrew-mugwe/agroai/config"
	"github.com/Andrew-mugwe/agroai/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize database connection
	db, err := config.InitDB()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	// Create router
	router := mux.NewRouter()

	// Initialize routes
	// Note: This is a temporary solution - services should be updated to use pgxpool directly
	sqlDB := &sql.DB{} // Placeholder - this needs proper pgxpool to sql.DB adapter
	routes.InitRoutes(router, sqlDB)

	// Configure CORS
	allowedOrigins := []string{
		"http://localhost:3000",  // Vite dev server
		"http://localhost:3001",  // Alternative dev port
		"http://127.0.0.1:3000",  // Alternative localhost
		"http://127.0.0.1:3001",  // Alternative localhost
	}

	// Add production origins from environment
	if prodOrigins := os.Getenv("CORS_ORIGINS"); prodOrigins != "" {
		allowedOrigins = append(allowedOrigins, strings.Split(prodOrigins, ",")...)
	}

	c := cors.New(cors.Options{
		AllowedOrigins:     allowedOrigins,
		AllowedMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:     []string{"Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"},
		ExposedHeaders:     []string{"X-Total-Count", "X-Page-Count"},
		AllowCredentials:   true,
		AllowPrivateNetwork: true,
		MaxAge:            86400, // 24 hours
		Debug:             os.Getenv("CORS_DEBUG") == "true",
	})

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, c.Handler(router)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
