import React from 'react'
import { motion } from 'framer-motion'

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

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
}

export default function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800'
      case 'ngo': return 'bg-blue-100 text-blue-800'
      case 'trader': return 'bg-orange-100 text-orange-800'
      case 'admin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleEmoji = (role?: string) => {
    switch (role) {
      case 'farmer': return '🌾'
      case 'ngo': return '🤝'
      case 'trader': return '💰'
      case 'admin': return '⚙️'
      default: return '👤'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              {getRoleEmoji(message.sender_role)}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Info */}
          {!isOwn && message.sender_name && (
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-700 mr-2">
                {message.sender_name}
              </span>
              {message.sender_role && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(message.sender_role)}`}>
                  {message.sender_role}
                </span>
              )}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {format(new Date(message.created_at), 'HH:mm')}
            {message.status === 'read' && isOwn && (
              <span className="ml-1 text-blue-500">✓✓</span>
            )}
            {message.status === 'delivered' && isOwn && (
              <span className="ml-1 text-gray-400">✓</span>
            )}
          </div>
        </div>

        {/* Avatar for own messages */}
        {showAvatar && isOwn && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              Me
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
