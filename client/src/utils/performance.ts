import { useEffect, useCallback, useRef } from 'react'

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  slowThreshold: 200, // ms
  verySlowThreshold: 1000, // ms
  logLevel: (import.meta as any).env?.DEV ? 'warn' : 'error',
}

// Custom hook for monitoring component render time
export const useRenderTimer = (componentName: string) => {
  const startTime = useRef(performance.now())

  useEffect(() => {
    const renderTime = performance.now() - startTime.current
    if (renderTime > PERFORMANCE_CONFIG.verySlowThreshold) {
      console.error(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render!`)
    } else if (renderTime > PERFORMANCE_CONFIG.slowThreshold) {
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`)
    }
  })
}

// Hook for debouncing expensive operations
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

// Hook for tracking API call performance
export const useApiPerformance = () => {
  const trackApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options: {
        name: string
        timeout?: number
      }
    ): Promise<T> => {
      const start = performance.now()
      try {
        const timeoutPromise = new Promise((_, reject) => {
          if (options.timeout) {
            setTimeout(() => {
              reject(new Error(`API call ${options.name} timed out`))
            }, options.timeout)
          }
        })

        const result = await Promise.race([apiCall(), timeoutPromise])
        const duration = performance.now() - start

        if (duration > PERFORMANCE_CONFIG.slowThreshold) {
          console.warn(
            `[API Performance] ${options.name} took ${duration.toFixed(2)}ms`
          )
        }

        return result as T
      } catch (error) {
        const duration = performance.now() - start
        console.error(
          `[API Performance] ${options.name} failed after ${duration.toFixed(2)}ms`,
          error
        )
        throw error
      }
    },
    []
  )

  return { trackApiCall }
}

// Utility for measuring component update causes
export const measureRerender = (
  prevProps: any,
  nextProps: any,
  componentName: string
) => {
  const changes: string[] = []
  Object.keys(nextProps).forEach(key => {
    if (prevProps[key] !== nextProps[key]) {
      changes.push(key)
    }
  })

  if (changes.length > 0) {
    console.log(
      `[Rerender] ${componentName} rerendered due to prop changes:`,
      changes
    )
  }
  return changes.length > 0
}

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback()
          if (targetRef.current) {
            observer.unobserve(targetRef.current)
          }
        }
      })
    }, options)

    if (targetRef.current) {
      observer.observe(targetRef.current)
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current)
      }
    }
  }, [callback, options])

  return targetRef
}
