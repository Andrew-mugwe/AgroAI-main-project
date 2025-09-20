import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const mockUseAuth = jest.requireMock('../../../context/AuthContext').useAuth

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>

  beforeEach(() => {
    // Clear mock between tests
    jest.clearAllMocks()
  })

  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      loading: true,
      user: null
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: null
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects to role selection when user has no role', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { id: '1', name: 'Test User', role: null }
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/role-selection" element={<div>Role Selection</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Role Selection')).toBeInTheDocument()
  })

  it('redirects to correct dashboard when role doesnt match required role', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { id: '1', name: 'Test User', role: 'farmer' }
    })

    render(
      <MemoryRouter initialEntries={['/trader']}>
        <Routes>
          <Route path="/dashboard/farmer" element={<div>Farmer Dashboard</div>} />
          <Route
            path="/trader"
            element={
              <ProtectedRoute requiredRole="trader">
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Farmer Dashboard')).toBeInTheDocument()
  })

  it('renders children when all checks pass', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { id: '1', name: 'Test User', role: 'trader' }
    })

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="trader">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})