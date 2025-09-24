// Flow14.1.1
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Checkout from '../../pages/Checkout'
import * as orderApiMod from '../../services/orderApi'

jest.mock('../../services/orderApi')

describe('Checkout integration (mocked)', () => {
  it('submits order and shows success', async () => {
    const orderApi = orderApiMod as jest.Mocked<typeof orderApiMod>
    orderApi.orderApi.createOrder.mockResolvedValue({ success: true, message: 'ok', data: { id: 'o1' } as any })
    orderApi.orderApi.processPayment.mockResolvedValue({ success: true, message: 'ok', transaction_id: 'tx_123', status: 'paid' as any })

    render(<Checkout />)

    // Go to payment step
    fireEvent.click(screen.getByText(/Continue/i))
    // Select payment method and complete
    fireEvent.click(screen.getByLabelText(/Stripe/i))
    fireEvent.click(screen.getByText(/Continue/i))
    fireEvent.click(screen.getByText(/Complete Payment/i))

    expect(await screen.findByText(/Payment Successful/i)).toBeInTheDocument()
    expect(screen.getByText(/tx_123/i)).toBeInTheDocument()
  })
})


