import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Building,
  ShoppingCart
} from 'lucide-react';

interface DemoMessage {
  id: number;
  conversation_id: number;
  sender_id: string;
  body: string;
  created_at: string;
  status: 'delivered' | 'read';
  sender_role: 'farmer' | 'ngo' | 'trader' | 'admin';
  sender_name: string;
}

interface DemoConversation {
  id: number;
  type: 'direct' | 'group';
  title: string;
  participants: string[];
  last_message: DemoMessage;
  message_count: number;
}

const MessagingDemo: React.FC = () => {
  const { t } = useTranslation('chat');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [conversations] = useState<DemoConversation[]>([
    {
      id: 1,
      type: 'direct',
      title: 'Farmer ↔ NGO: Crop rotation advice',
      participants: ['John Farmer', 'Sarah NGO'],
      message_count: 4,
      last_message: {
        id: 4,
        conversation_id: 1,
        sender_id: '22222222-2222-2222-2222-222222222222',
        body: 'Plant legumes 2-3 weeks after maize harvest, during the short rains.',
        created_at: '2024-01-15T10:30:00Z',
        status: 'delivered',
        sender_role: 'ngo',
        sender_name: 'Sarah NGO'
      }
    },
    {
      id: 2,
      type: 'group',
      title: 'Group: Sustainable farming training',
      participants: ['Sarah NGO', 'John Farmer', 'Jane Farmer', 'Peter Farmer'],
      message_count: 5,
      last_message: {
        id: 9,
        conversation_id: 2,
        sender_id: '55555555-5555-5555-5555-555555555555',
        body: 'I will also attend. Can we discuss pest management too?',
        created_at: '2024-01-15T09:15:00Z',
        status: 'delivered',
        sender_role: 'farmer',
        sender_name: 'Peter Farmer'
      }
    },
    {
      id: 3,
      type: 'direct',
      title: 'Trader ↔ NGO: Partnership discussion',
      participants: ['Mike Trader', 'Sarah NGO'],
      message_count: 2,
      last_message: {
        id: 11,
        conversation_id: 3,
        sender_id: '22222222-2222-2222-2222-222222222222',
        body: 'That sounds like a great partnership opportunity! We work with over 200 farmers.',
        created_at: '2024-01-15T08:45:00Z',
        status: 'delivered',
        sender_role: 'ngo',
        sender_name: 'Sarah NGO'
      }
    },
    {
      id: 4,
      type: 'direct',
      title: 'Trader ↔ Farmer: Maize sale negotiation',
      participants: ['Mike Trader', 'John Farmer'],
      message_count: 4,
      last_message: {
        id: 15,
        conversation_id: 4,
        sender_id: '11111111-1111-1111-1111-111111111111',
        body: 'That sounds good! I can offer 2.30 USD per kg. When can you deliver?',
        created_at: '2024-01-15T07:20:00Z',
        status: 'delivered',
        sender_role: 'farmer',
        sender_name: 'John Farmer'
      }
    },
    {
      id: 5,
      type: 'direct',
      title: 'NGO ↔ Trader: Farmers market invitation',
      participants: ['Lisa NGO', 'Mike Trader'],
      message_count: 2,
      last_message: {
        id: 17,
        conversation_id: 5,
        sender_id: '33333333-3333-3333-3333-333333333333',
        body: 'Absolutely! That sounds like a great opportunity. What are the requirements?',
        created_at: '2024-01-15T06:30:00Z',
        status: 'delivered',
        sender_role: 'trader',
        sender_name: 'Mike Trader'
      }
    }
  ]);

  const [messages] = useState<DemoMessage[]>([
    {
      id: 1,
      conversation_id: 1,
      sender_id: '11111111-1111-1111-1111-111111111111',
      body: 'Hello Sarah! I need advice on crop rotation for my maize field. What do you recommend?',
      created_at: '2024-01-15T08:00:00Z',
      status: 'read',
      sender_role: 'farmer',
      sender_name: 'John Farmer'
    },
    {
      id: 2,
      conversation_id: 1,
      sender_id: '22222222-2222-2222-2222-222222222222',
      body: 'Hi John! For maize, I recommend rotating with legumes like beans or groundnuts. This helps with nitrogen fixation and soil health.',
      created_at: '2024-01-15T08:30:00Z',
      status: 'read',
      sender_role: 'ngo',
      sender_name: 'Sarah NGO'
    },
    {
      id: 3,
      conversation_id: 1,
      sender_id: '11111111-1111-1111-1111-111111111111',
      body: 'That sounds great! When is the best time to plant the legumes after harvesting maize?',
      created_at: '2024-01-15T09:00:00Z',
      status: 'read',
      sender_role: 'farmer',
      sender_name: 'John Farmer'
    },
    {
      id: 4,
      conversation_id: 1,
      sender_id: '22222222-2222-2222-2222-222222222222',
      body: 'Plant legumes 2-3 weeks after maize harvest, during the short rains. This gives the soil time to recover and the legumes will benefit from the residual nutrients.',
      created_at: '2024-01-15T10:30:00Z',
      status: 'delivered',
      sender_role: 'ngo',
      sender_name: 'Sarah NGO'
    }
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer':
        return <User className="w-4 h-4" />;
      case 'ngo':
        return <Building className="w-4 h-4" />;
      case 'trader':
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'text-green-600 bg-green-100';
      case 'ngo':
        return 'text-blue-600 bg-blue-100';
      case 'trader':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedMessages = selectedConversation 
    ? messages.filter(msg => msg.conversation_id === selectedConversation)
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💬 AgroAI Messaging System Demo
        </h1>
        <p className="text-gray-600">
          Real-time messaging between farmers, NGOs, and traders with role-based access control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Conversations</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {conversations.length}
              </span>
            </div>

            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conv.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900">
                      {conv.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conv.type === 'direct' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {conv.type}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {conv.last_message.body}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{conv.participants.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(conv.last_message.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {conversations.find(c => c.id === selectedConversation)?.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Online</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender_role === 'farmer' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div className={`flex gap-3 max-w-xs lg:max-w-md ${
                        message.sender_role === 'farmer' ? 'flex-row' : 'flex-row-reverse'
                      }`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          getRoleColor(message.sender_role)
                        }`}>
                          {getRoleIcon(message.sender_role)}
                        </div>

                        {/* Message */}
                        <div className={`flex flex-col ${
                          message.sender_role === 'farmer' ? 'items-start' : 'items-end'
                        }`}>
                          <div className={`px-3 py-2 rounded-lg ${
                            message.sender_role === 'farmer'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-600 text-white'
                          }`}>
                            <p className="text-sm">{message.body}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <span>{message.sender_name}</span>
                            <span>•</span>
                            <span>{formatTime(message.created_at)}</span>
                            {message.status === 'read' && (
                              <>
                                <span>•</span>
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the sidebar to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Total Conversations</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{conversations.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Total Messages</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {conversations.reduce((sum, conv) => sum + conv.message_count, 0)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">6</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">System Status</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">Online</p>
        </div>
      </div>
    </div>
  );
};

export default MessagingDemo;
