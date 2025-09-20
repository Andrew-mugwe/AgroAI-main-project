package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
)

// DevelopmentDatabaseConfig holds development database configuration
type DevelopmentDatabaseConfig struct {
	Host            string
	Port            string
	User            string
	Password        string
	Database        string
	SSLMode         string
	MaxConnections  int32
	MinConnections  int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

// GetDevelopmentDBConfig returns development database configuration
func GetDevelopmentDBConfig() *DevelopmentDatabaseConfig {
	return &DevelopmentDatabaseConfig{
		Host:            getEnvDev("DB_HOST", "localhost"),
		Port:            getEnvDev("DB_PORT", "5432"),
		User:            getEnvDev("DB_USER", "agroai_user"),
		Password:        getEnvDev("DB_PASSWORD", "agroai_password"),
		Database:        getEnvDev("DB_NAME", "agroai_dev"),
		SSLMode:         getEnvDev("DB_SSL_MODE", "disable"),
		MaxConnections:  20,
		MinConnections:  5,
		MaxConnLifetime: time.Hour,
		MaxConnIdleTime: 30 * time.Minute,
	}
}

// ConnectToDevelopmentDB connects to the development database
func ConnectToDevelopmentDB() (*pgxpool.Pool, error) {
	config := GetDevelopmentDBConfig()

	// Build connection string
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s pool_max_conns=%d pool_min_conns=%d",
		config.Host,
		config.Port,
		config.User,
		config.Password,
		config.Database,
		config.SSLMode,
		config.MaxConnections,
		config.MinConnections,
	)

	// Create connection pool
	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	// Configure connection pool
	poolConfig.MaxConns = config.MaxConnections
	poolConfig.MinConns = config.MinConnections
	poolConfig.MaxConnLifetime = config.MaxConnLifetime
	poolConfig.MaxConnIdleTime = config.MaxConnIdleTime

	// Set connection timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Connect to database
	pool, err := pgxpool.ConnectConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("✅ Connected to development database: %s@%s:%s/%s",
		config.User, config.Host, config.Port, config.Database)

	return pool, nil
}

// GetTestDBConfig returns test database configuration
func GetTestDBConfig() *DevelopmentDatabaseConfig {
	config := GetDevelopmentDBConfig()
	config.Database = getEnvDev("TEST_DB_NAME", "agroai_test")
	return config
}

// ConnectToTestDB connects to the test database
func ConnectToTestDB() (*pgxpool.Pool, error) {
	config := GetTestDBConfig()

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password,
		config.Database, config.SSLMode,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := pgxpool.Connect(ctx, connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to test database: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping test database: %w", err)
	}

	log.Printf("✅ Connected to test database: %s", config.Database)
	return pool, nil
}

// CloseDBPool closes the database connection pool
func CloseDBPool(pool *pgxpool.Pool) {
	if pool != nil {
		pool.Close()
		log.Println("✅ Database connection pool closed")
	}
}

// getEnvDev gets environment variable with fallback for development
func getEnvDev(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
