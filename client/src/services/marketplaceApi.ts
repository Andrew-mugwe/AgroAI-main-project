import { apiClient } from './apiClient'

export interface Product {
  id: string
  trader_id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  stock?: number
  category?: string
  image_url?: string
  is_active?: boolean
}

export interface ProductListResponse {
  products: Product[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  total_amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface CreateOrderRequest {
  product_id: string
  quantity: number
  seller_id: string
}

export interface Seller {
  id: string
  name: string
  location: string
  verified: boolean
  rating: number
  reviews_count: number
  reputation_score: number
  created_at: string
}

class MarketplaceApi {
  // Products
  async getProducts(page = 1, pageSize = 10, category?: string): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(category && { category }),
    })
    return apiClient.get(`/products?${params}`)
  }

  async getProduct(id: string): Promise<Product> {
    return apiClient.get(`/products/${id}`)
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return apiClient.post('/trader/products', productData)
  }

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product> {
    return apiClient.put(`/trader/products/${id}`, productData)
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/trader/products/${id}`)
  }

  async getTraderProducts(page = 1, pageSize = 10): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return apiClient.get(`/trader/products?${params}`)
  }

  // Sellers
  async getSellers(): Promise<Seller[]> {
    return apiClient.get('/sellers')
  }

  async getSeller(id: string): Promise<Seller> {
    return apiClient.get(`/sellers/${id}`)
  }

  async getSellerProducts(sellerId: string, page = 1, pageSize = 10): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return apiClient.get(`/sellers/${sellerId}/products?${params}`)
  }

  async getSellerReviews(sellerId: string): Promise<any[]> {
    return apiClient.get(`/sellers/${sellerId}/reviews`)
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return apiClient.get('/orders')
  }

  async getOrder(id: string): Promise<Order> {
    return apiClient.get(`/orders/${id}`)
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return apiClient.post('/orders', orderData)
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return apiClient.put(`/orders/${id}/status`, { status })
  }

  // Search
  async searchProducts(query: string, page = 1, pageSize = 10): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return apiClient.get(`/products/search?${params}`)
  }
}

export const marketplaceApi = new MarketplaceApi()
