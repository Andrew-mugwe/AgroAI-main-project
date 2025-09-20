import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Users, User, Search } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import axios from 'axios'

interface Message {
  id: number
  conversation_id: number
  sender_id: string
  body: string
  created_at: string
  status: string
  sender_name?: string
  sender_role?: string
}

interface ConversationPreview {
  id: number
  type: string
  created_at: string
  latest_message?: Message
  member_count: number
  other_members?: string[]
}

interface ConversationsListProps {
  onConversationSelect: (conversationId: number) => void
  selectedConversationId?: number
}

export default function ConversationsList({ 
  onConversationSelect, 
  selectedConversationId 
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setConversations(response.data.conversations)
      } else {
        throw new Error(response.data.message || 'Failed to fetch conversations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
    
    // Poll for new conversations every 30 seconds
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  const getConversationTitle = (conversation: ConversationPreview) => {
    if (conversation.type === 'direct') {
      return conversation.other_members?.[0] || 'Unknown User'
    }
    return `Group Chat (${conversation.member_count} members)`
  }

  const getConversationIcon = (conversation: ConversationPreview) => {
    if (conversation.type === 'direct') {
      return <User className="w-5 h-5" />
    }
    return <Users className="w-5 h-5" />
  }

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true
    
    const title = getConversationTitle(conversation).toLowerCase()
    const latestMessage = conversation.latest_message?.body.toLowerCase() || ''
    
    return title.includes(searchQuery.toLowerCase()) || 
           latestMessage.includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchConversations}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Conversations</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                    {getConversationIcon(conversation)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {getConversationTitle(conversation)}
                      </h3>
                      {conversation.latest_message && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.latest_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    {conversation.latest_message ? (
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.latest_message.sender_name && (
                          <span className="font-medium">
                            {conversation.latest_message.sender_name}: 
                          </span>
                        )}
                        {conversation.latest_message.body}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No messages yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
