package utils

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

func RespondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

func RespondWithValidationError(w http.ResponseWriter, message string) {
	RespondWithError(w, http.StatusBadRequest, message)
}

func RespondWithPagination(w http.ResponseWriter, code int, data interface{}, page, pageSize, total int) {
	response := map[string]interface{}{
		"data": data,
		"pagination": map[string]interface{}{
			"page":      page,
			"page_size": pageSize,
			"total":     total,
		},
	}
	RespondWithJSON(w, code, response)
}

func GetUserIDFromContext(r *http.Request) (uuid.UUID, error) {
	userID, ok := r.Context().Value("user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil, http.ErrNotSupported
	}
	return userID, nil
}

func Validate(condition bool, message string) error {
	if !condition {
		return http.ErrNotSupported // This should be a proper validation error
	}
	return nil
}
