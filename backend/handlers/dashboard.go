package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services"
)

type DashboardHandler struct {
	dashboardService *services.DashboardService
	cacheService     *services.CacheService
}

func NewDashboardHandler(dashboardService *services.DashboardService, cacheService *services.CacheService) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
		cacheService:     cacheService,
	}
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by auth middleware)
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Try to get from cache first
	cacheKey := h.cacheService.GetDashboardKey(user.ID)
	var data interface{}

	err := h.cacheService.GetCache(cacheKey, &data)
	if err == nil {
		// Cache hit - return cached data
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		json.NewEncoder(w).Encode(data)
		return
	}

	// Cache miss - get fresh data from service
	data, err = h.dashboardService.GetDashboard(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Store in cache for 5 minutes
	cacheTTL := 5 * time.Minute
	if err := h.cacheService.SetCache(cacheKey, data, cacheTTL); err != nil {
		// Log cache error but don't fail the request
		// In production, you might want to use a proper logger
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	json.NewEncoder(w).Encode(data)
}
