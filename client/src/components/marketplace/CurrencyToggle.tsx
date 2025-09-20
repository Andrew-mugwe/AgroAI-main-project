import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Coins } from 'lucide-react'
import { useCart } from '../../context/CartContext'

interface CurrencyToggleProps {
  className?: string
}

export function CurrencyToggle({ className = '' }: CurrencyToggleProps) {
  const { state, setCurrency } = useCart()

  const currencies = [
    { code: 'KES', label: 'Kenyan Shilling', icon: Coins, flag: '🇰🇪' },
    { code: 'USD', label: 'US Dollar', icon: DollarSign, flag: '🇺🇸' }
  ] as const

  const currentCurrency = currencies.find(c => c.code === state.currency)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-300">Currency:</span>
      <div className="flex bg-white/10 rounded-lg p-1">
        {currencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => setCurrency(currency.code)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              state.currency === currency.code
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{currency.flag}</span>
            <span>{currency.code}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
