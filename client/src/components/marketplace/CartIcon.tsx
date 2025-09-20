import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

interface CartIconProps {
  onClick: () => void
  className?: string
}

export function CartIcon({ onClick, className = '' }: CartIconProps) {
  const { state } = useCart()

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-white/10 rounded-lg transition-colors ${className}`}
    >
      <ShoppingCart className="h-6 w-6 text-white" />
      
      {/* Cart Badge */}
      {state.itemCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
        >
          {state.itemCount > 99 ? '99+' : state.itemCount}
        </motion.div>
      )}
    </button>
  )
}
