package middleware

import (
	"net/http"

	"github.com/Andrew-mugwe/agroai/models"
)

// SingleRoleMiddleware creates middleware that checks if the user has the required role
func SingleRoleMiddleware(requiredRole models.UserRole) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Get user from context (set by AuthMiddleware)
			user, ok := r.Context().Value("user").(*models.User)
			if !ok {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Check if user has required role
			if user.Role != requiredRole {
				http.Error(w, "Forbidden - insufficient role", http.StatusForbidden)
				return
			}

			// User has required role, proceed
			next(w, r)
		}
	}
}

// RequireRole is an alias for SingleRoleMiddleware for better readability
func RequireRole(role models.UserRole) func(http.HandlerFunc) http.HandlerFunc {
	return SingleRoleMiddleware(role)
}
