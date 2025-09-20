// Frontend Messaging Module
// This module provides a clean interface for messaging functionality

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  body: string;
  created_at: string;
  status: 'delivered' | 'read';
}

export interface Conversation {
  id: number;
  type: 'direct' | 'group';
  created_at: string;
  last_message?: Message;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  user_id: string;
  role: 'farmer' | 'ngo' | 'trader' | 'admin';
  first_name?: string;
  last_name?: string;
}

export interface SendMessageRequest {
  conversation_id?: number;
  receiver_id?: string;
  body: string;
  role_scope?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  message_id?: number;
  conversation_id?: number;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  has_more: boolean;
  next_after?: string;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// API Client
class MessagingAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get user conversations
  async getConversations(): Promise<ConversationsResponse> {
    return this.request<ConversationsResponse>('/api/messages/conversations');
  }

  // Get conversation messages
  async getConversationMessages(
    conversationId: number,
    limit: number = 50,
    after?: string
  ): Promise<MessagesResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(after && { after }),
    });

    return this.request<MessagesResponse>(
      `/api/messages/${conversationId}?${params}`
    );
  }

  // Send message
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Send message to specific conversation
  async sendMessageToConversation(
    conversationId: number,
    body: string
  ): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(`/api/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  // Create new conversation
  async createConversation(
    type: 'direct' | 'group',
    participantIds: string[]
  ): Promise<{ success: boolean; conversation_id: number }> {
    return this.request('/api/messages/conversations/create', {
      method: 'POST',
      body: JSON.stringify({
        type,
        participant_ids: participantIds,
      }),
    });
  }
}

// Create API instance
export const messagingAPI = new MessagingAPI();

// Utility functions
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const getConversationTitle = (conversation: Conversation): string => {
  if (conversation.type === 'direct') {
    const otherParticipant = conversation.participants.find(
      (p) => p.role !== 'admin' // Assuming current user is admin or filter by current user
    );
    return otherParticipant
      ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
        `${otherParticipant.role} (${otherParticipant.user_id.slice(0, 8)})`
      : 'Direct Message';
  } else {
    return `Group Chat (${conversation.participants.length} members)`;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'farmer':
      return 'text-green-600 bg-green-100';
    case 'ngo':
      return 'text-blue-600 bg-blue-100';
    case 'trader':
      return 'text-orange-600 bg-orange-100';
    case 'admin':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Message validation
export const validateMessage = (body: string): { valid: boolean; error?: string } => {
  if (!body.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const maxLength = 500; // Should match backend MAX_MESSAGE_LENGTH
  if (body.length > maxLength) {
    return { valid: false, error: `Message too long (max ${maxLength} characters)` };
  }

  return { valid: true };
};

// Polling utility
export class MessagePoller {
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;

  constructor(
    private callback: () => Promise<void>,
    private interval: number = 5000 // 5 seconds
  ) {}

  start(): void {
    if (this.isPolling) return;

    this.isPolling = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.callback();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
  }

  isActive(): boolean {
    return this.isPolling;
  }
}

export default messagingAPI;
