import { render, screen, waitFor } from '@testing-library/react';
import { logEvent, logFarmerEvent, logNGOEvent, logTraderEvent, logUserEvent, logSystemEvent, initializeEventLogging, getSessionId, getQueueSize } from '../utils/logEvent';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/dashboard',
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

// Mock screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
  writable: true,
});

describe('logEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockedAxios.post.mockResolvedValue({ status: 200, data: {} });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Basic logging functionality', () => {
    it('should log a basic event', async () => {
      await logEvent('TEST_ACTION', { test: 'data' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'TEST_ACTION',
              metadata: expect.objectContaining({
                test: 'data',
                url: 'http://localhost:3000/dashboard',
                userAgent: 'Mozilla/5.0 (Test Browser)',
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include user information when available', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'farmer',
        name: 'Test User',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      await logEvent('TEST_ACTION');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              userId: 'user-123',
              role: 'farmer',
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should handle errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(logEvent('TEST_ACTION')).resolves.toBeUndefined();
    });
  });

  describe('Event batching', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should batch events when batch size is reached', async () => {
      // Log multiple events to trigger batching
      for (let i = 0; i < 10; i++) {
        await logEvent(`TEST_ACTION_${i}`);
      }

      // Should have sent one batch
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({ action: 'TEST_ACTION_0' }),
            expect.objectContaining({ action: 'TEST_ACTION_9' }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should flush events after timeout', async () => {
      await logEvent('TEST_ACTION');

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe('Farmer event logging', () => {
    it('should log crop added event', async () => {
      const cropData = { type: 'maize', quantity: 100 };
      await logFarmerEvent.cropAdded(cropData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'FARMER_CROP_ADDED',
              metadata: expect.objectContaining({
                crop: cropData,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should log forecast viewed event', async () => {
      await logFarmerEvent.forecastViewed('Nairobi', 'weather');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'FARMER_FORECAST_VIEWED',
              metadata: expect.objectContaining({
                location: 'Nairobi',
                forecastType: 'weather',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should log advice requested event', async () => {
      await logFarmerEvent.adviceRequested('maize', 'pest_control');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'FARMER_ADVICE_REQUESTED',
              metadata: expect.objectContaining({
                cropType: 'maize',
                issue: 'pest_control',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });
  });

  describe('NGO event logging', () => {
    it('should log training created event', async () => {
      const trainingData = { title: 'Sustainable Farming', participants: 25 };
      await logNGOEvent.trainingCreated(trainingData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'NGO_TRAINING_CREATED',
              metadata: expect.objectContaining({
                training: trainingData,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should log report viewed event', async () => {
      await logNGOEvent.reportViewed('report-123', 'sustainability');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'NGO_REPORT_VIEWED',
              metadata: expect.objectContaining({
                reportId: 'report-123',
                reportType: 'sustainability',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });
  });

  describe('Trader event logging', () => {
    it('should log product listed event', async () => {
      const productData = { name: 'Maize', price: 50, category: 'grains' };
      await logTraderEvent.productListed(productData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'TRADER_PRODUCT_LISTED',
              metadata: expect.objectContaining({
                product: productData,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should log order updated event', async () => {
      const changes = { status: 'shipped', trackingNumber: 'TRK123' };
      await logTraderEvent.orderUpdated('order-123', 'shipped', changes);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'TRADER_ORDER_UPDATED',
              metadata: expect.objectContaining({
                orderId: 'order-123',
                status: 'shipped',
                changes,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });
  });

  describe('User event logging', () => {
    it('should log page viewed event', async () => {
      await logUserEvent.pageViewed('/dashboard');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'PAGE_VIEWED',
              metadata: expect.objectContaining({
                page: '/dashboard',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should log search performed event', async () => {
      await logUserEvent.searchPerformed('maize seeds', 15);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'SEARCH_PERFORMED',
              metadata: expect.objectContaining({
                query: 'maize seeds',
                results: 15,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });
  });

  describe('System event logging', () => {
    it('should log error occurred event', async () => {
      const error = new Error('Test error');
      await logSystemEvent.errorOccurred(error, 'component-test');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'SYSTEM_ERROR',
              metadata: expect.objectContaining({
                error: 'Test error',
                context: 'component-test',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });

    it('should log performance issue event', async () => {
      await logSystemEvent.performanceIssue('Dashboard', 2500);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              action: 'PERFORMANCE_ISSUE',
              metadata: expect.objectContaining({
                component: 'Dashboard',
                duration: 2500,
              }),
            }),
          ]),
        }),
        expect.any(Object)
      );
    });
  });

  describe('Utility functions', () => {
    it('should return a valid session ID', () => {
      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should return queue size', () => {
      const queueSize = getQueueSize();
      expect(typeof queueSize).toBe('number');
      expect(queueSize).toBeGreaterThanOrEqual(0);
    });

    it('should initialize event logging', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const addEventListenerSpyDoc = jest.spyOn(document, 'addEventListener');

      initializeEventLogging();

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      expect(addEventListenerSpyDoc).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });

  describe('Retry logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should retry failed requests', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ status: 200, data: {} });

      await logEvent('TEST_ACTION');

      // Fast-forward through retry delays
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      });
    });
  });
});
