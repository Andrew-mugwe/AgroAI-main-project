package tests

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/Andrew-mugwe/agroai/services/cache"
)

// BenchmarkResult holds benchmark statistics
type BenchmarkResult struct {
	Operation  string        `json:"operation"`
	Duration   time.Duration `json:"duration"`
	CacheHit   bool          `json:"cache_hit,omitempty"`
	DataSize   int           `json:"data_size"`
	Iterations int           `json:"iterations"`
}

// BenchmarkReport holds the complete benchmark report
type BenchmarkReport struct {
	Timestamp   time.Time         `json:"timestamp"`
	Environment string            `json:"environment"`
	Results     []BenchmarkResult `json:"results"`
	Summary     BenchmarkSummary  `json:"summary"`
}

// BenchmarkSummary holds summary statistics
type BenchmarkSummary struct {
	AvgDBFetchTime    time.Duration `json:"avg_db_fetch_time"`
	AvgCacheFetchTime time.Duration `json:"avg_cache_fetch_time"`
	Improvement       float64       `json:"improvement_percent"`
	CacheHitRate      float64       `json:"cache_hit_rate"`
	TotalOperations   int           `json:"total_operations"`
}

// MockData represents test data for benchmarking
type MockData struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Data       map[string]interface{} `json:"data"`
	Timestamp  time.Time              `json:"timestamp"`
	LargeField string                 `json:"large_field"`
}

// generateMockData creates mock data for testing
func generateMockData(id string, size int) MockData {
	largeField := ""
	for i := 0; i < size; i++ {
		largeField += "x"
	}

	return MockData{
		ID:        id,
		Name:      fmt.Sprintf("Test Item %s", id),
		Timestamp: time.Now(),
		Data: map[string]interface{}{
			"category": "test",
			"value":    42,
			"active":   true,
		},
		LargeField: largeField,
	}
}

// mockDatabaseFetch simulates a database fetch operation
func mockDatabaseFetch(id string, delay time.Duration) (MockData, error) {
	time.Sleep(delay) // Simulate database latency
	return generateMockData(id, 1000), nil
}

// BenchmarkCacheSet benchmarks cache set operations
func BenchmarkCacheSet(b *testing.B) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	if err != nil {
		b.Fatalf("Failed to create Redis client: %v", err)
	}
	defer redisClient.Close()

	testData := generateMockData("benchmark", 1000)

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			key := fmt.Sprintf("benchmark:set:%d", i)
			err := redisClient.SetCache(key, testData, 5*time.Minute)
			if err != nil {
				b.Errorf("SetCache failed: %v", err)
			}
			i++
		}
	})
}

// BenchmarkCacheGet benchmarks cache get operations
func BenchmarkCacheGet(b *testing.B) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	if err != nil {
		b.Fatalf("Failed to create Redis client: %v", err)
	}
	defer redisClient.Close()

	// Pre-populate cache
	testData := generateMockData("benchmark", 1000)
	for i := 0; i < 100; i++ {
		key := fmt.Sprintf("benchmark:get:%d", i)
		err := redisClient.SetCache(key, testData, 5*time.Minute)
		if err != nil {
			b.Fatalf("Failed to pre-populate cache: %v", err)
		}
	}

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			key := fmt.Sprintf("benchmark:get:%d", i%100)
			var result MockData
			cacheResult := redisClient.GetCache(key, &result)
			if !cacheResult.Hit {
				b.Errorf("Expected cache hit for key %s", key)
			}
			i++
		}
	})
}

// BenchmarkCacheGetOrSet benchmarks GetOrSet operations
func BenchmarkCacheGetOrSet(b *testing.B) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	if err != nil {
		b.Fatalf("Failed to create Redis client: %v", err)
	}
	defer redisClient.Close()

	// Simulate database latency
	dbDelay := 10 * time.Millisecond

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			key := fmt.Sprintf("benchmark:getorset:%d", i)
			var result MockData

			fallback := func() (interface{}, error) {
				return mockDatabaseFetch(fmt.Sprintf("db_%d", i), dbDelay)
			}

			err := redisClient.GetOrSet(key, &result, fallback, 5*time.Minute)
			if err != nil {
				b.Errorf("GetOrSet failed: %v", err)
			}
			i++
		}
	})
}

// BenchmarkDatabaseVsCache compares database vs cache performance
func BenchmarkDatabaseVsCache(b *testing.B) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	if err != nil {
		b.Fatalf("Failed to create Redis client: %v", err)
	}
	defer redisClient.Close()

	// Simulate realistic database latency
	dbDelay := 50 * time.Millisecond

	// Benchmark database fetch
	b.Run("DatabaseFetch", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			_, err := mockDatabaseFetch(fmt.Sprintf("db_%d", i), dbDelay)
			if err != nil {
				b.Errorf("Database fetch failed: %v", err)
			}
		}
	})

	// Benchmark cache fetch (after warming)
	b.Run("CacheFetch", func(b *testing.B) {
		// Warm up cache
		for i := 0; i < 100; i++ {
			key := fmt.Sprintf("benchmark:cache:%d", i)
			fallback := func() (interface{}, error) {
				return mockDatabaseFetch(fmt.Sprintf("cache_%d", i), dbDelay)
			}
			var result MockData
			redisClient.GetOrSet(key, &result, fallback, 5*time.Minute)
		}

		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			key := fmt.Sprintf("benchmark:cache:%d", i%100)
			var result MockData
			cacheResult := redisClient.GetCache(key, &result)
			if !cacheResult.Hit {
				b.Errorf("Expected cache hit for key %s", key)
			}
		}
	})
}

