import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThreadsList from '../components/marketplace/chat/ThreadsList';
import ChatRoom from '../components/marketplace/chat/ChatRoom';
import './MarketplaceChat.css';

const MarketplaceChat: React.FC = () => {
  const { threadRef } = useParams<{ threadRef?: string }>();
  const navigate = useNavigate();
  const [currentUserId] = useState('789e0123-e89b-12d3-a456-426614174002'); // Demo user ID
  const [selectedThreadRef, setSelectedThreadRef] = useState<string | undefined>(threadRef);

  useEffect(() => {
    setSelectedThreadRef(threadRef);
  }, [threadRef]);

  const handleThreadSelect = (newThreadRef: string) => {
    setSelectedThreadRef(newThreadRef);
    navigate(`/marketplace/chat/${newThreadRef}`);
  };

  const handleThreadUpdate = (updatedThread: any) => {
    // Handle thread updates (e.g., status changes)
    console.log('Thread updated:', updatedThread);
  };

  return (
    <div className="marketplace-chat">
      <div className="chat-layout">
        {/* Threads List Sidebar */}
        <div className="threads-sidebar">
          <ThreadsList
            currentUserId={currentUserId}
            onThreadSelect={handleThreadSelect}
            selectedThreadRef={selectedThreadRef}
          />
        </div>

        {/* Chat Room */}
        <div className="chat-main">
          {selectedThreadRef ? (
            <ChatRoom
              threadRef={selectedThreadRef}
              currentUserId={currentUserId}
              onThreadUpdate={handleThreadUpdate}
            />
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">💬</div>
                <h3>Welcome to Marketplace Chat</h3>
                <p>Select a conversation from the sidebar to start chatting</p>
                <div className="placeholder-features">
                  <div className="feature-item">
                    <span className="feature-icon">🛒</span>
                    <span>Discuss products with sellers</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📦</span>
                    <span>Track order updates</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🆘</span>
                    <span>Get support when needed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceChat;
