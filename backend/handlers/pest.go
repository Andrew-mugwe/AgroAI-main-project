package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services/pest"
)

// PestHandler handles pest detection HTTP requests
type PestHandler struct {
	pestService *pest.PestService
}

// NewPestHandler creates a new pest handler
func NewPestHandler(pestService *pest.PestService) *PestHandler {
	return &PestHandler{pestService: pestService}
}

// CreatePestReportRequest represents the request to create a pest report
type CreatePestReportRequest struct {
	Notes string `json:"notes"`
}

// CreatePestReportResponse represents the response after creating a pest report
type CreatePestReportResponse struct {
	Success bool                `json:"success"`
	Message string              `json:"message"`
	Report  *pest.PestReport    `json:"report,omitempty"`
}

// PestReportsResponse represents the response for getting pest reports
type PestReportsResponse struct {
	Success bool                `json:"success"`
	Reports []pest.PestReport   `json:"reports"`
	Total   int                 `json:"total"`
}

// PestAnalyticsResponse represents the response for pest analytics
type PestAnalyticsResponse struct {
	Success   bool                    `json:"success"`
	Analytics []pest.PestAnalytics    `json:"analytics"`
}

// CreatePestReport handles POST /api/pests/report
func (ph *PestHandler) CreatePestReport(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	// Get uploaded file
	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "No image file provided", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	if !isValidImageType(handler.Filename) {
		http.Error(w, "Invalid file type. Only JPG, PNG, and GIF are allowed", http.StatusBadRequest)
		return
	}

	// Get notes from form
	notes := r.FormValue("notes")
	if notes == "" {
		notes = "No additional notes provided"
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		http.Error(w, "Failed to create uploads directory", http.StatusInternalServerError)
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	ext := filepath.Ext(handler.Filename)
	filename := fmt.Sprintf("pest_%s_%d%s", claims.UserID[:8], timestamp, ext)
	filepath := filepath.Join(uploadsDir, filename)

	// Save file
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// Create pest report
	report, err := ph.pestService.CreatePestReport(claims.UserID, filepath, notes)
	if err != nil {
		// Clean up uploaded file if database operation fails
		os.Remove(filepath)
		http.Error(w, "Failed to create pest report", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(CreatePestReportResponse{
		Success: true,
		Message: "Pest report created successfully",
		Report:  report,
	})
}

// GetUserPestReports handles GET /api/pests/reports
func (ph *PestHandler) GetUserPestReports(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 20 // default
	offset := 0 // default

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// Get pest reports
	reports, err := ph.pestService.GetUserPestReports(claims.UserID, limit, offset)
	if err != nil {
		http.Error(w, "Failed to get pest reports", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PestReportsResponse{
		Success: true,
		Reports: reports,
		Total:   len(reports),
	})
}

// GetPestAnalytics handles GET /api/pests/analytics
func (ph *PestHandler) GetPestAnalytics(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user has permission to view analytics
	// For now, allow all authenticated users
	_ = claims

	// Get pest analytics
	analytics, err := ph.pestService.GetPestAnalytics()
	if err != nil {
		http.Error(w, "Failed to get pest analytics", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PestAnalyticsResponse{
		Success:   true,
		Analytics: analytics,
	})
}

// GetAllPestReports handles GET /api/pests/reports/all (admin only)
func (ph *PestHandler) GetAllPestReports(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin (for now, allow all authenticated users)
	_ = claims

	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 50 // default
	offset := 0 // default

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// Get all pest reports
	reports, err := ph.pestService.GetAllPestReports(limit, offset)
	if err != nil {
		http.Error(w, "Failed to get pest reports", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PestReportsResponse{
		Success: true,
		Reports: reports,
		Total:   len(reports),
	})
}

// DeletePestReport handles DELETE /api/pests/reports/:id
func (ph *PestHandler) DeletePestReport(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := r.Context().Value("user").(*middleware.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get pest report ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	idStr := pathParts[len(pathParts)-1]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid pest report ID", http.StatusBadRequest)
		return
	}

	// Delete pest report
	err = ph.pestService.DeletePestReport(id, claims.UserID)
	if err != nil {
		http.Error(w, "Failed to delete pest report", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Pest report deleted successfully",
	})
}

// isValidImageType checks if the file is a valid image type
func isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := []string{".jpg", ".jpeg", ".png", ".gif"}
	
	for _, validExt := range validExts {
		if ext == validExt {
			return true
		}
	}
	return false
}
