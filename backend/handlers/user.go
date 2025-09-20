package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Andrew-mugwe/agroai/middleware"
	"github.com/Andrew-mugwe/agroai/models"
	"github.com/Andrew-mugwe/agroai/services"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService    *services.UserService
	authService    *services.AuthService
	activityLogger *middleware.ActivityLoggerMiddleware
}

func NewUserHandler(userService *services.UserService, authService *services.AuthService, activityLogger *middleware.ActivityLoggerMiddleware) *UserHandler {
	return &UserHandler{
		userService:    userService,
		authService:    authService,
		activityLogger: activityLogger,
	}
}

type updateRoleRequest struct {
	Role models.UserRole `json:"role"`
}

func (h *UserHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID := r.Context().Value("userID").(string)

	// Parse request body
	var req updateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get current user to log old role
	currentUser, err := h.userService.GetUserByID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update user's role
	if err := h.userService.UpdateUserRole(userID, req.Role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get updated user
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Log role change activity
	if h.activityLogger != nil {
		userUUID, err := uuid.Parse(userID)
		if err == nil {
			h.activityLogger.LogRoleChange(userUUID, string(currentUser.Role), string(req.Role), r)
		}
	}

	// Generate new token with updated role
	token, err := h.authService.GenerateToken(*user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response with new token
	response := struct {
		Token string `json:"token"`
	}{
		Token: token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
