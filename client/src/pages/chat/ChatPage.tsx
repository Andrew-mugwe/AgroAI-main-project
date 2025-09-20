import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ConversationsList from '../../components/chat/ConversationsList'
import ChatRoom from '../../components/chat/ChatRoom'
import { useAuth } from '../../context/AuthContext'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>(
    conversationId ? parseInt(conversationId) : undefined
  )

  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(parseInt(conversationId))
    }
  }, [conversationId])

  const handleConversationSelect = (id: number) => {
    setSelectedConversationId(id)
    navigate(`/chat/${id}`)
  }

  const handleBack = () => {
    setSelectedConversationId(undefined)
    navigate('/chat')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Conversations List */}
        <motion.div
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className={`${selectedConversationId ? 'hidden lg:block' : 'block'}`}
        >
          <ConversationsList
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversationId}
          />
        </motion.div>

        {/* Chat Room */}
        {selectedConversationId ? (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <ChatRoom
              conversationId={selectedConversationId}
              currentUserId={user.id}
              onBack={handleBack}
            />
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat</h2>
              <p className="text-gray-600 mb-6">
                Select a conversation from the sidebar to start messaging
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Send direct messages to other users</p>
                <p>• Join group conversations</p>
                <p>• Get real-time updates</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
