import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Event logging configuration
const LOG_CONFIG = {
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

// Event queue for batching
let eventQueue: LogEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Log event interface
export interface LogEvent {
  action: string;
  metadata?: Record<string, any>;
  timestamp: number;
  userId?: string;
  role?: string;
  sessionId: string;
}

// Session ID for tracking user sessions
const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Log a user action to the backend
 * @param action - The action being performed
 * @param metadata - Additional context data
 */
export const logEvent = async (action: string, metadata?: Record<string, any>): Promise<void> => {
  try {
    // Get user info from auth context (if available)
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    const event: LogEvent = {
      action,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: user?.id,
      role: user?.role,
      sessionId,
    };

    // Add to queue
    eventQueue.push(event);

    // Flush if batch size reached
    if (eventQueue.length >= LOG_CONFIG.batchSize) {
      await flushEvents();
    } else {
      // Schedule flush if not already scheduled
      if (!flushTimer) {
        flushTimer = setTimeout(flushEvents, LOG_CONFIG.flushInterval);
      }
    }
  } catch (error) {
    console.warn('Failed to log event:', error);
  }
};

/**
 * Flush all queued events to the backend
 */
const flushEvents = async (): Promise<void> => {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  // Clear timer
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  try {
    await sendEventsToBackend(eventsToSend);
  } catch (error) {
    console.warn('Failed to send events to backend:', error);
    
    // Retry logic
    let retries = 0;
    while (retries < LOG_CONFIG.maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, LOG_CONFIG.retryDelay * (retries + 1)));
        await sendEventsToBackend(eventsToSend);
        break;
      } catch (retryError) {
        retries++;
        if (retries >= LOG_CONFIG.maxRetries) {
          console.error('Max retries reached for event logging');
        }
      }
    }
  }
};

/**
 * Send events to backend API
 */
const sendEventsToBackend = async (events: LogEvent[]): Promise<void> => {
  const token = localStorage.getItem('token') || axios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '');
  
  const response = await axios.post('/api/logs', {
    events,
  }, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to send events: ${response.status}`);
  }
};

/**
 * Log farmer-specific actions
 */
export const logFarmerEvent = {
  cropAdded: (cropData: any) => logEvent('FARMER_CROP_ADDED', { crop: cropData }),
  forecastViewed: (location: string, forecastType: string) => 
    logEvent('FARMER_FORECAST_VIEWED', { location, forecastType }),
  adviceRequested: (cropType: string, issue: string) => 
    logEvent('FARMER_ADVICE_REQUESTED', { cropType, issue }),
  imageUploaded: (imageType: string, fileSize: number) => 
    logEvent('FARMER_IMAGE_UPLOADED', { imageType, fileSize }),
  farmUpdated: (farmId: string, changes: any) => 
    logEvent('FARMER_FARM_UPDATED', { farmId, changes }),
};

/**
 * Log NGO-specific actions
 */
export const logNGOEvent = {
  trainingCreated: (trainingData: any) => logEvent('NGO_TRAINING_CREATED', { training: trainingData }),
  reportViewed: (reportId: string, reportType: string) => 
    logEvent('NGO_REPORT_VIEWED', { reportId, reportType }),
  groupCreated: (groupData: any) => logEvent('NGO_GROUP_CREATED', { group: groupData }),
  memberAdded: (groupId: string, memberId: string) => 
    logEvent('NGO_MEMBER_ADDED', { groupId, memberId }),
  projectStarted: (projectData: any) => logEvent('NGO_PROJECT_STARTED', { project: projectData }),
};

/**
 * Log trader-specific actions
 */
export const logTraderEvent = {
  productListed: (productData: any) => logEvent('TRADER_PRODUCT_LISTED', { product: productData }),
  orderUpdated: (orderId: string, status: string, changes: any) => 
    logEvent('TRADER_ORDER_UPDATED', { orderId, status, changes }),
  analyticsViewed: (analyticsType: string, dateRange: string) => 
    logEvent('TRADER_ANALYTICS_VIEWED', { analyticsType, dateRange }),
  priceUpdated: (productId: string, oldPrice: number, newPrice: number) => 
    logEvent('TRADER_PRICE_UPDATED', { productId, oldPrice, newPrice }),
  inventoryUpdated: (productId: string, quantity: number) => 
    logEvent('TRADER_INVENTORY_UPDATED', { productId, quantity }),
};

/**
 * Log general user actions
 */
export const logUserEvent = {
  pageViewed: (page: string) => logEvent('PAGE_VIEWED', { page }),
  searchPerformed: (query: string, results: number) => 
    logEvent('SEARCH_PERFORMED', { query, results }),
  filterApplied: (filterType: string, filterValue: any) => 
    logEvent('FILTER_APPLIED', { filterType, filterValue }),
  exportData: (dataType: string, format: string) => 
    logEvent('DATA_EXPORTED', { dataType, format }),
  settingsChanged: (setting: string, value: any) => 
    logEvent('SETTINGS_CHANGED', { setting, value }),
};

/**
 * Log system/error events
 */
export const logSystemEvent = {
  errorOccurred: (error: Error, context: string) => 
    logEvent('SYSTEM_ERROR', { 
      error: error.message, 
      stack: error.stack, 
      context 
    }),
  performanceIssue: (component: string, duration: number) => 
    logEvent('PERFORMANCE_ISSUE', { component, duration }),
  apiCallFailed: (endpoint: string, status: number, error: string) => 
    logEvent('API_CALL_FAILED', { endpoint, status, error }),
};

/**
 * Force flush all pending events (useful for page unload)
 */
export const flushAllEvents = async (): Promise<void> => {
  await flushEvents();
};

/**
 * Initialize event logging (call on app startup)
 */
export const initializeEventLogging = (): void => {
  // Flush events on page unload
  window.addEventListener('beforeunload', flushAllEvents);
  
  // Flush events on visibility change (mobile apps)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAllEvents();
    }
  });

  // Log app initialization
  logEvent('APP_INITIALIZED', {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
  });
};

/**
 * Get current session ID
 */
export const getSessionId = (): string => sessionId;

/**
 * Get current event queue size (for debugging)
 */
export const getQueueSize = (): number => eventQueue.length;
