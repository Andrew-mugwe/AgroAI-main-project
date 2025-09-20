import React from 'react';
import { VerifiedBadge } from '../../VerifiedBadge';
import { RatingStars } from '../../RatingStars';
import './MessageBubble.css';

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
  sender_role?: string;
  // Seller trust signals
  seller_verified?: boolean;
  seller_rating?: number;
  seller_reviews_count?: number;
  seller_reputation_score?: number;
}

interface MessageBubbleProps {
  message: MarketplaceMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = false
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) {
      return null;
    }

    return (
      <div className="message-attachments">
        {message.attachments.map((attachment, index) => (
          <div key={index} className="attachment-item">
            {attachment.type === 'image' ? (
              <img 
                src={attachment.url} 
                alt={attachment.name || 'Attachment'} 
                className="attachment-image"
              />
            ) : (
              <div className="attachment-file">
                <span className="attachment-icon">📎</span>
                <span className="attachment-name">{attachment.name}</span>
                <span className="attachment-size">{attachment.size}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMessageContent = () => {
    if (message.message_type === 'system') {
      return (
        <div className="system-message">
          <div className="system-message-content">
            <span className="system-icon">ℹ️</span>
            <span className="system-text">{message.body}</span>
          </div>
          <span className="system-time">{formatTime(message.created_at)}</span>
        </div>
      );
    }

    return (
      <div className={`message-bubble ${isOwn ? 'own' : ''}`}>
        {showAvatar && !isOwn && (
          <div className="message-avatar">
            {getInitials(message.sender_name)}
          </div>
        )}
        
        <div className="message-content">
          <div className="message-header">
            <div className="flex items-center gap-2">
              <span className="message-sender">{message.sender_name}</span>
              {/* Seller Trust Signals */}
              {message.sender_role === 'seller' && message.seller_verified && (
                <VerifiedBadge verified={message.seller_verified} size="sm" />
              )}
              {message.sender_role === 'seller' && message.seller_rating && (
                <RatingStars 
                  rating={message.seller_rating} 
                  size="sm"
                  showCount
                  reviewCount={message.seller_reviews_count || 0}
                />
              )}
            </div>
            <span className="message-time">{formatTime(message.created_at)}</span>
          </div>
          
          <div className="message-body">
            {message.body}
          </div>
          
          {renderAttachments()}
        </div>
        
        {showAvatar && isOwn && (
          <div className="message-avatar own">
            {getInitials(message.sender_name)}
          </div>
        )}
      </div>
    );
  };

  return renderMessageContent();
};

export default MessageBubble;
