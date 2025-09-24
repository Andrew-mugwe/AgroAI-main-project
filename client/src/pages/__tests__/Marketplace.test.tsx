// Flow14.1.1
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Marketplace from '../../pages/Marketplace'

jest.mock('../../services/mock_toggle', () => ({ USE_MOCK_MARKETPLACE: true }))

describe('Marketplace page', () => {
  it('renders hero and product grid', () => {
    render(<Marketplace />)
    expect(screen.getByText(/Transforming/i)).toBeInTheDocument()
    // Products from mock cards should render
    expect(screen.getByText(/Premium Maize Seeds/i)).toBeInTheDocument()
  })
})


