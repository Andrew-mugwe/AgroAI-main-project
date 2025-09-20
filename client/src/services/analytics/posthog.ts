import React from 'react';
import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog
export const initializePostHog = () => {
  if (POSTHOG_KEY && typeof window !== 'undefined') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll capture pageviews manually
      capture_pageleave: true,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          email: true,
        },
      },
    });
  }
};

// Track marketplace events
export const trackMarketplaceEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      source: 'marketplace',
    });
  }
};

// Marketplace event tracking functions
export const analytics = {
  // Product events
  productViewed: (productId: string, sellerId: string, userId?: string) => {
    trackMarketplaceEvent('product_viewed', {
      product_id: productId,
      seller_id: sellerId,
      user_id: userId,
    });
  },

  productAddedToCart: (productId: string, sellerId: string, userId?: string) => {
    trackMarketplaceEvent('product_added_to_cart', {
      product_id: productId,
      seller_id: sellerId,
      user_id: userId,
    });
  },

  productRemovedFromCart: (productId: string, sellerId: string, userId?: string) => {
    trackMarketplaceEvent('product_removed_from_cart', {
      product_id: productId,
      seller_id: sellerId,
      user_id: userId,
    });
  },

  // Seller events
  sellerProfileViewed: (sellerId: string, userId?: string) => {
    trackMarketplaceEvent('seller_profile_viewed', {
      seller_id: sellerId,
      user_id: userId,
    });
  },

  // Review events
  reviewSubmitted: (sellerId: string, orderId: string, rating: number, userId?: string) => {
    trackMarketplaceEvent('review_submitted', {
      seller_id: sellerId,
      order_id: orderId,
      rating: rating,
      user_id: userId,
    });
  },

  // Order events
  orderCreated: (orderId: string, sellerId: string, amount: number, currency: string, userId?: string) => {
    trackMarketplaceEvent('order_created', {
      order_id: orderId,
      seller_id: sellerId,
      amount: amount,
      currency: currency,
      user_id: userId,
    });
  },

  orderCompleted: (orderId: string, sellerId: string, amount: number, userId?: string) => {
    trackMarketplaceEvent('order_completed', {
      order_id: orderId,
      seller_id: sellerId,
      amount: amount,
      user_id: userId,
    });
  },

  // Payment events
  paymentInitiated: (orderId: string, paymentMethod: string, amount: number, userId?: string) => {
    trackMarketplaceEvent('payment_initiated', {
      order_id: orderId,
      payment_method: paymentMethod,
      amount: amount,
      user_id: userId,
    });
  },

  paymentSucceeded: (orderId: string, transactionId: string, paymentMethod: string, amount: number, userId?: string) => {
    trackMarketplaceEvent('payment_succeeded', {
      order_id: orderId,
      transaction_id: transactionId,
      payment_method: paymentMethod,
      amount: amount,
      user_id: userId,
    });
  },

  paymentFailed: (orderId: string, paymentMethod: string, amount: number, error: string, userId?: string) => {
    trackMarketplaceEvent('payment_failed', {
      order_id: orderId,
      payment_method: paymentMethod,
      amount: amount,
      error: error,
      user_id: userId,
    });
  },

  // Messaging events
  messageStarted: (sellerId: string, threadId: string, userId?: string) => {
    trackMarketplaceEvent('message_started', {
      seller_id: sellerId,
      thread_id: threadId,
      user_id: userId,
    });
  },

  messageSent: (sellerId: string, threadId: string, userId?: string) => {
    trackMarketplaceEvent('message_sent', {
      seller_id: sellerId,
      thread_id: threadId,
      user_id: userId,
    });
  },

  // Checkout events
  checkoutInitiated: (cartItems: number, totalAmount: number, userId?: string) => {
    trackMarketplaceEvent('checkout_initiated', {
      cart_items: cartItems,
      total_amount: totalAmount,
      user_id: userId,
    });
  },

  // Notification events
  notificationReceived: (notificationType: string, userId?: string) => {
    trackMarketplaceEvent('notification_received', {
      notification_type: notificationType,
      user_id: userId,
    });
  },

  notificationRead: (notificationId: string, userId?: string) => {
    trackMarketplaceEvent('notification_read', {
      notification_id: notificationId,
      user_id: userId,
    });
  },

  // Page view tracking
  pageViewed: (pageName: string, properties?: Record<string, any>) => {
    trackMarketplaceEvent('$pageview', {
      page: pageName,
      ...properties,
    });
  },

  // User identification
  identifyUser: (userId: string, userProperties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(userId, userProperties);
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.people.set(properties);
    }
  },

  // Reset user (on logout)
  resetUser: () => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.reset();
    }
  },
};

// Hook for using analytics in React components
export const useAnalytics = () => {
  return analytics;
};

// Higher-order component for automatic page tracking
export const withAnalytics = (WrappedComponent: React.ComponentType<any>, pageName: string) => {
  return (props: any) => {
    React.useEffect(() => {
      analytics.pageViewed(pageName);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};

// Utility function to get user country from IP (if available)
export const getUserCountry = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'Unknown';
  } catch (error) {
    console.warn('Failed to get user country:', error);
    return 'Unknown';
  }
};

export default analytics;