// RunCacheBenchmark runs comprehensive cache benchmarks
func RunCacheBenchmark() (*BenchmarkReport, error) {
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	os.Setenv("CACHE_ENABLED", "true")
	defer os.Unsetenv("REDIS_URL")
	defer os.Unsetenv("CACHE_ENABLED")

	redisClient, err := cache.NewRedisClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %v", err)
	}
	defer redisClient.Close()

	report := &BenchmarkReport{
		Timestamp:   time.Now(),
		Environment: "test",
		Results:     []BenchmarkResult{},
	}

	// Test scenarios
	scenarios := []struct {
		name       string
		iterations int
		dbDelay    time.Duration
		dataSize   int
	}{
		{"Small Data", 100, 10 * time.Millisecond, 100},
		{"Medium Data", 100, 25 * time.Millisecond, 1000},
		{"Large Data", 50, 50 * time.Millisecond, 5000},
	}

	for _, scenario := range scenarios {
		log.Printf("Running benchmark scenario: %s", scenario.name)

		// Test database fetch
		dbStart := time.Now()
		for i := 0; i < scenario.iterations; i++ {
			_, err := mockDatabaseFetch(fmt.Sprintf("db_%s_%d", scenario.name, i), scenario.dbDelay)
			if err != nil {
				return nil, fmt.Errorf("database fetch failed: %v", err)
			}
		}
		dbDuration := time.Since(dbStart) / time.Duration(scenario.iterations)

		// Test cache operations
		cacheHits := 0
		cacheStart := time.Now()

		// First pass - cache misses (populate cache)
		for i := 0; i < scenario.iterations; i++ {
			key := fmt.Sprintf("benchmark:%s:%d", scenario.name, i)
			fallback := func() (interface{}, error) {
				return mockDatabaseFetch(fmt.Sprintf("cache_%s_%d", scenario.name, i), scenario.dbDelay)
			}
			var result MockData
			err := redisClient.GetOrSet(key, &result, fallback, 5*time.Minute)
			if err != nil {
				return nil, fmt.Errorf("cache operation failed: %v", err)
			}
		}

		// Second pass - cache hits
		for i := 0; i < scenario.iterations; i++ {
			key := fmt.Sprintf("benchmark:%s:%d", scenario.name, i)
			var result MockData
			cacheResult := redisClient.GetCache(key, &result)
			if cacheResult.Hit {
				cacheHits++
			}
		}
		cacheDuration := time.Since(cacheStart) / time.Duration(scenario.iterations*2)

		// Calculate improvement
		improvement := float64(dbDuration-cacheDuration) / float64(dbDuration) * 100

		// Add results
		report.Results = append(report.Results, BenchmarkResult{
			Operation:  fmt.Sprintf("Database_%s", scenario.name),
			Duration:   dbDuration,
			DataSize:   scenario.dataSize,
			Iterations: scenario.iterations,
		})

		report.Results = append(report.Results, BenchmarkResult{
			Operation:  fmt.Sprintf("Cache_%s", scenario.name),
			Duration:   cacheDuration,
			CacheHit:   true,
			DataSize:   scenario.dataSize,
			Iterations: scenario.iterations,
		})

		log.Printf("Scenario %s: DB=%v, Cache=%v, Improvement=%.1f%%",
			scenario.name, dbDuration, cacheDuration, improvement)
	}

	// Calculate summary
	report.Summary = calculateSummary(report.Results)

	return report, nil
}

// calculateSummary calculates summary statistics
func calculateSummary(results []BenchmarkResult) BenchmarkSummary {
	var dbTimes, cacheTimes []time.Duration
	var totalCacheHits, totalOperations int

	for _, result := range results {
		totalOperations++
		if result.CacheHit {
			cacheTimes = append(cacheTimes, result.Duration)
			totalCacheHits++
		} else {
			dbTimes = append(dbTimes, result.Duration)
		}
	}

	// Calculate averages
	var avgDB, avgCache time.Duration
	if len(dbTimes) > 0 {
		var total time.Duration
		for _, t := range dbTimes {
			total += t
		}
		avgDB = total / time.Duration(len(dbTimes))
	}

	if len(cacheTimes) > 0 {
		var total time.Duration
		for _, t := range cacheTimes {
			total += t
		}
		avgCache = total / time.Duration(len(cacheTimes))
	}

	// Calculate improvement
	var improvement float64
	if avgDB > 0 {
		improvement = float64(avgDB-avgCache) / float64(avgDB) * 100
	}

	// Calculate cache hit rate
	var hitRate float64
	if totalOperations > 0 {
		hitRate = float64(totalCacheHits) / float64(totalOperations) * 100
	}

	return BenchmarkSummary{
		AvgDBFetchTime:    avgDB,
		AvgCacheFetchTime: avgCache,
		Improvement:       improvement,
		CacheHitRate:      hitRate,
		TotalOperations:   totalOperations,
	}
}

// TestCacheBenchmark runs the benchmark as a test
func TestCacheBenchmark(t *testing.T) {
	report, err := RunCacheBenchmark()
	if err != nil {
		t.Fatalf("Benchmark should complete successfully: %v", err)
	}

	// Save report to file
	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		t.Fatalf("Should marshal report to JSON: %v", err)
	}

	err = os.WriteFile("cache_benchmark_results.json", data, 0644)
	if err != nil {
		t.Fatalf("Should write benchmark results to file: %v", err)
	}

	t.Logf("Benchmark completed successfully")
	t.Logf("Average DB fetch time: %v", report.Summary.AvgDBFetchTime)
	t.Logf("Average cache fetch time: %v", report.Summary.AvgCacheFetchTime)
	t.Logf("Improvement: %.1f%%", report.Summary.Improvement)
	t.Logf("Cache hit rate: %.1f%%", report.Summary.CacheHitRate)
}
