// Example usage of the production-ready API client and services
import { apiClient } from '../services/apiClient'
import { apiService } from '../services/apiService'
import { authApi } from '../services/authApi'
import { marketplaceApi } from '../services/marketplaceApi'
import { paymentApi } from '../services/paymentApi'

// Example 1: Using the raw API client
export async function exampleRawApiClient() {
  try {
    // Health check
    const health = await apiClient.healthCheck()
    console.log('API Health:', health)

    // Get products with pagination
    const products = await apiClient.get<{
      products: any[]
      pagination: any
    }>('/products?page=1&page_size=10')

    console.log('Products:', products)

    // Create a product
    const newProduct = await apiClient.post('/trader/products', {
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      stock: 10,
      category: 'seeds',
    })

    console.log('Created product:', newProduct)

  } catch (error) {
    console.error('API Client error:', error)
  }
}

// Example 2: Using the API service wrapper
export async function exampleApiService() {
  try {
    // Health check with error handling
    const health = await apiService.healthCheck()
    console.log('Service Health:', health)

    // Get products with automatic error handling
    const products = await apiService.get('/products')
    console.log('Products via service:', products)

    // Upload a file with progress tracking
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const uploadResult = await apiService.uploadFile(
      '/upload',
      file,
      (progress) => console.log(`Upload progress: ${progress}%`)
    )
    console.log('Upload result:', uploadResult)

  } catch (error) {
    console.error('API Service error:', error)
  }
}

// Example 3: Using dedicated API modules
export async function exampleDedicatedApis() {
  try {
    // Authentication
    const authResult = await authApi.login({
      email: 'test@example.com',
      password: 'password123',
    })
    console.log('Login result:', authResult)

    // Marketplace operations
    const products = await marketplaceApi.getProducts(1, 10)
    console.log('Marketplace products:', products)

    const sellers = await marketplaceApi.getSellers()
    console.log('Sellers:', sellers)

    // Payment operations
    const paymentResult = await paymentApi.createPayment({
      provider: 'stripe',
      amount: 99.99,
      currency: 'USD',
      metadata: {
        order_id: '123',
        customer_id: '456',
      },
    })
    console.log('Payment result:', paymentResult)

    // Escrow operations
    const escrowResult = await paymentApi.createEscrow({
      order_id: '123',
      buyer_id: '456',
      seller_id: '789',
      amount: 99.99,
      currency: 'USD',
    })
    console.log('Escrow result:', escrowResult)

  } catch (error) {
    console.error('Dedicated API error:', error)
  }
}

// Example 4: Batch operations
export async function exampleBatchOperations() {
  try {
    const results = await apiService.batchRequest([
      { method: 'GET', endpoint: '/products' },
      { method: 'GET', endpoint: '/sellers' },
      { method: 'GET', endpoint: '/health' },
    ])

    console.log('Batch results:', results)
  } catch (error) {
    console.error('Batch operation error:', error)
  }
}

// Example 5: Error handling and retries
export async function exampleErrorHandling() {
  try {
    // This will automatically retry on network errors
    const result = await apiClient.get('/some-endpoint-that-might-fail')
    console.log('Result after potential retries:', result)
  } catch (error: any) {
    if (error.status === 401) {
      console.log('Authentication required')
    } else if (error.status === 429) {
      console.log('Rate limited - will retry automatically')
    } else {
      console.error('Other error:', error.message)
    }
  }
}

// Example 6: File operations
export async function exampleFileOperations() {
  try {
    // Upload with progress
    const file = new File(['test'], 'test.txt')
    await apiService.uploadFile(
      '/upload',
      file,
      (progress) => console.log(`Progress: ${progress}%`)
    )

    // Download
    await apiService.downloadFile('/download/test.pdf', 'downloaded-test.pdf')

  } catch (error) {
    console.error('File operation error:', error)
  }
}

// Export all examples for easy testing
export const apiExamples = {
  rawClient: exampleRawApiClient,
  apiService: exampleApiService,
  dedicatedApis: exampleDedicatedApis,
  batchOperations: exampleBatchOperations,
  errorHandling: exampleErrorHandling,
  fileOperations: exampleFileOperations,
}
