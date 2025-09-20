package tests

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/Andrew-mugwe/agroai/services/cache"
	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestRedisClient represents a test Redis client
type TestRedisClient struct {
	client *redis.Client
	ctx    context.Context
}

// SetupTestRedis creates a test Redis client
func SetupTestRedis(t *testing.T) *TestRedisClient {
	// Use test Redis instance
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       1, // Use test database
	})

	ctx := context.Background()

	// Test connection
	_, err := client.Ping(ctx).Result()
	require.NoError(t, err, "Failed to connect to test Redis")

	// Clear test database
	err = client.FlushDB(ctx).Err()
	require.NoError(t, err, "Failed to clear test database")

	return &TestRedisClient{
		client: client,
		ctx:    ctx,
	}
}

// CleanupTestRedis cleans up test Redis
func (trc *TestRedisClient) CleanupTestRedis(t *testing.T) {
	err := trc.client.FlushDB(trc.ctx).Err()
	require.NoError(t, err, "Failed to cleanup test Redis")
	
	err = trc.client.Close()
	require.NoError(t, err, "Failed to close test Redis client")
}

func TestRedisCache_SetAndGet(t *testing.T) {
	// Set environment variables for test
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	testData := map[string]interface{}{
		"user_id": "123",
		"name":    "Test User",
		"role":    "farmer",
	}

	// Test SetCache
	err = redisClient.SetCache("test:user:123", testData, 5*time.Minute)
	assert.NoError(t, err, "SetCache should not return error")

	// Test GetCache
	var result map[string]interface{}
	cacheResult := redisClient.GetCache("test:user:123", &result)
	
	assert.True(t, cacheResult.Hit, "Cache should be a hit")
	assert.NoError(t, cacheResult.Error, "Cache result should not have error")
	assert.Equal(t, testData["user_id"], result["user_id"], "User ID should match")
	assert.Equal(t, testData["name"], result["name"], "Name should match")
	assert.Equal(t, testData["role"], result["role"], "Role should match")
}

func TestRedisCache_CacheMiss(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	// Test GetCache with non-existent key
	var result map[string]interface{}
	cacheResult := redisClient.GetCache("test:nonexistent", &result)
	
	assert.False(t, cacheResult.Hit, "Cache should be a miss")
	assert.Error(t, cacheResult.Error, "Cache result should have error")
	assert.Nil(t, cacheResult.Value, "Cache value should be nil")
}

func TestRedisCache_ExpiredKey(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	testData := map[string]interface{}{
		"expires": "soon",
	}

	// Set cache with very short TTL
	err = redisClient.SetCache("test:expired", testData, 100*time.Millisecond)
	assert.NoError(t, err, "SetCache should not return error")

	// Wait for expiration
	time.Sleep(200 * time.Millisecond)

	// Try to get expired key
	var result map[string]interface{}
	cacheResult := redisClient.GetCache("test:expired", &result)
	
	assert.False(t, cacheResult.Hit, "Expired cache should be a miss")
	assert.Error(t, cacheResult.Error, "Expired cache should have error")
}

func TestRedisCache_DeleteCache(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	testData := map[string]interface{}{
		"to_delete": true,
	}

	// Set cache
	err = redisClient.SetCache("test:delete", testData, 5*time.Minute)
	assert.NoError(t, err, "SetCache should not return error")

	// Verify it exists
	var result map[string]interface{}
	cacheResult := redisClient.GetCache("test:delete", &result)
	assert.True(t, cacheResult.Hit, "Cache should exist before deletion")

	// Delete cache
	err = redisClient.DeleteCache("test:delete")
	assert.NoError(t, err, "DeleteCache should not return error")

	// Verify it's deleted
	cacheResult = redisClient.GetCache("test:delete", &result)
	assert.False(t, cacheResult.Hit, "Cache should not exist after deletion")
}

func TestRedisCache_DeletePattern(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	// Set multiple keys with pattern
	keys := []string{
		"test:pattern:1",
		"test:pattern:2",
		"test:pattern:3",
		"test:other:1",
	}

	for i, key := range keys {
		data := map[string]interface{}{"index": i}
		err = redisClient.SetCache(key, data, 5*time.Minute)
		assert.NoError(t, err, "SetCache should not return error")
	}

	// Delete pattern
	err = redisClient.DeletePattern("test:pattern:*")
	assert.NoError(t, err, "DeletePattern should not return error")

	// Verify pattern keys are deleted
	var result map[string]interface{}
	for i := 1; i <= 3; i++ {
		cacheResult := redisClient.GetCache(fmt.Sprintf("test:pattern:%d", i), &result)
		assert.False(t, cacheResult.Hit, "Pattern keys should be deleted")
	}

	// Verify other key still exists
	cacheResult := redisClient.GetCache("test:other:1", &result)
	assert.True(t, cacheResult.Hit, "Non-pattern key should still exist")
}

func TestRedisCache_GetOrSet(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	callCount := 0
	fallbackFunc := func() (interface{}, error) {
		callCount++
		return map[string]interface{}{
			"generated": true,
			"call_count": callCount,
		}, nil
	}

	// First call - should execute fallback
	var result map[string]interface{}
	err = redisClient.GetOrSet("test:getorset", &result, fallbackFunc, 5*time.Minute)
	assert.NoError(t, err, "GetOrSet should not return error")
	assert.Equal(t, 1, callCount, "Fallback should be called once")
	assert.True(t, result["generated"].(bool), "Result should be generated")

	// Second call - should use cache
	var result2 map[string]interface{}
	err = redisClient.GetOrSet("test:getorset", &result2, fallbackFunc, 5*time.Minute)
	assert.NoError(t, err, "GetOrSet should not return error")
	assert.Equal(t, 1, callCount, "Fallback should not be called again")
	assert.Equal(t, result["call_count"], result2["call_count"], "Results should be identical")
}

func TestRedisCache_Disabled(t *testing.T) {
	os.Setenv("CACHE_ENABLED", "false")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Should create disabled Redis client")

	// Test operations with disabled cache
	err = redisClient.SetCache("test:disabled", "value", 5*time.Minute)
	assert.NoError(t, err, "SetCache should not error when disabled")

	var result string
	cacheResult := redisClient.GetCache("test:disabled", &result)
	assert.False(t, cacheResult.Hit, "GetCache should always miss when disabled")
	assert.Error(t, cacheResult.Error, "GetCache should return error when disabled")

	err = redisClient.DeleteCache("test:disabled")
	assert.NoError(t, err, "DeleteCache should not error when disabled")
}

func TestRedisCache_Stats(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	stats, err := redisClient.GetStats()
	assert.NoError(t, err, "GetStats should not return error")
	assert.True(t, stats["enabled"].(bool), "Cache should be enabled")
	assert.Equal(t, "connected", stats["status"], "Status should be connected")
	assert.Equal(t, 1, stats["db"], "Should use test database")
}

func TestRedisCache_KeyGenerators(t *testing.T) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	require.NoError(t, err, "Failed to create Redis client")

	// Test key generators
	assert.Equal(t, "dashboard:123", redisClient.GetDashboardKey("123"))
	assert.Equal(t, "products:trader:456", redisClient.GetProductsKey("456"))
	assert.Equal(t, "analytics:trader:789", redisClient.GetAnalyticsKey("789"))
	assert.Equal(t, "weather:london", redisClient.GetWeatherKey("london"))
	assert.Equal(t, "market:corn", redisClient.GetMarketDataKey("corn"))
	assert.Equal(t, "user:999", redisClient.GetUserKey("999"))
}
