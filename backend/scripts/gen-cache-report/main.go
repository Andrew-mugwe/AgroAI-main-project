package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/Andrew-mugwe/agroai/tests"
)

// ReportTemplate holds the markdown template for the cache report
const reportTemplate = `# AgroAI Cache Benchmark Report

**Generated:** %s
**Environment:** %s

## Performance Summary

| Metric | Value |
|--------|-------|
| Average DB Fetch Time | %v |
| Average Cache Fetch Time | %v |
| Performance Improvement | %.1f%% |
| Cache Hit Rate | %.1f%% |
| Total Operations | %d |

## Detailed Results

### Scenario Breakdown

%s

## Analysis

%s

## Recommendations

%s

---
*Report generated automatically by AgroAI Cache Benchmark System*
`

func main() {
	fmt.Println("🚀 Starting Cache Performance Report Generation")

	// Run benchmarks
	fmt.Println("📊 Running cache benchmarks...")
	report, err := tests.RunCacheBenchmark()
	if err != nil {
		log.Fatalf("Failed to run benchmarks: %v", err)
	}

	// Generate markdown report
	fmt.Println("📝 Generating markdown report...")
	markdown := generateMarkdownReport(report)

	// Save report
	reportPath := "CACHE_REPORT.md"
	err = os.WriteFile(reportPath, []byte(markdown), 0644)
	if err != nil {
		log.Fatalf("Failed to write report: %v", err)
	}

	// Save JSON results
	jsonPath := "cache_benchmark_results.json"
	jsonData, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal JSON: %v", err)
	}

	err = os.WriteFile(jsonPath, jsonData, 0644)
	if err != nil {
		log.Fatalf("Failed to write JSON results: %v", err)
	}

	// Print summary
	fmt.Println("\n✅ Cache Report Generation Completed!")
	fmt.Printf("📄 Report saved to: %s\n", reportPath)
	fmt.Printf("📊 JSON results saved to: %s\n", jsonPath)
	fmt.Printf("📈 Performance Improvement: %.1f%%\n", report.Summary.Improvement)
	fmt.Printf("⚡ Cache Hit Rate: %.1f%%\n", report.Summary.CacheHitRate)

	// Print performance summary
	if report.Summary.Improvement > 80 {
		fmt.Println("🎉 Excellent cache performance!")
	} else if report.Summary.Improvement > 50 {
		fmt.Println("👍 Good cache performance")
	} else if report.Summary.Improvement > 20 {
		fmt.Println("⚠️  Moderate cache performance - consider optimization")
	} else {
		fmt.Println("❌ Poor cache performance - requires investigation")
	}
}

// generateMarkdownReport creates a markdown report from benchmark results
func generateMarkdownReport(report *tests.BenchmarkReport) string {
	// Generate scenario breakdown
	scenarioTable := generateScenarioTable(report.Results)

	// Generate analysis
	analysis := generateAnalysis(report.Summary)

	// Generate recommendations
	recommendations := generateRecommendations(report.Summary)

	// Format the report
	markdown := fmt.Sprintf(reportTemplate,
		report.Timestamp.Format("2006-01-02 15:04:05 UTC"),
		report.Environment,
		report.Summary.AvgDBFetchTime,
		report.Summary.AvgCacheFetchTime,
		report.Summary.Improvement,
		report.Summary.CacheHitRate,
		report.Summary.TotalOperations,
		scenarioTable,
		analysis,
		recommendations,
	)

	return markdown
}

// generateScenarioTable creates a markdown table of scenario results
func generateScenarioTable(results []tests.BenchmarkResult) string {
	table := "| Scenario | Operation | Duration | Data Size | Iterations |\n"
	table += "|----------|-----------|----------|-----------|------------|\n"

	// Group results by scenario
	scenarios := make(map[string][]tests.BenchmarkResult)
	for _, result := range results {
		scenario := extractScenarioName(result.Operation)
		scenarios[scenario] = append(scenarios[scenario], result)
	}

	for scenario, scenarioResults := range scenarios {
		for _, result := range scenarioResults {
			operation := extractOperationType(result.Operation)
			table += fmt.Sprintf("| %s | %s | %v | %d bytes | %d |\n",
				scenario, operation, result.Duration, result.DataSize, result.Iterations)
		}
	}

	return table
}

