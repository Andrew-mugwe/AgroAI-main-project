package pest

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

)

// PestService handles pest detection operations
type PestService struct {
	db *sql.DB
}

// NewPestService creates a new pest service
func NewPestService(db *sql.DB) *PestService {
	return &PestService{db: db}
}

// PestReport represents a pest detection report
type PestReport struct {
	ID         int       `json:"id"`
	UserID     string    `json:"user_id"`
	ImageURL   string    `json:"image_url"`
	PestName   string    `json:"pest_name"`
	Confidence float64   `json:"confidence"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"created_at"`
}

// CreatePestReport creates a new pest report
func (ps *PestService) CreatePestReport(userID, imageURL, notes string) (*PestReport, error) {
	// Stubbed AI classification - return random pest name and confidence
	pestName, confidence := ps.classifyPest()

	query := `
		INSERT INTO pest_reports (user_id, image_url, pest_name, confidence, notes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`

	var id int
	var createdAt time.Time
	err := ps.db.QueryRow(query, userID, imageURL, pestName, confidence, notes).Scan(&id, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create pest report: %w", err)
	}

	return &PestReport{
		ID:         id,
		UserID:     userID,
		ImageURL:   imageURL,
		PestName:   pestName,
		Confidence: confidence,
		Notes:      notes,
		CreatedAt:  createdAt,
	}, nil
}

// GetUserPestReports retrieves pest reports for a specific user
func (ps *PestService) GetUserPestReports(userID string, limit, offset int) ([]PestReport, error) {
	query := `
		SELECT id, user_id, image_url, pest_name, confidence, notes, created_at
		FROM pest_reports
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := ps.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get pest reports: %w", err)
	}
	defer rows.Close()

	var reports []PestReport
	for rows.Next() {
		var report PestReport
		err := rows.Scan(
			&report.ID,
			&report.UserID,
			&report.ImageURL,
			&report.PestName,
			&report.Confidence,
			&report.Notes,
			&report.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pest report: %w", err)
		}
		reports = append(reports, report)
	}

	return reports, nil
}

// GetPestAnalytics returns analytics grouped by pest name
func (ps *PestService) GetPestAnalytics() ([]PestAnalytics, error) {
	query := `
		SELECT 
			pest_name,
			COUNT(*) as count,
			AVG(confidence) as avg_confidence,
			MAX(created_at) as last_detected
		FROM pest_reports
		WHERE pest_name IS NOT NULL
		GROUP BY pest_name
		ORDER BY count DESC
	`

	rows, err := ps.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get pest analytics: %w", err)
	}
	defer rows.Close()

	var analytics []PestAnalytics
	for rows.Next() {
		var analytic PestAnalytics
		err := rows.Scan(
			&analytic.PestName,
			&analytic.Count,
			&analytic.AvgConfidence,
			&analytic.LastDetected,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pest analytics: %w", err)
		}
		analytics = append(analytics, analytic)
	}

	return analytics, nil
}

// GetAllPestReports retrieves all pest reports (for admin/analytics)
func (ps *PestService) GetAllPestReports(limit, offset int) ([]PestReport, error) {
	query := `
		SELECT id, user_id, image_url, pest_name, confidence, notes, created_at
		FROM pest_reports
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := ps.db.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get all pest reports: %w", err)
	}
	defer rows.Close()

	var reports []PestReport
	for rows.Next() {
		var report PestReport
		err := rows.Scan(
			&report.ID,
			&report.UserID,
			&report.ImageURL,
			&report.PestName,
			&report.Confidence,
			&report.Notes,
			&report.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pest report: %w", err)
		}
		reports = append(reports, report)
	}

	return reports, nil
}

// PestAnalytics represents analytics data for pests
type PestAnalytics struct {
	PestName      string    `json:"pest_name"`
	Count         int       `json:"count"`
	AvgConfidence float64   `json:"avg_confidence"`
	LastDetected  time.Time `json:"last_detected"`
}

// classifyPest is a stubbed AI classification function
func (ps *PestService) classifyPest() (string, float64) {
	// Simulate AI classification with random results
	pestNames := []string{
		"Fall Armyworm",
		"Leaf Rust",
		"Aphids",
		"Stem Borer",
		"Whitefly",
		"Thrips",
		"Spider Mites",
		"Powdery Mildew",
		"Bacterial Blight",
		"Root Rot",
	}

	rand.Seed(time.Now().UnixNano())
	pestName := pestNames[rand.Intn(len(pestNames))]
	confidence := 70.0 + rand.Float64()*25.0 // 70-95% confidence

	return pestName, confidence
}

// GetPestReportByID retrieves a specific pest report by ID
func (ps *PestService) GetPestReportByID(id int) (*PestReport, error) {
	query := `
		SELECT id, user_id, image_url, pest_name, confidence, notes, created_at
		FROM pest_reports
		WHERE id = $1
	`

	var report PestReport
	err := ps.db.QueryRow(query, id).Scan(
		&report.ID,
		&report.UserID,
		&report.ImageURL,
		&report.PestName,
		&report.Confidence,
		&report.Notes,
		&report.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("pest report not found")
		}
		return nil, fmt.Errorf("failed to get pest report: %w", err)
	}

	return &report, nil
}

// DeletePestReport deletes a pest report
func (ps *PestService) DeletePestReport(id int, userID string) error {
	query := `
		DELETE FROM pest_reports
		WHERE id = $1 AND user_id = $2
	`

	result, err := ps.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete pest report: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("pest report not found or access denied")
	}

	return nil
}
