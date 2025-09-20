import { apiClient } from './apiClient'

export interface PaymentRequest {
  provider: string
  amount: number
  currency: string
  metadata: Record<string, string>
}

export interface PaymentResponse {
  transaction_id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  currency: string
  provider: string
  metadata: Record<string, string>
  created_at: string
}

export interface RefundRequest {
  transaction_id: string
  amount?: number
  reason: string
}

export interface RefundResponse {
  refund_id: string
  transaction_id: string
  amount: number
  status: string
  created_at: string
}

export interface PaymentStatus {
  transaction_id: string
  status: string
  amount: number
  currency: string
  provider: string
  created_at: string
  updated_at: string
}

export interface EscrowRequest {
  order_id: string
  buyer_id: string
  seller_id: string
  amount: number
  currency: string
}

export interface EscrowResponse {
  escrow_id: string
  order_id: string
  status: string
  amount: number
  currency: string
  created_at: string
}

export interface PayoutRequest {
  seller_id: string
  amount: number
  currency: string
  provider: string
  account_id: string
  description?: string
}

export interface PayoutResponse {
  payout_id: string
  seller_id: string
  amount: number
  currency: string
  provider: string
  status: string
  created_at: string
}

class PaymentApi {
  // Payment processing
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    return apiClient.post('/payments/create', paymentData)
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return apiClient.get(`/payments/${transactionId}/status`)
  }

  async refundPayment(refundData: RefundRequest): Promise<RefundResponse> {
    return apiClient.post('/payments/refund', refundData)
  }

  async getPaymentHistory(page = 1, pageSize = 10): Promise<{
    payments: PaymentResponse[]
    pagination: {
      page: number
      page_size: number
      total: number
    }
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return apiClient.get(`/payments/history?${params}`)
  }

  // Escrow operations
  async createEscrow(escrowData: EscrowRequest): Promise<EscrowResponse> {
    return apiClient.post('/escrow/create', escrowData)
  }

  async releaseEscrow(escrowId: string): Promise<{ message: string }> {
    return apiClient.post(`/escrow/${escrowId}/release`)
  }

  async refundEscrow(escrowId: string, reason: string): Promise<{ message: string }> {
    return apiClient.post(`/escrow/${escrowId}/refund`, { reason })
  }

  async getEscrowStatus(escrowId: string): Promise<EscrowResponse> {
    return apiClient.get(`/escrow/${escrowId}`)
  }

  async getEscrowSummary(): Promise<{
    total_held: number
    total_released: number
    total_refunded: number
    active_escrows: number
    currency: string
  }> {
    return apiClient.get('/escrow/summary')
  }

  // Payout operations
  async createPayout(payoutData: PayoutRequest): Promise<PayoutResponse> {
    return apiClient.post('/payouts/create', payoutData)
  }

  async getPayoutStatus(payoutId: string): Promise<PayoutResponse> {
    return apiClient.get(`/payouts/${payoutId}`)
  }

  async getPayoutHistory(sellerId?: string, page = 1, pageSize = 10): Promise<{
    payouts: PayoutResponse[]
    pagination: {
      page: number
      page_size: number
      total: number
    }
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(sellerId && { seller_id: sellerId }),
    })
    return apiClient.get(`/payouts/history?${params}`)
  }

  async getPayoutCapabilities(provider: string): Promise<{
    provider: string
    supported_currencies: string[]
    minimum_amount: number
    maximum_amount: number
    processing_time: string
    fees: {
      percentage: number
      fixed: number
    }
  }> {
    return apiClient.get(`/payouts/capabilities/${provider}`)
  }

  // Provider-specific operations
  async getStripePaymentMethods(): Promise<any[]> {
    return apiClient.get('/payments/stripe/methods')
  }

  async getMpesaStkPush(phone: string, amount: number): Promise<{
    checkout_request_id: string
    merchant_request_id: string
    response_code: number
    response_description: string
  }> {
    return apiClient.post('/payments/mpesa/stk-push', { phone, amount })
  }

  async getPayPalOrder(amount: number, currency: string): Promise<{
    order_id: string
    approval_url: string
  }> {
    return apiClient.post('/payments/paypal/create-order', { amount, currency })
  }
}

export const paymentApi = new PaymentApi()
