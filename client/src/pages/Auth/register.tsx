import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Leaf,
  User,
  Mail,
  Lock,
  ArrowRight,
  Tractor,
  GraduationCap,
  Store
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type Role = 'farmer' | 'ngo' | 'trader'

interface RoleOption {
  id: Role
  title: string
  description: string
  icon: typeof Tractor
  color: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Access weather insights, crop management tools, and marketplace.',
    icon: Tractor,
    color: 'green'
  },
  {
    id: 'ngo',
    title: 'NGO/School',
    description: 'Manage farmer groups, training programs, and impact tracking.',
    icon: GraduationCap,
    color: 'blue'
  },
  {
    id: 'trader',
    title: 'Trader',
    description: 'Buy and sell agricultural products, manage inventory.',
    icon: Store,
    color: 'purple'
  }
]

const Register = () => {
  const navigate = useNavigate()
  const { signup, error } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as Role
  })

  const handleRoleSelect = (role: Role) => {
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await signup(formData.name, formData.email, formData.password, formData.role)
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
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
            AgroAI
          </h1>
          <p className="text-gray-600 mt-2">Create your account to get started.</p>
        </div>

        {/* Registration Steps */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200/50">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose your role</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roleOptions.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-6 rounded-xl border-2 border-${role.color}-200 hover:border-${role.color}-400 bg-${role.color}-50 text-left transition-colors duration-200`}
                  >
                    <role.icon className={`w-8 h-8 text-${role.color}-600 mb-4`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
                <p className="text-gray-600 mt-2">
                  You're registering as a{' '}
                  <span className="font-medium text-green-700">{formData.role}</span>
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
            >
              <span>Already have an account? Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register