import React, { useState, useEffect, useRef } from 'react';
import { useMarketplaceSocket } from '../../../hooks/useMarketplaceSocket';
import MessageBubble from './MessageBubble';
import NewMessageInput from './NewMessageInput';
import EscalationBanner from './EscalationBanner';
import { VerifiedBadge } from '../../VerifiedBadge';
import { RatingStars } from '../../RatingStars';
import './ChatRoom.css';

interface MarketplaceMessage {
  id: number;
  thread_id: number;
  sender_id: string;
  sender_name: string;
  body: string;
  attachments: any[];
  message_type: string;
  created_at: string;
  updated_at: string;
}

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

interface ChatRoomProps {
  threadRef: string;
  currentUserId: string;
  onThreadUpdate?: (thread: MarketplaceThread) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  threadRef,
  currentUserId,
  onThreadUpdate
}) => {
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [threadInfo, setThreadInfo] = useState<MarketplaceThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // WebSocket hook
  const { isConnected, subscribe, unsubscribe } = useMarketplaceSocket({
    userId: currentUserId,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('WebSocket connected');
      subscribe(threadRef);
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    }
  });

  // Handle incoming WebSocket messages
  function handleWebSocketMessage(message: any) {
    if (message.type === 'new_message' && message.thread_ref === threadRef) {
      const newMessage: MarketplaceMessage = {
        id: message.data.id,
        thread_id: threadInfo?.id || 0,
        sender_id: message.data.sender_id,
        sender_name: message.data.sender_name,
        body: message.data.body,
        attachments: message.data.attachments || [],
        message_type: message.data.message_type,
        created_at: message.data.created_at,
        updated_at: message.data.created_at
      };
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    } else if (message.type === 'thread_escalated' && message.thread_ref === threadRef) {
      // Handle thread escalation
      if (threadInfo) {
        const updatedThread = { ...threadInfo, status: 'escalated' };
        setThreadInfo(updatedThread);
        onThreadUpdate?.(updatedThread);
      }
    }
  }

  useEffect(() => {
    if (threadRef) {
      fetchThreadInfo();
      fetchMessages();
      subscribe(threadRef);
    }

    return () => {
      if (threadRef) {
        unsubscribe(threadRef);
      }
    };
  }, [threadRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThreadInfo = async () => {
    try {
      // In a real app, this would call the actual API
      // For demo purposes, return mock data based on threadRef
      const mockThreadInfo: MarketplaceThread = {
        id: 1,
        thread_ref: threadRef,
        product_id: 'prod_001',
        buyer_id: currentUserId,
        seller_id: '890e1234-e89b-12d3-a456-426614174003',
        status: threadRef === 'thread_demo_tools_003' ? 'escalated' : 'open',
        created_at: '2024-01-13T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        product_name: 'Premium Coffee Beans',
        product_price: 125.00,
        buyer_name: 'Alex Johnson',
        seller_name: 'Green Valley Farms',
        participant_count: threadRef === 'thread_demo_tools_003' ? 3 : 2,
        unread_count: 0
      };
      
      setThreadInfo(mockThreadInfo);
    } catch (err) {
      setError('Failed to load thread info');
      console.error('Error fetching thread info:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // In a real app, this would call the actual API
      // For demo purposes, return mock data based on threadRef
      let mockMessages: MarketplaceMessage[] = [];
      
      if (threadRef === 'thread_demo_beans_001') {
        mockMessages = [
          {
            id: 1,
            thread_id: 1,
            sender_id: currentUserId,
            sender_name: 'Alex Johnson',
            body: 'Hi! I\'m interested in your 50kg beans. What\'s the best price you can offer?',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-13T10:00:00Z',
            updated_at: '2024-01-13T10:00:00Z'
          },
          {
            id: 2,
            thread_id: 1,
            sender_id: '890e1234-e89b-12d3-a456-426614174003',
            sender_name: 'Green Valley Farms',
            body: 'Hello! For 50kg, I can offer $2.50 per kg. That would be $125 total.',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-13T10:30:00Z',
            updated_at: '2024-01-13T10:30:00Z'
          },
          {
            id: 3,
            thread_id: 1,
            sender_id: currentUserId,
            sender_name: 'Alex Johnson',
            body: 'That sounds good! When can you deliver?',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-14T14:00:00Z',
            updated_at: '2024-01-14T14:00:00Z'
          },
          {
            id: 4,
            thread_id: 1,
            sender_id: '890e1234-e89b-12d3-a456-426614174003',
            sender_name: 'Green Valley Farms',
            body: 'I can deliver within 2-3 days. Would you like to proceed with the order?',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-14T17:00:00Z',
            updated_at: '2024-01-14T17:00:00Z'
          }
        ];
      } else if (threadRef === 'thread_demo_seeds_002') {
        mockMessages = [
          {
            id: 5,
            thread_id: 2,
            sender_id: '890e1234-e89b-12d3-a456-426614174006',
            sender_name: 'Sarah Wilson',
            body: 'Is pesticide X safe for maize? I\'m concerned about organic certification.',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-14T09:00:00Z',
            updated_at: '2024-01-14T09:00:00Z'
          },
          {
            id: 6,
            thread_id: 2,
            sender_id: '901e2345-e89b-12d3-a456-426614174007',
            sender_name: 'Organic Harvest Co',
            body: 'Yes, pesticide X is certified organic and safe for maize. I can provide the certification documents.',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-14T10:00:00Z',
            updated_at: '2024-01-14T10:00:00Z'
          },
          {
            id: 7,
            thread_id: 2,
            sender_id: '890e1234-e89b-12d3-a456-426614174006',
            sender_name: 'Sarah Wilson',
            body: 'Perfect! Please send the documents and I\'ll place the order.',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-15T16:45:00Z',
            updated_at: '2024-01-15T16:45:00Z'
          }
        ];
      } else if (threadRef === 'thread_demo_tools_003') {
        mockMessages = [
          {
            id: 8,
            thread_id: 3,
            sender_id: '901e2345-e89b-12d3-a456-426614174010',
            sender_name: 'Mike Chen',
            body: 'The tools I received are damaged and not as described. This is unacceptable!',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-15T14:00:00Z',
            updated_at: '2024-01-15T14:00:00Z'
          },
          {
            id: 9,
            thread_id: 3,
            sender_id: '012e3456-e89b-12d3-a456-426614174011',
            sender_name: 'Fresh Produce Ltd',
            body: 'I apologize for the issue. Let me check the shipment and get back to you.',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-15T14:30:00Z',
            updated_at: '2024-01-15T14:30:00Z'
          },
          {
            id: 10,
            thread_id: 3,
            sender_id: '456e7890-e89b-12d3-a456-426614174020',
            sender_name: 'NGO Support',
            body: 'I\'ve joined this thread to help resolve the dispute. Let me review the case.',
            attachments: [],
            message_type: 'text',
            created_at: '2024-01-15T17:00:00Z',
            updated_at: '2024-01-15T17:00:00Z'
          }
        ];
      }
      
      setMessages(mockMessages);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (body: string, attachments?: File[]) => {
    if (!body.trim() || sending) return;

    try {
      setSending(true);
      
      // Create optimistic message
      const optimisticMessage: MarketplaceMessage = {
        id: Date.now(), // Temporary ID
        thread_id: threadInfo?.id || 0,
        sender_id: currentUserId,
        sender_name: 'You',
        body: body.trim(),
        attachments: [],
        message_type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();

      // In a real app, this would call the actual API
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace optimistic message with real message (in real app, this would come from API response)
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, id: Math.floor(Math.random() * 10000), sender_name: 'Alex Johnson' }
          : msg
      ));

    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async (reason: string) => {
    try {
      // In a real app, this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (threadInfo) {
        const updatedThread = { ...threadInfo, status: 'escalated' };
        setThreadInfo(updatedThread);
        onThreadUpdate?.(updatedThread);
      }
    } catch (err) {
      setError('Failed to escalate thread');
      console.error('Error escalating thread:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="chat-room loading">
        <div className="loading-spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-room error">
        <p>Error: {error}</p>
        <button onClick={() => { setError(null); fetchMessages(); }}>Retry</button>
      </div>
    );
  }

  if (!threadInfo) {
    return (
      <div className="chat-room empty">
        <p>Thread not found</p>
      </div>
    );
  }

  return (
    <div className="chat-room">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="flex items-center gap-2 mb-1">
            <h3>
              {currentUserId === threadInfo.buyer_id ? threadInfo.seller_name : threadInfo.buyer_name}
            </h3>
            {/* Seller Trust Signals */}
            {currentUserId === threadInfo.buyer_id && threadInfo.seller_id && (
              <div className="flex items-center gap-1">
                <VerifiedBadge verified={threadInfo.seller_verified || false} size="sm" />
                <RatingStars 
                  rating={threadInfo.seller_rating || 0} 
                  size="sm"
                  showCount
                  reviewCount={threadInfo.seller_reviews_count || 0}
                />
              </div>
            )}
          </div>
          {threadInfo.product_name && (
            <p className="product-info">
              {threadInfo.product_name} • ${threadInfo.product_price?.toFixed(2)}
            </p>
          )}
          {/* Seller Location */}
          {currentUserId === threadInfo.buyer_id && threadInfo.seller_location && (
            <p className="seller-location text-xs text-gray-500">
              📍 {threadInfo.seller_location.city}, {threadInfo.seller_location.country}
            </p>
          )}
        </div>
        <div className="chat-header-meta">
          <span className={`status-badge ${threadInfo.status}`}>
            {threadInfo.status}
          </span>
          <span className="connection-status">
            {isConnected ? '🟢' : '🔴'}
          </span>
        </div>
      </div>

      {/* Escalation Banner */}
      {threadInfo.status === 'escalated' && (
        <EscalationBanner onEscalate={handleEscalate} />
      )}

      {/* Messages Container */}
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                showAvatar={true}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <NewMessageInput
        onSendMessage={handleSendMessage}
        disabled={sending || !isConnected}
        placeholder={
          !isConnected 
            ? "Connecting..." 
            : threadInfo.status === 'escalated' 
              ? "This conversation has been escalated to support"
              : "Type your message..."
        }
      />
    </div>
  );
};

export default ChatRoom;
