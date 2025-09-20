import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi, type LoginRequest, type SignupRequest, type User, type AuthResponse } from '../services/authApi'
import toast from 'react-hot-toast'

// User interface is now imported from authApi

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      })

      const userData = response.data
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set default Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
    } catch (err) {
      setError(err.response?.data || 'An error occurred during login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, role: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        name,
        email,
        password,
        role
      })

      const userData = response.data
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set default Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
    } catch (err) {
      setError(err.response?.data || 'An error occurred during signup')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    axios.defaults.headers.common['Authorization'] = `Bearer ${updatedUser.token}`
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}