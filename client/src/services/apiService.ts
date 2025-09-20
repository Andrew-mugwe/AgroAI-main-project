// Comprehensive API Service using the production-ready API client
import { apiClient, type ApiError } from './apiClient'
import { getApiUrl, debugLog } from '../config/environment'
import toast from 'react-hot-toast'

// Generic API response wrapper
interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Generic API error
interface ApiServiceError extends ApiError {
  action?: string
  context?: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = getApiUrl()
    debugLog('API Service initialized with base URL:', this.baseUrl)
  }

  // Generic request wrapper with error handling
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<T> {
    try {
      debugLog(`API Request: ${method} ${endpoint}`, data)
      
      let response: T
      
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(endpoint, options)
          break
        case 'POST':
          response = await apiClient.post<T>(endpoint, data, options)
          break
        case 'PUT':
          response = await apiClient.put<T>(endpoint, data, options)
          break
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, data, options)
          break
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint, options)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      debugLog(`API Response: ${method} ${endpoint}`, response)
      return response
    } catch (error: any) {
      const apiError: ApiServiceError = {
        ...error,
        action: `${method} ${endpoint}`,
        context: 'ApiService.request',
      }
      
      debugLog(`API Error: ${method} ${endpoint}`, apiError)
      this.handleError(apiError)
      throw apiError
    }
  }

  private handleError(error: ApiServiceError) {
    // Don't show toast for authentication errors (handled by interceptor)
    if (error.status === 401) {
      return
    }

    // Don't show toast for network errors in development
    if (import.meta.env.DEV && error.code === 'NETWORK_ERROR') {
      console.warn('Network error in development:', error)
      return
    }

    // Show appropriate error message
    let message = error.message || 'An error occurred'
    
    if (error.status === 422) {
      message = 'Please check your input and try again'
    } else if (error.status === 429) {
      message = 'Too many requests. Please wait a moment and try again'
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later'
    }

    toast.error(message)
  }

  // Public API methods
  async get<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  async post<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data, options)
  }

  async put<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options)
  }

  async patch<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options)
  }

  async delete<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('DELETE', endpoint, options)
  }

  // Health check
  async healthCheck() {
    try {
      return await apiClient.healthCheck()
    } catch (error) {
      debugLog('Health check failed:', error)
      throw error
    }
  }

  // File upload
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<T> {
    try {
      debugLog(`Uploading file: ${file.name} to ${endpoint}`)
      const result = await apiClient.upload<T>(endpoint, file, onProgress, additionalData)
      toast.success('File uploaded successfully!')
      return result
    } catch (error: any) {
      debugLog('File upload failed:', error)
      toast.error('Failed to upload file. Please try again.')
      throw error
    }
  }

  // File download
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    try {
      debugLog(`Downloading file from: ${endpoint}`)
      await apiClient.download(endpoint, filename)
      toast.success('File downloaded successfully!')
    } catch (error: any) {
      debugLog('File download failed:', error)
      toast.error('Failed to download file. Please try again.')
      throw error
    }
  }

  // Batch operations
  async batchRequest<T>(
    requests: Array<{
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      endpoint: string
      data?: any
    }>
  ): Promise<T[]> {
    try {
      debugLog(`Executing batch request with ${requests.length} operations`)
      
      const promises = requests.map(req => 
        this.request<T>(req.method, req.endpoint, req.data)
      )
      
      const results = await Promise.allSettled(promises)
      
      const successful: T[] = []
      const failed: any[] = []
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push({
            request: requests[index],
            error: result.reason,
          })
        }
      })
      
      if (failed.length > 0) {
        debugLog(`${failed.length} batch requests failed:`, failed)
      }
      
      debugLog(`Batch request completed: ${successful.length} successful, ${failed.length} failed`)
      return successful
    } catch (error) {
      debugLog('Batch request failed:', error)
      throw error
    }
  }

  // Get the underlying API client for advanced usage
  getClient() {
    return apiClient
  }
}

// Create singleton instance
export const apiService = new ApiService()

// Export types
export type { ApiResponse, ApiServiceError }
