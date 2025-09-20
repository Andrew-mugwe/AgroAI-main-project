import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TraderDashboard } from '../TraderDashboard'
import { api } from '../../../services/api'

// Mock API calls
jest.mock('../../../services/api')

const mockProducts = [
  {
    id: '1',
    name: 'Maize Seeds',
    description: 'High-quality maize seeds',
    price: 29.99,
    stock: 100,
    category: 'Seeds',
    status: 'active'
  }
]

const mockOrders = [
  {
    id: '1',
    product_id: 'Maize Seeds',
    quantity: 5,
    total_price: 149.95,
    status: 'pending',
    created_at: '2024-01-20T10:00:00Z'
  }
]

const mockAnalytics = {
  marketplace_stats: {
    active_listings: 10,
    pending_orders: 5,
    total_sales: 12500,
    products_count: 15
  },
  monthly_trends: [
    { month: 'Jan', revenue: 2500, orders: 20 },
    { month: 'Feb', revenue: 3000, orders: 25 }
  ],
  top_products: [
    { name: 'Maize Seeds', revenue: 5000, quantity: 200, growth: 15 }
  ]
}

describe('TraderDashboard', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup API mock responses
    api.get.mockImplementation((url) => {
      switch (url) {
        case '/api/trader/products':
          return Promise.resolve({ data: mockProducts })
        case '/api/trader/orders':
          return Promise.resolve({ data: mockOrders })
        case '/api/trader/analytics':
          return Promise.resolve({ data: mockAnalytics })
        default:
          return Promise.reject(new Error('Not found'))
      }
    })
  })

  it('renders dashboard with stats cards', async () => {
    render(
      <MemoryRouter>
        <TraderDashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Active Listings')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('$12,500')).toBeInTheDocument()
    })
  })

  it('switches between tabs', async () => {
    render(
      <MemoryRouter>
        <TraderDashboard />
      </MemoryRouter>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Product Listings')).toBeInTheDocument()
    })

    // Switch to Orders tab
    fireEvent.click(screen.getByText('Orders'))
    expect(screen.getByText('Recent Orders')).toBeInTheDocument()

    // Switch to Analytics tab
    fireEvent.click(screen.getByText('Analytics'))
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
  })

  it('displays product listings', async () => {
    render(
      <MemoryRouter>
        <TraderDashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Maize Seeds')).toBeInTheDocument()
      expect(screen.getByText('$29.99')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  it('displays orders', async () => {
    render(
      <MemoryRouter>
        <TraderDashboard />
      </MemoryRouter>
    )

    // Switch to Orders tab
    fireEvent.click(screen.getByText('Orders'))

    await waitFor(() => {
      expect(screen.getByText('Maize Seeds')).toBeInTheDocument()
      expect(screen.getByText('$149.95')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
  })

  it('displays analytics charts', async () => {
    render(
      <MemoryRouter>
        <TraderDashboard />
      </MemoryRouter>
    )

    // Switch to Analytics tab
    fireEvent.click(screen.getByText('Analytics'))

    await waitFor(() => {
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
      expect(screen.getByText('Orders Trend')).toBeInTheDocument()
      expect(screen.getByText('Top Products')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    api.get.mockRejectedValue(new Error('API Error'))

    render(
      <MemoryRouter>
        <TraderDashboard />
      </MemoryRouter>
    )

    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Trader Dashboard')).toBeInTheDocument()
    })
  })
})
