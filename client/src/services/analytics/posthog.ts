import React from 'react';

// PostHog configuration
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com';

// PostHog Events (matching backend events)
export const PostHogEvents = {
  // User events
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  
  // Product events
  PRODUCT_VIEWED: 'product_viewed',
  ADD_TO_CART: 'add_to_cart',
  
  // Checkout events
  CHECKOUT_INITIATED: 'checkout_initiated',
  
  // Payment events
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
  
  // Messaging events
  MESSAGE_STARTED: 'message_started',
  
  // Seller events
  SELLER_PROFILE_VIEWED: 'seller_profile_viewed',
  
  // Review events
  REVIEW_SUBMITTED: 'review_submitted',
  
  // Seller verification
  SELLER_VERIFIED: 'seller_verified',
  
  // Notification events
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_OPENED: 'notification_opened',
  NOTIFICATION_CLICKED: 'notification_clicked',
} as const;

// Initialize PostHog
export const initializePostHog = () => {
  if (POSTHOG_KEY) {
    console.log('PostHog would be initialized here');
  }
};

// Mock PostHog client for development
const mockPostHog = {
  capture: (event: string, properties?: Record<string, any>) => {
    console.log(`PostHog event: ${event}`, properties);
  },
  identify: (userId: string, properties?: Record<string, any>) => {
    console.log(`PostHog identify: ${userId}`, properties);
  },
  reset: () => {
    console.log('PostHog reset');
  }
};

// Analytics service
export const analytics = {
  // Product analytics
  productViewed: (productId: string, sellerId: string, userId?: string) => {
    mockPostHog.capture(PostHogEvents.PRODUCT_VIEWED, {
      product_id: productId,
      seller_id: sellerId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  productAddedToCart: (productId: string, sellerId: string, userId?: string) => {
    mockPostHog.capture(PostHogEvents.ADD_TO_CART, {
      product_id: productId,
      seller_id: sellerId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  checkoutInitiated: (cartItems: any[], userId?: string) => {
    mockPostHog.capture(PostHogEvents.CHECKOUT_INITIATED, {
      cart_items: cartItems.length,
      total_amount: cartItems.reduce((sum, item) => sum + item.price, 0),
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  // Payment analytics
  paymentSucceeded: (transactionId: string, amount: number, provider: string, userId?: string) => {
    mockPostHog.capture(PostHogEvents.PAYMENT_SUCCEEDED, {
      transaction_id: transactionId,
      amount,
      provider,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  paymentFailed: (error: string, amount: number, provider: string, userId?: string) => {
    mockPostHog.capture(PostHogEvents.PAYMENT_FAILED, {
      error,
      amount,
      provider,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  // Messaging analytics
  messageStarted: (threadRef: string, userId: string, participantCount: number) => {
    mockPostHog.capture(PostHogEvents.MESSAGE_STARTED, {
      thread_ref: threadRef,
      user_id: userId,
      participant_count: participantCount,
      timestamp: new Date().toISOString()
    });
  },

  // Seller analytics
  sellerProfileViewed: (sellerId: string, viewerId: string) => {
    mockPostHog.capture(PostHogEvents.SELLER_PROFILE_VIEWED, {
      seller_id: sellerId,
      viewer_id: viewerId,
      timestamp: new Date().toISOString()
    });
  },

  reviewSubmitted: (reviewId: string, productId: string, sellerId: string, rating: number, userId: string) => {
    mockPostHog.capture(PostHogEvents.REVIEW_SUBMITTED, {
      review_id: reviewId,
      product_id: productId,
      seller_id: sellerId,
      rating,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  sellerVerified: (sellerId: string, verifiedBy: string) => {
    mockPostHog.capture(PostHogEvents.SELLER_VERIFIED, {
      seller_id: sellerId,
      verified_by: verifiedBy,
      timestamp: new Date().toISOString()
    });
  },

  // Notification analytics
  notificationSent: (notificationId: string, userId: string, type: string) => {
    mockPostHog.capture(PostHogEvents.NOTIFICATION_SENT, {
      notification_id: notificationId,
      user_id: userId,
      type,
      timestamp: new Date().toISOString()
    });
  },

  notificationOpened: (notificationId: string, userId: string) => {
    mockPostHog.capture(PostHogEvents.NOTIFICATION_OPENED, {
      notification_id: notificationId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  notificationClicked: (notificationId: string, userId: string, action: string) => {
    mockPostHog.capture(PostHogEvents.NOTIFICATION_CLICKED, {
      notification_id: notificationId,
      user_id: userId,
      action,
      timestamp: new Date().toISOString()
    });
  },

  // Page analytics
  pageViewed: (pageName: string, userId?: string) => {
    mockPostHog.capture('page_viewed', {
      page: pageName,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  },

  // User analytics
  userSignedUp: (userId: string, role: string) => {
    mockPostHog.capture(PostHogEvents.USER_SIGNED_UP, {
      user_id: userId,
      role,
      timestamp: new Date().toISOString()
    });
  },

  userLoggedIn: (userId: string, role: string) => {
    mockPostHog.capture(PostHogEvents.USER_LOGGED_IN, {
      user_id: userId,
      role,
      timestamp: new Date().toISOString()
    });
  },

  // Direct tracking method
  track: (event: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
      console.log(`PostHog event: ${event}`, properties);
    }
  },

  // User identification
  identify: (userId: string, properties?: Record<string, any>) => {
    mockPostHog.identify(userId, properties);
  },

  // Reset user session
  resetUser: () => {
    mockPostHog.reset();
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
export const getUserCountry = async (): Promise<string | null> => {
  try {
    // In a real implementation, you'd call a geolocation service
    return 'US'; // Mock value
  } catch (error) {
    console.error('Error getting user country:', error);
    return null;
  }
};