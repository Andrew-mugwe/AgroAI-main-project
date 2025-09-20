import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerifiedBadge } from '../../VerifiedBadge';
import { RatingStars } from '../../RatingStars';
import './ThreadsList.css';

interface MarketplaceThread {
  id: number;
  thread_ref: string;
  product_id?: string;
  order_id?: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  product_name?: string;
  product_price?: number;
  buyer_name: string;
  seller_name: string;
  latest_message?: MarketplaceMessage;
  participant_count: number;
  unread_count: number;
  // Seller trust signals
  seller_verified?: boolean;
  seller_rating?: number;
  seller_reviews_count?: number;
  seller_reputation_score?: number;
  seller_location?: {
    country: string;
    city: string;
  };
}

interface MarketplaceMessage {
  id: number;
  thread_id: number;
  sender_id: string;
  sender_name: string;
  body: string;
  message_type: string;
  created_at: string;
}

interface ThreadsListProps {
  currentUserId: string;
  onThreadSelect: (threadRef: string) => void;
  selectedThreadRef?: string;
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  currentUserId,
  onThreadSelect,
  selectedThreadRef
}) => {
  const [threads, setThreads] = useState<MarketplaceThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads();
  }, [currentUserId]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      // In a real app, this would use the actual API
      // For demo purposes, return mock data
      const mockThreads: MarketplaceThread[] = [
        {
          id: 1,
          thread_ref: 'thread_demo_beans_001',
          product_id: 'prod_001',
          buyer_id: currentUserId,
          seller_id: '890e1234-e89b-12d3-a456-426614174003',
          status: 'open',
          created_at: '2024-01-13T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          product_name: 'Premium Coffee Beans',
          product_price: 125.00,
          buyer_name: 'Alex Johnson',
          seller_name: 'Green Valley Farms',
          // Seller trust signals
          seller_verified: true,
          seller_rating: 4.8,
          seller_reviews_count: 127,
          seller_reputation_score: 92.5,
          seller_location: {
            country: 'Kenya',
            city: 'Nairobi'
          },
          latest_message: {
            id: 4,
            thread_id: 1,
            sender_id: '890e1234-e89b-12d3-a456-426614174003',
            sender_name: 'Green Valley Farms',
            body: 'I can deliver within 2-3 days. Would you like to proceed with the order?',
            message_type: 'text',
            created_at: '2024-01-15T14:30:00Z'
          },
          participant_count: 2,
          unread_count: 0
        },
        {
          id: 2,
          thread_ref: 'thread_demo_seeds_002',
          product_id: 'prod_002',
          buyer_id: '890e1234-e89b-12d3-a456-426614174006',
          seller_id: '901e2345-e89b-12d3-a456-426614174007',
          status: 'open',
          created_at: '2024-01-14T09:00:00Z',
          updated_at: '2024-01-15T16:45:00Z',
          product_name: 'Organic Maize Seeds',
          product_price: 45.00,
          buyer_name: 'Sarah Wilson',
          seller_name: 'Organic Harvest Co',
          // Seller trust signals
          seller_verified: true,
          seller_rating: 4.2,
          seller_reviews_count: 89,
          seller_reputation_score: 78.5,
          seller_location: {
            country: 'Uganda',
            city: 'Kampala'
          },
          latest_message: {
            id: 7,
            thread_id: 2,
            sender_id: '890e1234-e89b-12d3-a456-426614174006',
            sender_name: 'Sarah Wilson',
            body: 'Perfect! Please send the documents and I\'ll place the order.',
            message_type: 'text',
            created_at: '2024-01-15T16:45:00Z'
          },
          participant_count: 2,
          unread_count: 0
        },
        {
          id: 3,
          thread_ref: 'thread_demo_tools_003',
          product_id: 'prod_003',
          buyer_id: '901e2345-e89b-12d3-a456-426614174010',
          seller_id: '012e3456-e89b-12d3-a456-426614174011',
          status: 'escalated',
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-15T17:00:00Z',
          product_name: 'Garden Tools Set',
          product_price: 89.99,
          buyer_name: 'Mike Chen',
          seller_name: 'Fresh Produce Ltd',
          latest_message: {
            id: 10,
            thread_id: 3,
            sender_id: '456e7890-e89b-12d3-a456-426614174020',
            sender_name: 'NGO Support',
            body: 'I\'ve joined this thread to help resolve the dispute. Let me review the case.',
            message_type: 'text',
            created_at: '2024-01-15T17:00:00Z'
          },
          participant_count: 3,
          unread_count: 1
        }
      ];
      
      setThreads(mockThreads);
    } catch (err) {
      setError('Failed to load threads');
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherParticipantName = (thread: MarketplaceThread) => {
    return currentUserId === thread.buyer_id ? thread.seller_name : thread.buyer_name;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'escalated':
        return <span className="status-badge escalated">Escalated</span>;
      case 'closed':
        return <span className="status-badge closed">Closed</span>;
      default:
        return <span className="status-badge open">Open</span>;
    }
  };

  if (loading) {
    return (
      <div className="threads-list loading">
        <div className="loading-spinner"></div>
        <p>Loading threads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="threads-list error">
        <p>Error: {error}</p>
        <button onClick={fetchThreads}>Retry</button>
      </div>
    );
  }

  return (
    <div className="threads-list">
      <div className="threads-header">
        <h3>Marketplace Conversations</h3>
        <div className="threads-count">{threads.length} threads</div>
      </div>
      
      <div className="threads-container">
        {threads.length === 0 ? (
          <div className="no-threads">
            <p>No conversations yet</p>
            <p>Start a conversation from the marketplace!</p>
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className={`thread-item ${selectedThreadRef === thread.thread_ref ? 'selected' : ''} ${thread.unread_count > 0 ? 'unread' : ''}`}
              onClick={() => onThreadSelect(thread.thread_ref)}
            >
              <div className="thread-header">
                <div className="thread-title">
                  <div className="flex items-center gap-2">
                    <span className="participant-name">{getOtherParticipantName(thread)}</span>
                    {/* Seller Trust Signals */}
                    {currentUserId === thread.buyer_id && thread.seller_id && (
                      <div className="flex items-center gap-1">
                        <VerifiedBadge verified={thread.seller_verified || false} size="sm" />
                        <RatingStars 
                          rating={thread.seller_rating || 0} 
                          size="sm"
                          showCount
                          reviewCount={thread.seller_reviews_count || 0}
                        />
                      </div>
                    )}
                  </div>
                  {getStatusBadge(thread.status)}
                </div>
                <div className="thread-meta">
                  <span className="thread-time">{formatTime(thread.updated_at)}</span>
                  {thread.unread_count > 0 && (
                    <span className="unread-badge">{thread.unread_count}</span>
                  )}
                </div>
              </div>
              
              <div className="thread-product">
                {thread.product_name && (
                  <span className="product-name">{thread.product_name}</span>
                )}
                {thread.product_price && (
                  <span className="product-price">${thread.product_price.toFixed(2)}</span>
                )}
              </div>
              
              {thread.latest_message && (
                <div className="thread-preview">
                  <span className="sender-name">
                    {thread.latest_message.sender_name}:
                  </span>
                  <span className="message-preview">
                    {thread.latest_message.body.length > 50 
                      ? `${thread.latest_message.body.substring(0, 50)}...`
                      : thread.latest_message.body
                    }
                  </span>
                </div>
              )}
              
              <div className="thread-footer">
                <span className="participant-count">
                  {thread.participant_count} participant{thread.participant_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadsList;
