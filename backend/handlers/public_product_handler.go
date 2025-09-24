package handlers

// Flow14.1.1

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Andrew-mugwe/agroai/services/marketplace"
	"github.com/gorilla/mux"
)

type PublicProductHandler struct {
	svc *marketplace.Service
}

func NewPublicProductHandler(svc *marketplace.Service) *PublicProductHandler {
	return &PublicProductHandler{svc: svc}
}

func (h *PublicProductHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))
	minPrice, maxPrice := parseInt64Ptr(q.Get("min_price")), parseInt64Ptr(q.Get("max_price"))
	filter := marketplace.ListFilter{
		Page:     page,
		Limit:    limit,
		Category: q.Get("category"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		Query:    q.Get("q"),
		SellerID: q.Get("seller_id"),
		Sort:     q.Get("sort"),
	}

	items, meta, err := h.svc.ListPublicProducts(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// basic caching headers
	w.Header().Set("Cache-Control", "public, max-age=30")
	w.Header().Set("Last-Modified", time.Now().UTC().Format(http.TimeFormat))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"items": items, "meta": meta})
}

func (h *PublicProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	p, err := h.svc.GetPublicProduct(r.Context(), id)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=60")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func (h *PublicProductHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	// Simple category list from products
	rows, err := h.svc.DB().QueryContext(r.Context(), "SELECT DISTINCT category FROM public_products WHERE category IS NOT NULL ORDER BY category ASC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var cats []string
	for rows.Next() {
		var c string
		if err := rows.Scan(&c); err == nil {
			cats = append(cats, c)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"items": cats})
}

func parseInt64Ptr(s string) *int64 {
	if s == "" {
		return nil
	}
	v, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return nil
	}
	return &v
}
