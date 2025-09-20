package services

import (
	"database/sql"
	"errors"
	"time"

	"github.com/Andrew-mugwe/agroai/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) UpdateUserRole(userID string, role models.UserRole) error {
	// Validate role
	switch role {
	case models.RoleFarmer, models.RoleNGO, models.RoleTrader:
		// Valid role
	default:
		return errors.New("invalid role")
	}

	// Update user's role in database
	query := `
		UPDATE users 
		SET role = $1, updated_at = $2 
		WHERE id = $3
		RETURNING id`

	var id string
	err := s.db.QueryRow(query, role, time.Now(), userID).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("user not found")
		}
		return err
	}

	return nil
}

func (s *UserService) GetUserByID(userID string) (*models.User, error) {
	query := `
		SELECT id, name, email, role, created_at, updated_at
		FROM users
		WHERE id = $1`

	var user models.User
	err := s.db.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}