// generateAnalysis creates analysis text based on benchmark results
func generateAnalysis(summary tests.BenchmarkSummary) string {
	analysis := ""

	// Performance analysis
	if summary.Improvement > 90 {
		analysis += "🎉 **Outstanding Performance**: Cache implementation shows exceptional performance with over 90% improvement over database queries.\n\n"
	} else if summary.Improvement > 70 {
		analysis += "👍 **Excellent Performance**: Cache implementation provides significant performance benefits with over 70% improvement.\n\n"
	} else if summary.Improvement > 50 {
		analysis += "✅ **Good Performance**: Cache implementation shows solid performance improvements.\n\n"
	} else if summary.Improvement > 20 {
		analysis += "⚠️ **Moderate Performance**: Cache provides some benefits but may need optimization.\n\n"
	} else {
		analysis += "❌ **Poor Performance**: Cache implementation shows minimal benefits and requires investigation.\n\n"
	}

	// Cache hit rate analysis
	if summary.CacheHitRate > 95 {
		analysis += "🔥 **Excellent Cache Hit Rate**: Cache is highly effective with over 95% hit rate.\n\n"
	} else if summary.CacheHitRate > 80 {
		analysis += "✅ **Good Cache Hit Rate**: Cache is performing well with over 80% hit rate.\n\n"
	} else if summary.CacheHitRate > 60 {
		analysis += "⚠️ **Moderate Cache Hit Rate**: Cache hit rate could be improved.\n\n"
	} else {
		analysis += "❌ **Low Cache Hit Rate**: Cache effectiveness is low and needs optimization.\n\n"
	}

	// Response time analysis
	if summary.AvgCacheFetchTime < 1*time.Millisecond {
		analysis += "⚡ **Ultra-Fast Cache**: Cache responses are extremely fast, providing near-instant data access.\n\n"
	} else if summary.AvgCacheFetchTime < 5*time.Millisecond {
		analysis += "🚀 **Fast Cache**: Cache responses are very fast, providing excellent user experience.\n\n"
	} else if summary.AvgCacheFetchTime < 10*time.Millisecond {
		analysis += "✅ **Good Cache Speed**: Cache responses are reasonably fast.\n\n"
	} else {
		analysis += "⚠️ **Slow Cache**: Cache responses are slower than expected and may need optimization.\n\n"
	}

	return analysis
}

// generateRecommendations creates recommendations based on benchmark results
func generateRecommendations(summary tests.BenchmarkSummary) string {
	recommendations := ""

	// Performance recommendations
	if summary.Improvement < 50 {
		recommendations += "- 🔧 **Optimize Cache Strategy**: Consider implementing more aggressive caching policies\n"
		recommendations += "- 📊 **Review Cache Keys**: Ensure cache keys are properly designed for maximum hit rates\n"
		recommendations += "- ⏰ **Adjust TTL Settings**: Review and optimize cache expiration times\n"
	}

	// Hit rate recommendations
	if summary.CacheHitRate < 80 {
		recommendations += "- 🎯 **Improve Cache Warming**: Implement cache warming strategies for frequently accessed data\n"
		recommendations += "- 🔄 **Review Cache Invalidation**: Ensure cache invalidation is not too aggressive\n"
		recommendations += "- 📈 **Monitor Cache Patterns**: Analyze access patterns to optimize cache usage\n"
	}

	// Speed recommendations
	if summary.AvgCacheFetchTime > 5*time.Millisecond {
		recommendations += "- ⚡ **Optimize Redis Configuration**: Review Redis configuration for better performance\n"
		recommendations += "- 🌐 **Consider Redis Clustering**: Implement Redis clustering for better scalability\n"
		recommendations += "- 💾 **Review Data Serialization**: Optimize data serialization/deserialization\n"
	}

	// General recommendations
	recommendations += "- 📊 **Implement Monitoring**: Set up comprehensive cache monitoring and alerting\n"
	recommendations += "- 🔍 **Regular Benchmarking**: Schedule regular performance benchmarks\n"
	recommendations += "- 📚 **Documentation**: Maintain up-to-date cache documentation and best practices\n"

	// Success recommendations
	if summary.Improvement > 70 && summary.CacheHitRate > 80 {
		recommendations += "- 🎉 **Scale Implementation**: Consider expanding cache usage to more endpoints\n"
		recommendations += "- 🚀 **Production Ready**: Cache implementation is ready for production deployment\n"
	}

	return recommendations
}

// extractScenarioName extracts scenario name from operation name
func extractScenarioName(operation string) string {
	// Example: "Database_Small Data" -> "Small Data"
	if len(operation) > 9 {
		return operation[9:]
	}
	return operation
}

// extractOperationType extracts operation type from operation name
func extractOperationType(operation string) string {
	// Example: "Database_Small Data" -> "Database"
	if len(operation) > 0 {
		for i, char := range operation {
			if char == '_' {
				return operation[:i]
			}
		}
	}
	return operation
}

// ensureDirectoryExists creates directory if it doesn't exist
func ensureDirectoryExists(path string) error {
	dir := filepath.Dir(path)
	return os.MkdirAll(dir, 0755)
}
