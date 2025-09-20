import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
  roles?: string[]
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    // If user's role is not authorized, redirect to home page
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
