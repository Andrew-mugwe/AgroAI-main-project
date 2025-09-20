package reputation

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/google/uuid"
)

// Scheduler handles background reputation updates
type Scheduler struct {
	db                *sql.DB
	reputationService *ReputationService
	interval          time.Duration
	ctx               context.Context
	cancel            context.CancelFunc
}

// NewScheduler creates a new reputation scheduler
func NewScheduler(db *sql.DB, reputationService *ReputationService, interval time.Duration) *Scheduler {
	ctx, cancel := context.WithCancel(context.Background())

	return &Scheduler{
		db:                db,
		reputationService: reputationService,
		interval:          interval,
		ctx:               ctx,
		cancel:            cancel,
	}
}

// Start begins the background reputation update process
func (s *Scheduler) Start() {
	log.Printf("Starting reputation scheduler with interval: %v", s.interval)

	go s.run()
}

// Stop stops the background reputation update process
func (s *Scheduler) Stop() {
	log.Println("Stopping reputation scheduler...")
	s.cancel()
}

// run executes the reputation update loop
func (s *Scheduler) run() {
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	// Run immediately on start
	s.updateActiveSellers()

	for {
		select {
		case <-s.ctx.Done():
			log.Println("Reputation scheduler stopped")
			return
		case <-ticker.C:
			s.updateActiveSellers()
		}
	}
}

// updateActiveSellers recalculates reputation for active sellers
func (s *Scheduler) updateActiveSellers() {
	log.Println("Starting reputation update for active sellers...")

	startTime := time.Now()

	// Get active sellers (those with recent activity)
	activeSellers, err := s.getActiveSellers()
	if err != nil {
		log.Printf("Failed to get active sellers: %v", err)
		return
	}

	log.Printf("Found %d active sellers to update", len(activeSellers))

	successCount := 0
	errorCount := 0

	for _, sellerID := range activeSellers {
		if err := s.reputationService.RecalculateReputation(sellerID); err != nil {
			log.Printf("Failed to update reputation for seller %s: %v", sellerID, err)
			errorCount++
		} else {
			successCount++
		}
	}

	duration := time.Since(startTime)
	log.Printf("Reputation update completed in %v. Success: %d, Errors: %d", duration, successCount, errorCount)
}

// getActiveSellers returns a list of seller IDs that need reputation updates
func (s *Scheduler) getActiveSellers() ([]uuid.UUID, error) {
	// Get sellers with activity in the last 30 days
	query := `
		SELECT DISTINCT u.id
		FROM users u
		WHERE u.role = 'trader' OR u.role = 'seller'
		AND (
			EXISTS (
				SELECT 1 FROM orders o 
				WHERE o.seller_id = u.id 
				AND o.created_at >= $1
			)
			OR EXISTS (
				SELECT 1 FROM ratings r 
				WHERE r.seller_id = u.id 
				AND r.created_at >= $1
			)
			OR EXISTS (
				SELECT 1 FROM disputes d 
				WHERE d.seller_id = u.id 
				AND d.created_at >= $1
			)
		)
		ORDER BY u.id
	`

	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	rows, err := s.db.Query(query, thirtyDaysAgo)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sellers []uuid.UUID
	for rows.Next() {
		var sellerID uuid.UUID
		if err := rows.Scan(&sellerID); err != nil {
			return nil, err
		}
		sellers = append(sellers, sellerID)
	}

	return sellers, nil
}

// UpdateSpecificSellers updates reputation for specific sellers
func (s *Scheduler) UpdateSpecificSellers(sellerIDs []uuid.UUID) error {
	log.Printf("Updating reputation for %d specific sellers", len(sellerIDs))

	startTime := time.Now()
	successCount := 0
	errorCount := 0

	for _, sellerID := range sellerIDs {
		if err := s.reputationService.RecalculateReputation(sellerID); err != nil {
			log.Printf("Failed to update reputation for seller %s: %v", sellerID, err)
			errorCount++
		} else {
			successCount++
		}
	}

	duration := time.Since(startTime)
	log.Printf("Specific seller reputation update completed in %v. Success: %d, Errors: %d", duration, successCount, errorCount)

	return nil
}

// GetSchedulerStats returns statistics about the scheduler
func (s *Scheduler) GetSchedulerStats() map[string]interface{} {
	stats := make(map[string]interface{})

	// Get total sellers count
	var totalSellers int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'trader' OR role = 'seller'").Scan(&totalSellers)
	if err != nil {
		stats["total_sellers_error"] = err.Error()
	} else {
		stats["total_sellers"] = totalSellers
	}

	// Get active sellers count
	activeSellers, err := s.getActiveSellers()
	if err != nil {
		stats["active_sellers_error"] = err.Error()
	} else {
		stats["active_sellers"] = len(activeSellers)
	}

	// Get last reputation update
	var lastUpdate time.Time
	err = s.db.QueryRow("SELECT MAX(created_at) FROM reputation_history").Scan(&lastUpdate)
	if err != nil {
		stats["last_update_error"] = err.Error()
	} else {
		stats["last_update"] = lastUpdate
	}

	// Get reputation history count
	var historyCount int
	err = s.db.QueryRow("SELECT COUNT(*) FROM reputation_history").Scan(&historyCount)
	if err != nil {
		stats["history_count_error"] = err.Error()
	} else {
		stats["history_count"] = historyCount
	}

	stats["scheduler_interval"] = s.interval.String()
	stats["scheduler_running"] = s.ctx.Err() == nil

	return stats
}
