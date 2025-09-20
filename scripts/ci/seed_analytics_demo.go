package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

const seedMarkerQuery = `
	SELECT EXISTS (
		SELECT 1 FROM analytics_events 
		WHERE metadata->>'seed_source' = 'ci_demo_v1'
	)`

const insertEventQuery = `
	INSERT INTO analytics_events (
		id, user_id, role, event_type, metadata, created_at
	) VALUES ($1, $2, $3, $4, $5, $6)`

type demoEvent struct {
	userID    uuid.UUID
	role      string
	eventType string
	metadata  map[string]interface{}
	daysAgo   int
}

func main() {
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Check if demo data already exists
	var exists bool
	if err := db.QueryRow(seedMarkerQuery).Scan(&exists); err != nil {
		log.Fatalf("Failed to check seed marker: %v", err)
	}

	if exists {
		log.Println("Demo data already seeded, skipping...")
		return
	}

	// Create demo users if they don't exist
	farmerID := uuid.New()
	ngoID := uuid.New()
	traderID := uuid.New()

	// Generate demo events
	events := []demoEvent{
		// Farmer events
		{farmerID, "farmer", "farmer.crop_added", map[string]interface{}{
			"crop_type": "maize",
			"area": 2.5,
			"seed_source": "ci_demo_v1",
		}, 30},
		{farmerID, "farmer", "farmer.weather_viewed", map[string]interface{}{
			"location": "Nairobi",
			"seed_source": "ci_demo_v1",
		}, 25},
		{farmerID, "farmer", "farmer.alert_read", map[string]interface{}{
			"alert_type": "pest_warning",
			"seed_source": "ci_demo_v1",
		}, 20},

		// NGO events
		{ngoID, "ngo", "ngo.training_created", map[string]interface{}{
			"title": "Sustainable Farming",
			"participants": 25,
			"seed_source": "ci_demo_v1",
		}, 28},
		{ngoID, "ngo", "ngo.farmer_onboarded", map[string]interface{}{
			"farmer_count": 10,
			"region": "Central",
			"seed_source": "ci_demo_v1",
		}, 21},
		{ngoID, "ngo", "ngo.resource_shared", map[string]interface{}{
			"resource_type": "guide",
			"topic": "pest_control",
			"seed_source": "ci_demo_v1",
		}, 14},

		// Trader events
		{traderID, "trader", "trader.product_listed", map[string]interface{}{
			"product": "fertilizer",
			"quantity": 100,
			"seed_source": "ci_demo_v1",
		}, 30},
		{traderID, "trader", "trader.order_received", map[string]interface{}{
			"order_value": 500.00,
			"items": 2,
			"seed_source": "ci_demo_v1",
		}, 15},
		{traderID, "trader", "trader.order_fulfilled", map[string]interface{}{
			"order_id": "demo-order-1",
			"seed_source": "ci_demo_v1",
		}, 10},
	}

	// Insert events
	ctx := context.Background()
	for _, event := range events {
		metadata, err := json.Marshal(event.metadata)
		if err != nil {
			log.Printf("Failed to marshal metadata for event %s: %v", event.eventType, err)
			continue
		}

		createdAt := time.Now().AddDate(0, 0, -event.daysAgo)
		
		_, err = db.ExecContext(ctx, insertEventQuery,
			uuid.New(),
			event.userID,
			event.role,
			event.eventType,
			metadata,
			createdAt,
		)
		if err != nil {
			log.Printf("Failed to insert event %s: %v", event.eventType, err)
			continue
		}

		fmt.Printf("Inserted %s event for %s\n", event.eventType, event.role)
	}

	log.Println("Demo data seeded successfully")
}
