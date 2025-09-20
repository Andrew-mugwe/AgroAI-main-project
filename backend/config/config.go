package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"
)

// Config holds all application configuration
type Config struct {
	// Database
	DatabaseURL string

	// JWT
	JWTSecret string

	// Server
	Port string
	Host string

	// Redis Cache
	Redis RedisConfig

	// External APIs
	WeatherAPIKey    string
	MarketDataAPIKey string

	// Email
	SMTP SMTPConfig

	// AWS
	AWS AWSConfig

	// Monitoring
	SentryDSN     string
	AnalyticsID   string
	LogLevel      string
	Debug         bool
}

// RedisConfig holds Redis-specific configuration
type RedisConfig struct {
	URL      string
	Password string
	DB       int
	TTL      time.Duration
	Enabled  bool
}

// SMTPConfig holds SMTP configuration
type SMTPConfig struct {
	Host     string
	Port     int
	Username string
	Password string
}

// AWSConfig holds AWS configuration
type AWSConfig struct {
	AccessKeyID     string
	SecretAccessKey string
	Region          string
	S3BucketName    string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://username:password@localhost:5432/agroai?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "your_jwt_secret_here"),
		Port:        getEnv("PORT", "8080"),
		Host:        getEnv("HOST", "0.0.0.0"),

		Redis: RedisConfig{
			URL:      getEnv("REDIS_URL", "redis://localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
			TTL:      getEnvAsDuration("CACHE_TTL", 300*time.Second),
			Enabled:  getEnvAsBool("CACHE_ENABLED", true),
		},

		WeatherAPIKey:    getEnv("WEATHER_API_KEY", ""),
		MarketDataAPIKey: getEnv("MARKET_DATA_API_KEY", ""),

		SMTP: SMTPConfig{
			Host:     getEnv("SMTP_HOST", "smtp.gmail.com"),
			Port:     getEnvAsInt("SMTP_PORT", 587),
			Username: getEnv("SMTP_USERNAME", ""),
			Password: getEnv("SMTP_PASSWORD", ""),
		},

		AWS: AWSConfig{
			AccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
			Region:          getEnv("AWS_REGION", "us-east-1"),
			S3BucketName:    getEnv("S3_BUCKET_NAME", ""),
		},

		SentryDSN:   getEnv("SENTRY_DSN", ""),
		AnalyticsID: getEnv("ANALYTICS_ID", ""),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		Debug:       getEnvAsBool("DEBUG", false),
	}
}

// ValidateConfig validates the configuration
func (c *Config) ValidateConfig() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	if c.JWTSecret == "" || c.JWTSecret == "your_jwt_secret_here" {
		return fmt.Errorf("JWT_SECRET must be set to a secure value")
	}

	if c.Redis.Enabled && c.Redis.URL == "" {
		return fmt.Errorf("REDIS_URL is required when cache is enabled")
	}

	return nil
}

// GetRedisURL returns the Redis URL for the cache service
func (c *Config) GetRedisURL() string {
	return c.Redis.URL
}

// IsCacheEnabled returns whether caching is enabled
func (c *Config) IsCacheEnabled() bool {
	return c.Redis.Enabled
}

// GetCacheTTL returns the default cache TTL
func (c *Config) GetCacheTTL() time.Duration {
	return c.Redis.TTL
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt gets an environment variable as an integer with a default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
		log.Printf("Warning: Invalid integer value for %s: %s", key, value)
	}
	return defaultValue
}

// getEnvAsBool gets an environment variable as a boolean with a default value
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
		log.Printf("Warning: Invalid boolean value for %s: %s", key, value)
	}
	return defaultValue
}

// getEnvAsDuration gets an environment variable as a duration with a default value
func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return time.Duration(intValue) * time.Second
		}
		log.Printf("Warning: Invalid duration value for %s: %s", key, value)
	}
	return defaultValue
}

// PrintConfig prints the configuration (excluding sensitive values)
func (c *Config) PrintConfig() {
	log.Println("Configuration loaded:")
	log.Printf("  Database URL: %s", maskSensitiveValue(c.DatabaseURL))
	log.Printf("  JWT Secret: %s", maskSensitiveValue(c.JWTSecret))
	log.Printf("  Server: %s:%s", c.Host, c.Port)
	log.Printf("  Redis: %s (DB: %d, Enabled: %t)", maskSensitiveValue(c.Redis.URL), c.Redis.DB, c.Redis.Enabled)
	log.Printf("  Cache TTL: %v", c.Redis.TTL)
	log.Printf("  Debug: %t", c.Debug)
	log.Printf("  Log Level: %s", c.LogLevel)
}

// maskSensitiveValue masks sensitive values in configuration
func maskSensitiveValue(value string) string {
	if len(value) == 0 {
		return "not set"
	}
	if len(value) <= 8 {
		return "***"
	}
	return value[:4] + "***" + value[len(value)-4:]
}
