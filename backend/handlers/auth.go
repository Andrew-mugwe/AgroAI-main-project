package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService    *services.AuthService
	activityLogger *middleware.ActivityLoggerMiddleware
}

func NewAuthHandler(authService *services.AuthService, activityLogger *middleware.ActivityLoggerMiddleware) *AuthHandler {
	return &AuthHandler{
		authService:    authService,
		activityLogger: activityLogger,
	}
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	var req models.UserSignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	response, err := h.authService.SignUp(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Log signup activity
	if h.activityLogger != nil {
		userID, err := uuid.Parse(response.ID)
		if err == nil {
			h.activityLogger.LogSignup(userID, string(req.Role), r)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.UserLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	response, err := h.authService.Login(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Log login activity
	if h.activityLogger != nil {
		userID, err := uuid.Parse(response.ID)
		if err == nil {
			h.activityLogger.LogLogin(userID, string(response.Role), r)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
