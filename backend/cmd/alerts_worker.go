package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Andrew-mugwe/agroai/config"
	"github.com/Andrew-mugwe/agroai/services/alerts"
	_ "github.com/lib/pq"
)

func main() {
	var (
		interval = flag.Duration("interval", 1*time.Minute, "Alert evaluation interval")
	)
	flag.Parse()

	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Create alert service
	alertService := alerts.NewAlertService(db)

	// Create context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("Received shutdown signal, stopping alerts worker...")
		cancel()
	}()

	log.Printf("Starting alerts worker with %v evaluation interval", *interval)

	// Run alert evaluation in a loop
	ticker := time.NewTicker(*interval)
	defer ticker.Stop()

	// Run initial evaluation
	if err := alertService.EvaluateRules(ctx); err != nil {
		log.Printf("Error during initial rule evaluation: %v", err)
	}

	for {
		select {
		case <-ctx.Done():
			log.Println("Alerts worker stopped")
			return
		case <-ticker.C:
			if err := alertService.EvaluateRules(ctx); err != nil {
				log.Printf("Error evaluating rules: %v", err)
			} else {
				log.Println("Alert rules evaluated successfully")
			}
		}
	}
}
