import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tractor, GraduationCap, Store, Leaf } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface RoleOption {
  id: 'farmer' | 'ngo' | 'trader'
  title: string
  description: string
  icon: typeof Tractor
  color: string
  route: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Access weather insights, crop management tools, and marketplace.',
    icon: Tractor,
    color: 'green',
    route: '/dashboard/farmer'
  },
  {
    id: 'ngo',
    title: 'NGO/School',
    description: 'Manage farmer groups, training programs, and impact tracking.',
    icon: GraduationCap,
    color: 'blue',
    route: '/dashboard/ngo'
  },
  {
    id: 'trader',
    title: 'Trader',
    description: 'Buy and sell agricultural products, manage inventory.',
    icon: Store,
    color: 'purple',
    route: '/dashboard/trader'
  }
]

const RoleSelection = () => {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleSelect = async (role: RoleOption) => {
    try {
      setLoading(role.id)
      
      // Call API to update role
      const response = await api.post('/api/user/role', { role: role.id })
      
      // Update stored token
      const { token } = response.data
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = { ...user, token, role: role.id }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update auth context
      updateUser(updatedUser)
      
      // Show success message
      toast.success(`Welcome! You're now registered as a ${role.title}`)
      
      // Redirect to appropriate dashboard
      navigate(role.route)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
            Choose Your Role
          </h1>
          <p className="text-gray-600 mt-2">Select how you'll use AgroAI</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roleOptions.map((role) => (
            <motion.button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              disabled={loading !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl border-2 border-${role.color}-200 hover:border-${role.color}-400 bg-${role.color}-50 text-left transition-colors duration-200 relative overflow-hidden ${
                loading === role.id ? 'cursor-wait' : 'cursor-pointer'
              }`}
            >
              {/* Loading Overlay */}
              {loading === role.id && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <role.icon className={`w-8 h-8 text-${role.color}-600 mb-4`} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default RoleSelection