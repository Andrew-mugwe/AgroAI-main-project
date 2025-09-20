package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var (
	// Global connection pool
	dbPool *pgxpool.Pool
)

// Database configuration
type DBConfig struct {
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	QueryTimeout    time.Duration
}

// Default configuration
var defaultConfig = DBConfig{
	MaxOpenConns:    25,
	MaxIdleConns:    10,
	ConnMaxLifetime: time.Hour,
	QueryTimeout:    time.Second * 10,
}

// InitDB initializes the database connection pool
func InitDB() (*pgxpool.Pool, error) {
	// Get database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	// Parse the connection pool configuration
	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, fmt.Errorf("error parsing database config: %v", err)
	}

	// Set pool configuration
	poolConfig.MaxConns = int32(defaultConfig.MaxOpenConns)
	poolConfig.MinConns = int32(defaultConfig.MaxIdleConns)
	poolConfig.MaxConnLifetime = defaultConfig.ConnMaxLifetime

	// Create the connection pool
	pool, err := pgxpool.ConnectConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, fmt.Errorf("error creating connection pool: %v", err)
	}

	// Store pool globally
	dbPool = pool

	return pool, nil
}

// QueryWithTimeout executes a query with a timeout
func QueryWithTimeout(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	ctx, cancel := context.WithTimeout(ctx, defaultConfig.QueryTimeout)
	defer cancel()

	start := time.Now()
	rows, err := dbPool.Query(ctx, query, args...)
	duration := time.Since(start)

	// Log slow queries
	if duration > time.Second {
		logrus.WithFields(logrus.Fields{
			"duration": duration,
			"query":    query,
		}).Warn("Slow query detected")
	}

	return rows, err
}

// Common database indexes
const createIndexesSQL = `
-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);
`

// InitIndexes creates necessary database indexes
func InitIndexes(db *pgxpool.Pool) error {
	ctx := context.Background()
	_, err := db.Exec(ctx, createIndexesSQL)
	if err != nil {
		return fmt.Errorf("error creating indexes: %v", err)
	}
	return nil
}
