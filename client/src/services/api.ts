// Production-ready API client - Enhanced with retry logic, error handling, and performance monitoring
import { apiClient } from './apiClient'

// Export the production-ready API client
export { apiClient as api }

// Export types for backward compatibility
export type { ApiError } from './apiClient'