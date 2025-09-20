package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
)

// RedisClient wraps Redis operations with fallback support
type RedisClient struct {
	client *redis.Client
	ctx    context.Context
	config *RedisConfig
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	URL      string
	Password string
	DB       int
	TTL      time.Duration
	Enabled  bool
}

// CacheResult represents the result of a cache operation
type CacheResult struct {
	Value interface{}
	Hit   bool
	Error error
}

// NewRedisClient creates a new Redis client with configuration
func NewRedisClient() (*RedisClient, error) {
	config := loadRedisConfig()
	
	if !config.Enabled {
		log.Println("Redis cache disabled")
		return &RedisClient{client: nil, ctx: context.Background(), config: config}, nil
	}

	opt, err := redis.ParseURL(config.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %v", err)
	}

	// Override with environment variables if provided
	if config.Password != "" {
		opt.Password = config.Password
	}
	opt.DB = config.DB

	client := redis.NewClient(opt)
	ctx := context.Background()

	// Test connection with timeout
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	_, err = client.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %v", err)
	}

	log.Printf("Redis cache initialized successfully (DB: %d)", config.DB)
	return &RedisClient{
		client: client,
		ctx:    context.Background(),
		config: config,
	}, nil
}

// loadRedisConfig loads Redis configuration from environment variables
func loadRedisConfig() *RedisConfig {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		url = "redis://localhost:6379"
	}

	password := os.Getenv("REDIS_PASSWORD")
	
	dbStr := os.Getenv("REDIS_DB")
	db := 0
	if dbStr != "" {
		if dbInt, err := strconv.Atoi(dbStr); err == nil {
			db = dbInt
		}
	}

	ttlStr := os.Getenv("CACHE_TTL")
	ttl := 300 * time.Second // Default 5 minutes
	if ttlStr != "" {
		if ttlInt, err := strconv.Atoi(ttlStr); err == nil {
			ttl = time.Duration(ttlInt) * time.Second
		}
	}

	enabled := os.Getenv("CACHE_ENABLED") != "false"

	return &RedisConfig{
		URL:      url,
		Password: password,
		DB:       db,
		TTL:      ttl,
		Enabled:  enabled,
	}
}

// SetCache stores a value in Redis with TTL
func (r *RedisClient) SetCache(key string, value interface{}, ttl time.Duration) error {
	if r.client == nil {
		return nil // Cache disabled
	}

	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal cache value: %v", err)
	}

	if ttl == 0 {
		ttl = r.config.TTL
	}

	err = r.client.Set(r.ctx, key, data, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to set cache: %v", err)
	}

	log.Printf("Cache SET: %s (TTL: %v)", key, ttl)
	return nil
}

// GetCache retrieves a value from Redis
func (r *RedisClient) GetCache(key string, dest interface{}) *CacheResult {
	if r.client == nil {
		return &CacheResult{Value: nil, Hit: false, Error: redis.Nil}
	}

	data, err := r.client.Get(r.ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			log.Printf("Cache MISS: %s", key)
			return &CacheResult{Value: nil, Hit: false, Error: err}
		}
		log.Printf("Cache ERROR: %s - %v", key, err)
		return &CacheResult{Value: nil, Hit: false, Error: err}
	}

	err = json.Unmarshal([]byte(data), dest)
	if err != nil {
		return &CacheResult{Value: nil, Hit: false, Error: fmt.Errorf("failed to unmarshal cache value: %v", err)}
	}

	log.Printf("Cache HIT: %s", key)
	return &CacheResult{Value: dest, Hit: true, Error: nil}
}

// DeleteCache removes a value from Redis
func (r *RedisClient) DeleteCache(key string) error {
	if r.client == nil {
		return nil // Cache disabled
	}

	err := r.client.Del(r.ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete cache: %v", err)
	}

	log.Printf("Cache DELETE: %s", key)
	return nil
}

// DeletePattern removes all keys matching a pattern
func (r *RedisClient) DeletePattern(pattern string) error {
	if r.client == nil {
		return nil // Cache disabled
	}

	keys, err := r.client.Keys(r.ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed to get keys for pattern %s: %v", pattern, err)
	}

	if len(keys) > 0 {
		err = r.client.Del(r.ctx, keys...).Err()
		if err != nil {
			return fmt.Errorf("failed to delete keys for pattern %s: %v", pattern, err)
		}
		log.Printf("Cache DELETE PATTERN: %s (%d keys)", pattern, len(keys))
	}

	return nil
}

// GetOrSet retrieves from cache or executes fallback function
func (r *RedisClient) GetOrSet(key string, dest interface{}, fallback func() (interface{}, error), ttl time.Duration) error {
	// Try to get from cache first
	result := r.GetCache(key, dest)
	if result.Hit {
		return nil
	}

	// Cache miss - execute fallback
	value, err := fallback()
	if err != nil {
		return err
	}

	// Store in cache
	if err := r.SetCache(key, value, ttl); err != nil {
		log.Printf("Warning: Failed to cache result for key %s: %v", key, err)
	}

	// Set the value in dest
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	
	return json.Unmarshal(data, dest)
}

// GetStats returns Redis statistics
func (r *RedisClient) GetStats() (map[string]interface{}, error) {
	if r.client == nil {
		return map[string]interface{}{
			"enabled": false,
			"status":  "disabled",
		}, nil
	}

	info, err := r.client.Info(r.ctx, "stats").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get Redis stats: %v", err)
	}

	// Get memory usage
	memoryInfo, err := r.client.Info(r.ctx, "memory").Result()
	if err != nil {
		log.Printf("Warning: Failed to get memory info: %v", err)
	}

	stats := map[string]interface{}{
		"enabled":     true,
		"status":      "connected",
		"db":          r.config.DB,
		"info":        info,
		"memory_info": memoryInfo,
	}

	return stats, nil
}

// Close closes the Redis connection
func (r *RedisClient) Close() error {
	if r.client == nil {
		return nil
	}
	return r.client.Close()
}

// Cache key generators
func (r *RedisClient) GetDashboardKey(userID string) string {
	return fmt.Sprintf("dashboard:%s", userID)
}

func (r *RedisClient) GetProductsKey(traderID string) string {
	return fmt.Sprintf("products:trader:%s", traderID)
}

func (r *RedisClient) GetAnalyticsKey(traderID string) string {
	return fmt.Sprintf("analytics:trader:%s", traderID)
}

func (r *RedisClient) GetWeatherKey(location string) string {
	return fmt.Sprintf("weather:%s", location)
}

func (r *RedisClient) GetMarketDataKey(product string) string {
	return fmt.Sprintf("market:%s", product)
}

func (r *RedisClient) GetUserKey(userID string) string {
	return fmt.Sprintf("user:%s", userID)
}
