# AgroAI Caching System

## Overview

The AgroAI platform implements a multi-layer caching system using Redis for backend caching and in-memory caching for frontend optimization.

## Backend Caching (Redis)

### Configuration

Environment variables:
```bash
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
CACHE_ENABLED=true
```

### Cache Service

The `CacheService` provides:
- `SetCache(key, value, ttl)` - Store data with TTL
- `GetCache(key, dest)` - Retrieve cached data
- `DeleteCache(key)` - Remove specific cache entry
- `DeletePattern(pattern)` - Remove multiple entries by pattern

### Cached Endpoints

1. **Dashboard Data** (`/api/user/dashboard`)
   - TTL: 5 minutes
   - Key: `dashboard:{userID}`
   - Cache invalidation: On user data changes

2. **Trader Products** (`/api/trader/products`)
   - TTL: 10 minutes
   - Key: `products:trader:{traderID}:category:{category}:status:{status}`
   - Cache invalidation: On product updates

3. **Analytics** (`/api/trader/analytics`)
   - TTL: 15 minutes
   - Key: `analytics:trader:{traderID}`
   - Cache invalidation: On new transactions

### Cache Headers

Responses include cache status headers:
- `X-Cache: HIT` - Data served from cache
- `X-Cache: MISS` - Data fetched from database

## Frontend Caching

### useCachedData Hook

Provides intelligent caching with:
- Stale-while-revalidate strategy
- Automatic retry on failure
- Background refresh for stale data
- Configurable TTL and retry settings

```typescript
const { data, loading, error, refresh } = useCachedData('/api/user/dashboard', {
  staleTime: 2 * 60 * 1000, // 2 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retryCount: 3,
});
```

### Shimmer Components

Loading states for cached responses:
- `DashboardShimmer` - Dashboard loading state
- `TableShimmer` - Table loading state
- `CardShimmer` - Card loading state
- `ListShimmer` - List loading state

## Performance Monitoring

### Benchmark Script

Run performance benchmarks:
```bash
cd backend
go run benchmark_cache.go
```

The script tests:
- Response times with/without cache
- Cache hit rates
- Performance improvements
- Generates detailed reports

### Cache Statistics

Monitor cache performance:
```typescript
import { getCacheStats } from './hooks/useCachedData';

const stats = getCacheStats();
console.log('Cache stats:', stats);
```

## Cache Invalidation

### Automatic Invalidation

- User data changes → Clear user cache
- Product updates → Clear product cache
- New transactions → Clear analytics cache

### Manual Invalidation

```typescript
// Clear specific cache
clearCache();

// Clear all cache
clearAllCache();
```

## Best Practices

### Backend

1. **Cache Key Strategy**
   - Use consistent naming: `{service}:{entity}:{id}`
   - Include query parameters in keys
   - Use versioning for breaking changes

2. **TTL Configuration**
   - Dashboard: 5 minutes (frequent updates)
   - Products: 10 minutes (moderate updates)
   - Analytics: 15 minutes (infrequent updates)

3. **Error Handling**
   - Cache failures shouldn't break requests
   - Log cache errors for monitoring
   - Graceful degradation

### Frontend

1. **Loading States**
   - Always show shimmer for cached data
   - Provide refresh options
   - Handle stale data gracefully

2. **Cache Strategy**
   - Use stale-while-revalidate
   - Background refresh for stale data
   - Retry failed requests

3. **User Experience**
   - Show cache status indicators
   - Provide manual refresh options
   - Handle offline scenarios

## Monitoring

### Metrics to Track

1. **Performance**
   - Response times (cached vs uncached)
   - Cache hit rates
   - Memory usage

2. **Reliability**
   - Cache errors
   - Failed retrievals
   - Timeout rates

3. **Business**
   - User engagement
   - Page load times
   - API usage patterns

### Tools

- Redis monitoring: `redis-cli info stats`
- Application metrics: Custom logging
- Performance: Benchmark script
- Frontend: Browser dev tools

## Troubleshooting

### Common Issues

1. **Cache Misses**
   - Check Redis connection
   - Verify cache keys
   - Review TTL settings

2. **Stale Data**
   - Check invalidation logic
   - Review TTL configuration
   - Verify cache updates

3. **Performance Issues**
   - Monitor Redis memory
   - Check network latency
   - Review cache patterns

### Debug Commands

```bash
# Check Redis connection
redis-cli ping

# View cache keys
redis-cli keys "*"

# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory
```

## Future Enhancements

1. **CDN Integration**
   - Cloudflare caching
   - Edge caching
   - Static asset caching

2. **Advanced Strategies**
   - Cache warming
   - Predictive caching
   - Distributed caching

3. **Monitoring**
   - Real-time dashboards
   - Alert systems
   - Performance analytics
