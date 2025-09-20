import { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  // Add authentication logic here
  const isAuthenticated = true // This should be replaced with actual auth check
  
  if (!isAuthenticated) {
    // Redirect to login or show unauthorized message
    return <div>Please log in to access this page.</div>
  }
  
  return <>{children}</>
}
