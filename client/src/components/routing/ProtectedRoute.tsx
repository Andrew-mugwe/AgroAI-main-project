import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'farmer' | 'ngo' | 'trader'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // No role yet - redirect to role selection
  if (!user.role) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />
  }

  // Role required but doesn't match - redirect to appropriate dashboard
  if (requiredRole && user.role !== requiredRole) {
    const dashboardRoutes = {
      farmer: '/dashboard/farmer',
      ngo: '/dashboard/ngo',
      trader: '/dashboard/trader'
    }
    return <Navigate to={dashboardRoutes[user.role]} replace />
  }

  // All checks passed - render children
  return <>{children}</>
}