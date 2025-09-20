import { Route, Routes, Navigate } from 'react-router-dom'
import { FarmerDashboard } from '../pages/user/FarmerDashboard'
import { NGODashboard } from '../pages/user/NGODashboard'
import { useAuth } from '../context/AuthContext'

export function DashboardRoutes() {
  const { user } = useAuth()

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // Route to appropriate dashboard based on user role
  const getDashboardComponent = () => {
    switch (user.role) {
      case 'farmer':
        return <FarmerDashboard />
      case 'ngo':
        return <NGODashboard />
      default:
        return <Navigate to="/" replace />
    }
  }

  return (
    <Routes>
      <Route path="/dashboard" element={getDashboardComponent()} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
