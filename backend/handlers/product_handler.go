package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services"
	"github.com/Andrew-mugwe/agroai/utils"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ProductHandler struct {
	productService services.ProductService
}

func NewProductHandler(productService services.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// CreateProduct godoc
// @Summary Create a new product
// @Description Create a new product for the authenticated trader
// @Tags products
// @Accept json
// @Produce json
// @Param product body models.CreateProductRequest true "Product details"
// @Security BearerAuth
// @Success 201 {object} models.Product
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/trader/products [post]
func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	traderID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Parse request body
	var req models.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate request
	if req.Name == "" || req.Description == "" {
		utils.RespondWithValidationError(w, "Name and description are required")
		return
	}

	// Create product
	product, err := h.productService.CreateProduct(r.Context(), traderID, &req)
	if err != nil {
		switch err {
		case services.ErrUnauthorized:
			utils.RespondWithError(w, http.StatusUnauthorized, err.Error())
		default:
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create product")
		}
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, product)
}

// UpdateProduct godoc
// @Summary Update a product
// @Description Update an existing product for the authenticated trader
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param product body models.UpdateProductRequest true "Product details"
// @Security BearerAuth
// @Success 200 {object} models.Product
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/trader/products/{id} [put]
func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	traderID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get product ID from URL
	vars := mux.Vars(r)
	productID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid product ID")
		return
	}

	// Parse request body
	var req models.UpdateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate request
	if req.Name != nil && *req.Name == "" {
		utils.RespondWithValidationError(w, "Name cannot be empty")
		return
	}
	if req.Description != nil && *req.Description == "" {
		utils.RespondWithValidationError(w, "Description cannot be empty")
		return
	}

	// Update product
	product, err := h.productService.UpdateProduct(r.Context(), productID, traderID, &req)
	if err != nil {
		switch err {
		case services.ErrUnauthorized:
			utils.RespondWithError(w, http.StatusUnauthorized, err.Error())
		case services.ErrNotFound:
			utils.RespondWithError(w, http.StatusNotFound, "Product not found")
		default:
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update product")
		}
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, product)
}

// DeleteProduct godoc
// @Summary Delete a product
// @Description Delete an existing product for the authenticated trader
// @Tags products
// @Produce json
// @Param id path string true "Product ID"
// @Security BearerAuth
// @Success 204 "No Content"
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/trader/products/{id} [delete]
func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	traderID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get product ID from URL
	vars := mux.Vars(r)
	productID, err := uuid.Parse(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid product ID")
		return
	}

	// Delete product
	err = h.productService.DeleteProduct(r.Context(), productID, traderID)
	if err != nil {
		switch err {
		case services.ErrUnauthorized:
			utils.RespondWithError(w, http.StatusUnauthorized, err.Error())
		case services.ErrNotFound:
			utils.RespondWithError(w, http.StatusNotFound, "Product not found")
		default:
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete product")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetTraderProducts godoc
// @Summary Get trader's products
// @Description Get paginated list of products for the authenticated trader
// @Tags products
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param size query int false "Page size (default: 10)"
// @Security BearerAuth
// @Success 200 {object} utils.PaginatedResponse{data=[]models.Product}
// @Failure 401 {object} utils.ErrorResponse
// @Router /api/trader/products [get]
func (h *ProductHandler) GetTraderProducts(w http.ResponseWriter, r *http.Request) {
	// Get trader ID from context
	traderID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get pagination params
	page := 1
	pageSize := 10

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if sizeStr := r.URL.Query().Get("size"); sizeStr != "" {
		if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 {
			pageSize = s
		}
	}

	// Get products
	products, total, err := h.productService.GetTraderProducts(r.Context(), traderID, page, pageSize)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get products")
		return
	}

	// Respond with paginated results
	utils.RespondWithPagination(w, http.StatusOK, products, page, pageSize, total)
}
