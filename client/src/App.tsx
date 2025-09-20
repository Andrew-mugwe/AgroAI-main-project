import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import AccessibilityFeatures from './components/AccessibilityPanel'
import Layout from './components/layout/layout'

// Public Pages
import Homepage from './pages/Homepage'
import About from './pages/About'
import Login from './pages/Auth/login'
import Register from './pages/Auth/register'
import RoleSelection from './pages/Auth/RoleSelection'
import ForgotPassword from './pages/Auth/forgotpassword'
import Marketplace from './pages/Marketplace'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Disputes from './pages/Disputes'
import SellerProfile from './pages/seller/Profile'
import FeaturesPage from './pages/FeaturesPage'
import MarketplaceChat from './pages/MarketplaceChat'

// Role-Based Dashboards
import { FarmerDashboard } from './pages/user/FarmerDashboard'
import { NGODashboard } from './pages/user/NGODashboard'
import { TraderDashboard } from './pages/user/TraderDashboard'

// Feature Pages
import ChatPage from './pages/chat/ChatPage'
import PestDetectionPage from './pages/pests/index'
import MessagingDemo from './components/demo/MessagingDemo'

// Individual Feature Pages
import ChatFeaturePage from './pages/features/ChatFeaturePage'
import PestDetectionFeaturePage from './pages/features/PestDetectionFeaturePage'

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/about" element={<About />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
                  <Route path="/disputes" element={<Disputes />} />
                  <Route path="/seller/:sellerId" element={<SellerProfile />} />
                  <Route path="/marketplace/chat" element={<MarketplaceChat />} />
                  <Route path="/marketplace/chat/:threadRef" element={<MarketplaceChat />} />
                  <Route path="/features" element={<FeaturesPage />} />

            {/* Auth Routes */}
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route 
                path="role-selection" 
                element={
                  <ProtectedRoute>
                    <RoleSelection />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard">
              <Route
                path="farmer"
                element={
                  <ProtectedRoute requiredRole="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="ngo"
                element={
                  <ProtectedRoute requiredRole="ngo">
                    <NGODashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="trader"
                element={
                  <ProtectedRoute requiredRole="trader">
                    <TraderDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Default dashboard route - redirect to role-specific dashboard */}
              <Route index element={<Navigate to="/auth/role-selection" replace />} />
            </Route>

            {/* Feature Routes */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:conversationId" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/pest-detection" element={
              <ProtectedRoute>
                <PestDetectionPage />
              </ProtectedRoute>
            } />
            <Route path="/demo/messaging" element={<MessagingDemo />} />

            {/* Individual Feature Pages */}
            <Route path="/features/chat" element={<ChatFeaturePage />} />
            <Route path="/features/pest-detection" element={<PestDetectionFeaturePage />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        <AccessibilityFeatures />
        </CartProvider>
      </AuthProvider>
    </AccessibilityProvider>
  )
}

export default App