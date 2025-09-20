package services

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

// CacheService handles Redis caching operations
type CacheService struct {
	client *redis.Client
	ctx    context.Context
}

// CacheConfig holds cache configuration
type CacheConfig struct {
	URL     string
	TTL     time.Duration
	Enabled bool
}

// NewCacheService creates a new cache service instance
func NewCacheService() (*CacheService, error) {
	config := getCacheConfig()

	if !config.Enabled {
		log.Println("Cache service disabled")
		return &CacheService{client: nil, ctx: context.Background()}, nil
	}

	opt, err := redis.ParseURL(config.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %v", err)
	}

	client := redis.NewClient(opt)
	ctx := context.Background()

	// Test connection
	_, err = client.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %v", err)
	}

	log.Println("Redis cache service initialized successfully")
	return &CacheService{
		client: client,
		ctx:    ctx,
	}, nil
}

// getCacheConfig retrieves cache configuration from environment variables
func getCacheConfig() CacheConfig {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		url = "redis://localhost:6379"
	}

	ttlStr := os.Getenv("CACHE_TTL")
	ttl := 300 * time.Second // Default 5 minutes
	if ttlStr != "" {
		if ttlInt, err := strconv.Atoi(ttlStr); err == nil {
			ttl = time.Duration(ttlInt) * time.Second
		}
	}

	enabled := os.Getenv("CACHE_ENABLED") != "false"

	return CacheConfig{
		URL:     url,
		TTL:     ttl,
		Enabled: enabled,
	}
}

// SetCache stores a value in cache with TTL
func (c *CacheService) SetCache(key string, value interface{}, ttl time.Duration) error {
	if c.client == nil {
		return nil // Cache disabled
	}

	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal cache value: %v", err)
	}

	if ttl == 0 {
		ttl = 300 * time.Second // Default TTL
	}

	err = c.client.Set(c.ctx, key, data, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to set cache: %v", err)
	}

	log.Printf("Cache SET: %s (TTL: %v)", key, ttl)
	return nil
}

// GetCache retrieves a value from cache
func (c *CacheService) GetCache(key string, dest interface{}) error {
	if c.client == nil {
		return redis.Nil // Cache disabled
	}

	data, err := c.client.Get(c.ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			log.Printf("Cache MISS: %s", key)
		} else {
			log.Printf("Cache ERROR: %s - %v", key, err)
		}
		return err
	}

	err = json.Unmarshal([]byte(data), dest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal cache value: %v", err)
	}

	log.Printf("Cache HIT: %s", key)
	return nil
}

// DeleteCache removes a value from cache
func (c *CacheService) DeleteCache(key string) error {
	if c.client == nil {
		return nil // Cache disabled
	}

	err := c.client.Del(c.ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete cache: %v", err)
	}

	log.Printf("Cache DELETE: %s", key)
	return nil
}

// DeletePattern removes all keys matching a pattern
func (c *CacheService) DeletePattern(pattern string) error {
	if c.client == nil {
		return nil // Cache disabled
	}

	keys, err := c.client.Keys(c.ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed to get keys for pattern %s: %v", pattern, err)
	}

	if len(keys) > 0 {
		err = c.client.Del(c.ctx, keys...).Err()
		if err != nil {
			return fmt.Errorf("failed to delete keys for pattern %s: %v", pattern, err)
		}
		log.Printf("Cache DELETE PATTERN: %s (%d keys)", pattern, len(keys))
	}

	return nil
}

// GetStats returns cache statistics
func (c *CacheService) GetStats() (map[string]interface{}, error) {
	if c.client == nil {
		return map[string]interface{}{
			"enabled": false,
			"status":  "disabled",
		}, nil
	}

	info, err := c.client.Info(c.ctx, "stats").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get Redis stats: %v", err)
	}

	stats := map[string]interface{}{
		"enabled": true,
		"status":  "connected",
		"info":    info,
	}

	return stats, nil
}

// Close closes the Redis connection
func (c *CacheService) Close() error {
	if c.client == nil {
		return nil
	}
	return c.client.Close()
}

// Cache key generators
func (c *CacheService) GetDashboardKey(userID string) string {
	return fmt.Sprintf("dashboard:%s", userID)
}

func (c *CacheService) GetProductsKey(traderID string) string {
	return fmt.Sprintf("products:trader:%s", traderID)
}

func (c *CacheService) GetAnalyticsKey(traderID string) string {
	return fmt.Sprintf("analytics:trader:%s", traderID)
}

func (c *CacheService) GetUserKey(userID string) string {
	return fmt.Sprintf("user:%s", userID)
}
