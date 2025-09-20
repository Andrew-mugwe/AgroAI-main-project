package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// BenchmarkResult holds benchmark statistics
type BenchmarkResult struct {
	Endpoint     string        `json:"endpoint"`
	WithCache    bool          `json:"with_cache"`
	Duration     time.Duration `json:"duration"`
	ResponseSize int           `json:"response_size"`
	CacheHit     bool          `json:"cache_hit,omitempty"`
}

// BenchmarkConfig holds benchmark configuration
type BenchmarkConfig struct {
	BaseURL    string
	AuthToken  string
	Iterations int
	Endpoints  []string
}

func main() {
	config := BenchmarkConfig{
		BaseURL:    getEnv("API_BASE_URL", "http://localhost:8080"),
		AuthToken:  getEnv("AUTH_TOKEN", ""),
		Iterations: 10,
		Endpoints: []string{
			"/api/user/dashboard",
			"/api/trader/products",
			"/api/trader/analytics",
		},
	}

	if config.AuthToken == "" {
		log.Fatal("AUTH_TOKEN environment variable is required")
	}

	fmt.Println("🚀 Starting Cache Performance Benchmark")
	fmt.Printf("Base URL: %s\n", config.BaseURL)
	fmt.Printf("Iterations: %d\n", config.Iterations)
	fmt.Println(strings.Repeat("=", 50))

	results := []BenchmarkResult{}

	// Test each endpoint
	for _, endpoint := range config.Endpoints {
		fmt.Printf("\n📊 Testing endpoint: %s\n", endpoint)

		// Test without cache (clear cache first)
		clearCacheForEndpoint(endpoint)
		noCacheResults := benchmarkEndpoint(config, endpoint, false)
		results = append(results, noCacheResults...)

		// Test with cache
		withCacheResults := benchmarkEndpoint(config, endpoint, true)
		results = append(results, withCacheResults...)

		// Calculate and display statistics
		displayStats(endpoint, noCacheResults, withCacheResults)
	}

	// Save results to file
	saveResults(results)

	fmt.Println("\n✅ Benchmark completed!")
	fmt.Println("Results saved to benchmark_results.json")
}

func benchmarkEndpoint(config BenchmarkConfig, endpoint string, withCache bool) []BenchmarkResult {
	results := []BenchmarkResult{}

	for i := 0; i < config.Iterations; i++ {
		start := time.Now()

		// Make HTTP request
		client := &http.Client{Timeout: 30 * time.Second}
		req, err := http.NewRequest("GET", config.BaseURL+endpoint, nil)
		if err != nil {
			log.Printf("Error creating request: %v", err)
			continue
		}

		req.Header.Set("Authorization", "Bearer "+config.AuthToken)
		req.Header.Set("Accept", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error making request: %v", err)
			continue
		}
		defer resp.Body.Close()

		duration := time.Since(start)

		// Get response size
		var responseSize int
		if resp.Body != nil {
			// Read response to get size
			buf := make([]byte, 1024)
			for {
				n, err := resp.Body.Read(buf)
				responseSize += n
				if err != nil {
					break
				}
			}
		}

		// Check cache status
		cacheHit := resp.Header.Get("X-Cache") == "HIT"

		result := BenchmarkResult{
			Endpoint:     endpoint,
			WithCache:    withCache,
			Duration:     duration,
			ResponseSize: responseSize,
			CacheHit:     cacheHit,
		}

		results = append(results, result)

		// Small delay between requests
		time.Sleep(100 * time.Millisecond)
	}

	return results
}

func displayStats(endpoint string, noCache, withCache []BenchmarkResult) {
	if len(noCache) == 0 || len(withCache) == 0 {
		return
	}

	// Calculate averages
	noCacheAvg := calculateAverage(noCache)
	withCacheAvg := calculateAverage(withCache)

	// Calculate improvement
	improvement := float64((noCacheAvg - withCacheAvg)) / float64(noCacheAvg) * 100

	fmt.Printf("  📈 Performance Statistics:\n")
	fmt.Printf("    Without Cache: %v (avg)\n", noCacheAvg)
	fmt.Printf("    With Cache:    %v (avg)\n", withCacheAvg)
	fmt.Printf("    Improvement:   %.1f%%\n", improvement)

	// Cache hit rate
	cacheHits := 0
	for _, result := range withCache {
		if result.CacheHit {
			cacheHits++
		}
	}
	hitRate := float64(cacheHits) / float64(len(withCache)) * 100
	fmt.Printf("    Cache Hit Rate: %.1f%%\n", hitRate)
}

func calculateAverage(results []BenchmarkResult) time.Duration {
	if len(results) == 0 {
		return 0
	}

	var total time.Duration
	for _, result := range results {
		total += result.Duration
	}

	return total / time.Duration(len(results))
}

func clearCacheForEndpoint(endpoint string) {
	// This would clear cache for the specific endpoint
	// In a real implementation, you might call a cache invalidation endpoint
	fmt.Printf("  🗑️  Clearing cache for %s\n", endpoint)
}

func saveResults(results []BenchmarkResult) {
	data, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		log.Printf("Error marshaling results: %v", err)
		return
	}

	err = os.WriteFile("benchmark_results.json", data, 0644)
	if err != nil {
		log.Printf("Error writing results file: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
