import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home,
  Info,
  LayoutDashboard,
  MessageSquare,
  Bug,
  Mic,
  Contact,
  Bot,
  X,
  BarChart3
} from 'lucide-react'

interface MenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Info, label: 'About', path: '/about' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Features', path: '/features' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: MessageSquare, label: 'Community Q&A', path: '/community' },
    { icon: Bug, label: 'Pest Detection', path: '/pest-detection' },
    { icon: Mic, label: 'Voice Assistant', path: '/voice-assistant' },
    { icon: Contact, label: 'Contact', path: '/contact' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-2">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className="flex items-center space-x-4 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="p-4 border-t">
              <button className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-900 transition-colors">
                <Bot className="h-5 w-5" />
                <span>Try AI Assistant</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
