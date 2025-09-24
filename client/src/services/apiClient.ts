import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import toast from 'react-hot-toast'

// Production-ready API Configuration
const API_CONFIG = {
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000, // 15 seconds
  retryAttempts: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
}

// Custom error interface
interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

// Request queue for token refresh
interface QueuedRequest {
  resolve: (value?: any) => void
  reject: (error?: any) => void
}

class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: QueuedRequest[] = []

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()
        
        // Log request in development
        if ((import.meta as any).env?.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(this.handleError(error))
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if ((import.meta as any).env?.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`)
        }

        // Check for custom headers
        if (response.headers['x-total-count']) {
          response.data._pagination = {
            total: parseInt(response.headers['x-total-count']),
            page: parseInt(response.headers['x-page-count']) || 1,
          }
        }

        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { 
          _retry?: boolean
          _retryCount?: number
        }

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              return this.instance(originalRequest)
            }).catch((err) => {
              return Promise.reject(err)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            await this.refreshToken()
            this.processQueue(null)
            return this.instance(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError)
            this.handleUnauthorized()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle retry logic for server errors
        if (this.shouldRetry(error, originalRequest)) {
          return this.retryRequest(originalRequest)
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private shouldRetry(error: AxiosError, config: AxiosRequestConfig & { _retryCount?: number }): boolean {
    const retryCount = config._retryCount || 0
    
    if (retryCount >= API_CONFIG.retryAttempts) {
      return false
    }

    if (!error.response) {
      return true // Network error, retry
    }

    return API_CONFIG.retryStatusCodes.includes(error.response.status)
  }

  private async retryRequest(config: AxiosRequestConfig & { _retryCount?: number }) {
    const retryCount = (config._retryCount || 0) + 1
    config._retryCount = retryCount

    // Exponential backoff
    const delay = API_CONFIG.retryDelay * Math.pow(2, retryCount - 1)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return this.instance(config)
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
    
    this.failedQueue = []
  }

  private getAuthToken(): string | null {
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const { token } = JSON.parse(user)
        return token
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      localStorage.removeItem('user') // Clean up corrupted data
    }
    return null
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await this.instance.post('/auth/refresh')
      const { token } = response.data
      
      // Update stored token
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        userData.token = token
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }

  private handleUnauthorized() {
    localStorage.removeItem('user')
    toast.error('Session expired. Please login again.')
    
    // Only redirect if not already on auth pages
    if (!window.location.pathname.includes('/auth/')) {
      window.location.href = '/auth/login'
    }
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      let message = 'An error occurred'
      
      if (data?.message) {
        message = data.message
      } else if (data?.error) {
        message = data.error
      } else {
        switch (status) {
          case 400:
            message = 'Bad request. Please check your input.'
            break
          case 401:
            message = 'Unauthorized. Please login.'
            break
          case 403:
            message = 'Forbidden. You don\'t have permission.'
            break
          case 404:
            message = 'Resource not found.'
            break
          case 422:
            message = 'Validation error. Please check your input.'
            break
          case 429:
            message = 'Too many requests. Please try again later.'
            break
          case 500:
            message = 'Server error. Please try again later.'
            break
          case 502:
          case 503:
          case 504:
            message = 'Service unavailable. Please try again later.'
            break
        }
      }

      return {
        message,
        status,
        code: data?.code,
        details: data?.details,
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      }
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      }
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Public API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config)
    return response.data
  }

  // Upload method for file uploads
  async upload<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.instance.post(url, formData, config)
    return response.data
  }

  // Download method for file downloads
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  // Get the underlying axios instance for advanced usage
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export types and config
export type { ApiError }
export { API_CONFIG }