package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/services"
)

type TraderHandler struct {
	traderService *services.TraderService
	cacheService  *services.CacheService
}

func NewTraderHandler(traderService *services.TraderService, cacheService *services.CacheService) *TraderHandler {
	return &TraderHandler{
		traderService: traderService,
		cacheService:  cacheService,
	}
}

// GetProducts returns a trader's product listings
func (h *TraderHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	claims := r.Context().Value("user").(*middleware.Claims)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get query parameters
	category := r.URL.Query().Get("category")
	status := r.URL.Query().Get("status")

	// Create cache key with query parameters
	cacheKey := h.cacheService.GetProductsKey(claims.UserID)
	if category != "" {
		cacheKey += ":category:" + category
	}
	if status != "" {
		cacheKey += ":status:" + status
	}

	// Try to get from cache first
	var products interface{}
	err := h.cacheService.GetCache(cacheKey, &products)
	if err == nil {
		// Cache hit - return cached data
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		json.NewEncoder(w).Encode(products)
		return
	}

	// Cache miss - get fresh data from service
	products, err = h.traderService.GetProducts(claims.UserID, category, status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Store in cache for 10 minutes
	cacheTTL := 10 * time.Minute
	if err := h.cacheService.SetCache(cacheKey, products, cacheTTL); err != nil {
		// Log cache error but don't fail the request
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	json.NewEncoder(w).Encode(products)
}

// GetOrders returns a trader's orders
func (h *TraderHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	claims := r.Context().Value("user").(*middleware.Claims)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get query parameters
	status := r.URL.Query().Get("status")
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	// Parse dates
	var start, end time.Time
	if startDate != "" {
		start, _ = time.Parse("2006-01-02", startDate)
	}
	if endDate != "" {
		end, _ = time.Parse("2006-01-02", endDate)
	}

	// Get orders
	orders, err := h.traderService.GetOrders(claims.UserID, status, start, end)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// GetAnalytics returns trading analytics
func (h *TraderHandler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	claims := r.Context().Value("user").(*middleware.Claims)
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Try to get from cache first
	cacheKey := h.cacheService.GetAnalyticsKey(claims.UserID)
	var analytics interface{}

	err := h.cacheService.GetCache(cacheKey, &analytics)
	if err == nil {
		// Cache hit - return cached data
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		json.NewEncoder(w).Encode(analytics)
		return
	}

	// Cache miss - get fresh data from service
	analytics, err = h.traderService.GetAnalytics(claims.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Store in cache for 15 minutes (analytics change less frequently)
	cacheTTL := 15 * time.Minute
	if err := h.cacheService.SetCache(cacheKey, analytics, cacheTTL); err != nil {
		// Log cache error but don't fail the request
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	json.NewEncoder(w).Encode(analytics)
}
