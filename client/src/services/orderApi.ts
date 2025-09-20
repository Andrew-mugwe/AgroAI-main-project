import { apiClient } from './apiClient'

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[]
  shipping_address: Address
  billing_address: Address
  payment_method: string
  notes?: string
}

export interface CreateOrderItemRequest {
  product_id: string
  quantity: number
}

export interface Address {
  first_name: string
  last_name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  seller_id: string
  status: OrderStatus
  subtotal: string
  tax_amount: string
  shipping_amount: string
  total_amount: string
  currency: string
  payment_status: PaymentStatus
  payment_method: string
  payment_transaction_id?: string
  shipping_address: Address
  billing_address: Address
  notes?: string
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  items: OrderItem[]
  status_history: OrderStatusHistory[]
  payment_transactions: PaymentTransaction[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: string
  total_price: string
  created_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  notes: string
  created_at: string
  created_by?: string
}

export interface PaymentTransaction {
  id: string
  order_id: string
  transaction_id: string
  provider: string
  amount: string
  currency: string
  status: PaymentStatus
  provider_response: any
  metadata: any
  created_at: string
  updated_at: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export interface OrderResponse {
  success: boolean
  message: string
  data?: Order
  error?: string
}

export interface OrdersListResponse {
  success: boolean
  message: string
  data: Order[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface ProcessPaymentRequest {
  payment_method: string
  amount: string
  currency: string
}

export interface ProcessPaymentResponse {
  success: boolean
  message: string
  transaction_id: string
  status: PaymentStatus
}

class OrderApi {
  // Create a new order
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post('/api/orders', orderData)
    return response.data
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await apiClient.get(`/api/orders/${orderId}`)
    return response.data
  }

  // Get user's orders
  async getUserOrders(page: number = 1, limit: number = 20): Promise<OrdersListResponse> {
    const response = await apiClient.get('/api/orders', {
      params: { page, limit }
    })
    return response.data
  }

  // Get seller's orders
  async getSellerOrders(page: number = 1, limit: number = 20): Promise<OrdersListResponse> {
    const response = await apiClient.get('/api/seller/orders', {
      params: { page, limit }
    })
    return response.data
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/api/orders/${orderId}/status`, {
      status,
      notes
    })
    return response.data
  }

  // Process payment for an order
  async processPayment(orderId: string, paymentData: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const response = await apiClient.post(`/api/orders/${orderId}/payment`, paymentData)
    return response.data
  }

  // Get order status (public endpoint)
  async getOrderStatus(orderId: string): Promise<{
    success: boolean
    order_number: string
    status: OrderStatus
    payment_status: PaymentStatus
    total_amount: string
    currency: string
    created_at: string
    updated_at: string
  }> {
    const response = await apiClient.get(`/api/orders/${orderId}/status`)
    return response.data
  }
}

export const orderApi = new OrderApi()
