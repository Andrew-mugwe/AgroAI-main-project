import { apiClient } from './apiClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  role: 'farmer' | 'ngo' | 'trader' | 'admin'
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

export interface ChangeRoleRequest {
  userId: string
  role: string
}

class AuthApi {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', credentials)
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/signup', userData)
  }

  async logout(): Promise<{ message: string }> {
    return apiClient.post('/auth/logout')
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/auth/me')
  }

  async changeUserRole(request: ChangeRoleRequest): Promise<{ user: User; message: string }> {
    return apiClient.put(`/users/${request.userId}/role`, { role: request.role })
  }

  async refreshToken(): Promise<{ token: string }> {
    return apiClient.post('/auth/refresh')
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post('/auth/verify-email', { token })
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, password })
  }
}

export const authApi = new AuthApi()
