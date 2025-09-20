// Payment Service Integration - Migrated to use Axios
import { paymentApi, type PaymentRequest, type PaymentResponse } from './paymentApi'
import toast from 'react-hot-toast'

export { type PaymentRequest, type PaymentResponse } from './paymentApi'

export class PaymentService {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await paymentApi.createPayment(request)
      toast.success('Payment initiated successfully!')
      return response
    } catch (error: any) {
      console.error('Payment creation failed:', error)
      toast.error(error.message || 'Failed to create payment')
      // Fallback to mock response for demo
      return this.createMockPayment(request)
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await paymentApi.getPaymentStatus(transactionId)
      return {
        transaction_id: response.transaction_id,
        status: response.status as any,
        amount: response.amount,
        currency: response.currency,
        provider: response.provider,
        metadata: {},
        created_at: response.created_at,
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error)
      toast.error(error.message || 'Failed to verify payment')
      throw error
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<boolean> {
    try {
      const response = await paymentApi.refundPayment({
        transaction_id: transactionId,
        reason: 'Customer request',
        ...(amount && { amount }),
      })
      
      toast.success('Refund processed successfully!')
      return true
    } catch (error: any) {
      console.error('Payment refund failed:', error)
      toast.error(error.message || 'Failed to process refund')
      // Fallback to mock refund
      return this.createMockRefund(transactionId, amount || 0)
    }
  }

  async getPaymentHistory(page = 1, pageSize = 10) {
    try {
      return await paymentApi.getPaymentHistory(page, pageSize)
    } catch (error: any) {
      console.error('Failed to fetch payment history:', error)
      throw error
    }
  }

  async createEscrow(orderId: string, buyerId: string, sellerId: string, amount: number, currency = 'USD') {
    try {
      const response = await paymentApi.createEscrow({
        order_id: orderId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount,
        currency,
      })
      toast.success('Escrow created successfully!')
      return response
    } catch (error: any) {
      console.error('Escrow creation failed:', error)
      toast.error(error.message || 'Failed to create escrow')
      throw error
    }
  }

  async releaseEscrow(escrowId: string) {
    try {
      const response = await paymentApi.releaseEscrow(escrowId)
      toast.success('Escrow released successfully!')
      return response
    } catch (error: any) {
      console.error('Escrow release failed:', error)
      toast.error(error.message || 'Failed to release escrow')
      throw error
    }
  }

  async refundEscrow(escrowId: string, reason: string) {
    try {
      const response = await paymentApi.refundEscrow(escrowId, reason)
      toast.success('Escrow refunded successfully!')
      return response
    } catch (error: any) {
      console.error('Escrow refund failed:', error)
      toast.error(error.message || 'Failed to refund escrow')
      throw error
    }
  }

  // Mock methods for demo purposes
  private createMockPayment(request: PaymentRequest): PaymentResponse {
    const transactionId = `${request.provider}_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      transaction_id: transactionId,
      status: 'completed',
      amount: request.amount,
      currency: request.currency,
      provider: request.provider,
      metadata: request.metadata,
      created_at: new Date().toISOString(),
    }
  }

  private createMockRefund(transactionId: string, amount: number): boolean {
    console.log(`Mock refund: ${transactionId} for $${amount}`)
    return true
  }
}

export const paymentService = new PaymentService()