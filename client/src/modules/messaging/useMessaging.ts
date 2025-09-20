import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingAPI, Message, Conversation, MessagePoller } from './index';

export interface UseMessagingOptions {
  autoPoll?: boolean;
  pollInterval?: number;
  initialConversationId?: number;
}

export interface UseMessagingReturn {
  // State
  conversations: Conversation[];
  messages: Message[];
  currentConversationId: number | null;
  loading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  
  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number, refresh?: boolean) => Promise<void>;
  sendMessage: (body: string, conversationId?: number) => Promise<boolean>;
  selectConversation: (conversationId: number) => void;
  loadMoreMessages: () => Promise<void>;
  
  // Polling
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export const useMessaging = (options: UseMessagingOptions = {}): UseMessagingReturn => {
  const {
    autoPoll = true,
    pollInterval = 5000,
    initialConversationId,
  } = options;

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(
    initialConversationId || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Refs
  const pollerRef = useRef<MessagePoller | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingAPI.getConversations();
      setConversations(response.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number, refresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const after = refresh ? undefined : lastMessageTimeRef.current;
      const response = await messagingAPI.getConversationMessages(conversationId, 50, after);

      if (refresh) {
        setMessages(response.messages);
      } else {
        setMessages(prev => [...prev, ...response.messages]);
      }

      setHasMoreMessages(response.has_more);
      
      if (response.messages.length > 0) {
        lastMessageTimeRef.current = response.messages[0].created_at;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (body: string, conversationId?: number): Promise<boolean> => {
    try {
      setError(null);
      
      const targetConversationId = conversationId || currentConversationId;
      if (!targetConversationId) {
        setError('No conversation selected');
        return false;
      }

      const response = await messagingAPI.sendMessageToConversation(targetConversationId, body);
      
      if (response.success) {
        // Reload messages to get the new message
        await loadMessages(targetConversationId, true);
        return true;
      } else {
        setError(response.message || 'Failed to send message');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  }, [currentConversationId, loadMessages]);

  // Select conversation
  const selectConversation = useCallback((conversationId: number) => {
    setCurrentConversationId(conversationId);
    setMessages([]);
    setHasMoreMessages(false);
    lastMessageTimeRef.current = null;
  }, []);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!currentConversationId || !hasMoreMessages || loading) return;
    
    await loadMessages(currentConversationId, false);
  }, [currentConversationId, hasMoreMessages, loading, loadMessages]);

  // Polling functions
  const pollForUpdates = useCallback(async () => {
    if (!currentConversationId) return;

    try {
      // Check for new messages in current conversation
      const response = await messagingAPI.getConversationMessages(currentConversationId, 10);
      
      if (response.messages.length > 0) {
        const latestMessage = response.messages[0];
        const currentLatest = messages[0];
        
        // If we have new messages, reload
        if (!currentLatest || latestMessage.id !== currentLatest.id) {
          await loadMessages(currentConversationId, true);
        }
      }

      // Also refresh conversations list to update last message previews
      await loadConversations();
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, [currentConversationId, messages, loadMessages, loadConversations]);

  const startPolling = useCallback(() => {
    if (pollerRef.current) return;

    pollerRef.current = new MessagePoller(pollForUpdates, pollInterval);
    pollerRef.current.start();
    setIsPolling(true);
  }, [pollForUpdates, pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollerRef.current) {
      pollerRef.current.stop();
      pollerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Load initial data
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId, true);
    }
  }, [currentConversationId, loadMessages]);

  // Auto-polling
  useEffect(() => {
    if (autoPoll) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoPoll, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // State
    conversations,
    messages,
    currentConversationId,
    loading,
    error,
    hasMoreMessages,
    
    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    selectConversation,
    loadMoreMessages,
    
    // Polling
    startPolling,
    stopPolling,
    isPolling,
  };
};

export default useMessaging;
