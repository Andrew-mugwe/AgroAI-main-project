import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';

interface CachedDataOptions {
  staleTime?: number; // Time in ms before data is considered stale
  cacheTime?: number; // Time in ms to keep data in cache
  retryCount?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in ms
}

interface CachedDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: number | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

export function useCachedData<T>(
  url: string,
  options: CachedDataOptions = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 30 * 60 * 1000, // 30 minutes
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<CachedDataState<T>>({
    data: null,
    loading: true,
    error: null,
    isStale: false,
    lastUpdated: null,
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    // Check if we have valid cached data
    if (!forceRefresh && cached) {
      const isStale = now - cached.timestamp > cached.staleTime;
      const isExpired = now - cached.timestamp > cacheTime;

      if (!isExpired) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          loading: false,
          error: null,
          isStale,
          lastUpdated: cached.timestamp,
        }));

        // If data is stale, fetch in background
        if (isStale) {
          fetchData(true);
        }
        return;
      } else {
        // Remove expired cache
        cache.delete(cacheKey);
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    let attempts = 0;
    while (attempts < retryCount) {
      try {
        const response: AxiosResponse<T> = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        const data = response.data;
        const timestamp = now;

        // Update cache
        cache.set(cacheKey, {
          data,
          timestamp,
          staleTime,
        });

        setState({
          data,
          loading: false,
          error: null,
          isStale: false,
          lastUpdated: timestamp,
        });

        return;
      } catch (error: any) {
        attempts++;
        
        if (attempts >= retryCount) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to fetch data',
          }));
          return;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
      }
    }
  }, [url, staleTime, cacheTime, retryCount, retryDelay]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(url);
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null,
    }));
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
    clearCache,
  };
}

// Hook for dashboard data with caching
export function useDashboardData(userId: string) {
  return useCachedData(`/api/user/dashboard`, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for trader products with caching
export function useTraderProducts(traderId: string, filters?: { category?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  
  const url = `/api/trader/products${params.toString() ? `?${params.toString()}` : ''}`;
  
  return useCachedData(url, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for analytics with caching
export function useAnalytics(traderId: string) {
  return useCachedData(`/api/trader/analytics`, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Utility to clear all cache
export function clearAllCache() {
  cache.clear();
}

// Utility to get cache stats
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  return {
    totalEntries: entries.length,
    staleEntries: entries.filter(([_, value]) => now - value.timestamp > value.staleTime).length,
    expiredEntries: entries.filter(([_, value]) => now - value.timestamp > 30 * 60 * 1000).length,
  };
}
