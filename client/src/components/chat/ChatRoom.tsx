import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MoreVertical, Users, Phone, Video } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
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

interface ChatRoomProps {
  conversationId: number
  currentUserId: string
  onBack?: () => void
}

export default function ChatRoom({ conversationId, currentUserId, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [conversation, setConversation] = useState<ConversationPreview | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async (afterTimestamp?: string) => {
    try {
      if (afterTimestamp) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const params = new URLSearchParams({
        limit: '50'
      })
      
      if (afterTimestamp) {
        params.append('after', afterTimestamp)
      }

      const response = await axios.get(`/api/messages/thread/${conversationId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const newMessages = response.data.messages
        setHasMore(response.data.has_more)
        
        if (afterTimestamp) {
          // Prepend older messages
          setMessages(prev => [...prev, ...newMessages])
        } else {
          // Replace with new messages
          setMessages(newMessages)
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch messages')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const conv = response.data.conversations.find((c: ConversationPreview) => c.id === conversationId)
        setConversation(conv)
      }
    } catch (err) {
      console.error('Failed to fetch conversation details:', err)
    }
  }

  const handleMessageSent = (response: any) => {
    // Add the new message to the list
    // In a real implementation, you'd get the full message object from the response
    // For now, we'll refetch messages to get the latest
    fetchMessages()
  }

  const handleLoadMore = () => {
    if (messages.length > 0 && hasMore && !loadingMore) {
      const oldestMessage = messages[messages.length - 1]
      fetchMessages(oldestMessage.created_at)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    if (scrollTop === 0 && hasMore && !loadingMore) {
      handleLoadMore()
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchConversation()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length > 0) {
        const latestMessage = messages[0]
        fetchMessages(latestMessage.created_at)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [messages])

  const getConversationTitle = () => {
    if (!conversation) return 'Loading...'
    
    if (conversation.type === 'direct') {
      return conversation.other_members?.[0] || 'Unknown User'
    }
    return `Group Chat (${conversation.member_count} members)`
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMessages()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {conversation?.type === 'direct' ? '👤' : '👥'}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {getConversationTitle()}
              </h2>
              <p className="text-sm text-gray-500">
                {conversation?.type === 'direct' ? 'Direct message' : `${conversation?.member_count} members`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            )
          })}
        </AnimatePresence>

        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">💬</div>
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        conversationId={conversationId}
        onMessageSent={handleMessageSent}
      />
    </div>
  )
}
