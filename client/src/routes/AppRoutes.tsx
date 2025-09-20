import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../pages/Auth/Login'
import { Register } from '../pages/Auth/Register'
import { RoleSelection } from '../pages/Auth/RoleSelection'
import { FarmerDashboard } from '../pages/user/FarmerDashboard'
import { NGODashboard } from '../pages/user/NGODashboard'
import { TraderDashboard } from '../pages/user/TraderDashboard'
import ChatPage from '../pages/chat/ChatPage'
import MessagingDemo from '../components/demo/MessagingDemo'
import PestDetectionPage from '../pages/pest/PestDetectionPage'
import FeaturesPage from '../pages/FeaturesPage'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

export function AppRoutes() {
  const { user } = useAuth()

  // Helper function to determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/auth/login'
    if (!user.role) return '/auth/role-selection'
    
    switch (user.role) {
      case 'farmer':
        return '/dashboard/farmer'
      case 'ngo':
        return '/dashboard/ngo'
      case 'trader':
        return '/dashboard/trader'
      default:
        return '/'
    }
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route 
        path="/auth/role-selection" 
        element={
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        } 
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/farmer"
        element={
          <ProtectedRoute requiredRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/ngo"
        element={
          <ProtectedRoute requiredRole="ngo">
            <NGODashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/trader"
        element={
          <ProtectedRoute requiredRole="trader">
            <TraderDashboard />
          </ProtectedRoute>
        }
      />

      {/* Chat Routes */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:conversationId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Demo Routes */}
      <Route
        path="/demo/messaging"
        element={<MessagingDemo />}
      />

      {/* Features Page */}
      <Route
        path="/features"
        element={<FeaturesPage />}
      />

      {/* Pest Detection Routes */}
      <Route
        path="/pest-detection"
        element={
          <ProtectedRoute>
            <PestDetectionPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect /dashboard to role-specific dashboard */}
      <Route
        path="/dashboard"
        element={<Navigate to={getDashboardRoute()} replace />}
      />

      {/* Redirect root to dashboard if logged in, otherwise to login */}
      <Route
        path="/"
        element={
          user ? <Navigate to={getDashboardRoute()} replace /> : <Navigate to="/auth/login" replace />
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}