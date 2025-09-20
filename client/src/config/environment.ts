// Environment configuration for AgroAI
export const ENV_CONFIG = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Feature Flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.DEV,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // External Services
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AgroAI',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Production URLs
  PRODUCTION_API_URL: import.meta.env.VITE_PRODUCTION_API_URL || 'https://api.agroai.com',
  PRODUCTION_WS_URL: import.meta.env.VITE_PRODUCTION_WS_URL || 'wss://api.agroai.com',
}

// Environment helpers
export const isDevelopment = ENV_CONFIG.NODE_ENV === 'development'
export const isProduction = ENV_CONFIG.NODE_ENV === 'production'
export const isTest = ENV_CONFIG.NODE_ENV === 'test'

// API URL helper
export const getApiUrl = () => {
  if (isProduction) {
    return ENV_CONFIG.PRODUCTION_API_URL
  }
  return ENV_CONFIG.API_URL
}

// WebSocket URL helper
export const getWsUrl = () => {
  if (isProduction) {
    return ENV_CONFIG.PRODUCTION_WS_URL
  }
  return ENV_CONFIG.WS_URL
}

// Debug helper
export const debugLog = (...args: any[]) => {
  if (ENV_CONFIG.ENABLE_DEBUG) {
    console.log('[AgroAI Debug]', ...args)
  }
}
