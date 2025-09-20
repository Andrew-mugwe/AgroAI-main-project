import React from 'react'
import { CheckCircle2, Shield, Award, Star } from 'lucide-react'

interface VerifiedSellerBadgeProps {
  isVerified: boolean
  verificationType?: 'basic' | 'premium' | 'enterprise'
  trustScore?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function VerifiedSellerBadge({ 
  isVerified, 
  verificationType = 'basic',
  trustScore,
  size = 'md',
  className = '' 
}: VerifiedSellerBadgeProps) {
  if (!isVerified) return null

  const getVerificationConfig = () => {
    switch (verificationType) {
      case 'premium':
        return {
          icon: Award,
          text: 'Premium Seller',
          bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
      case 'enterprise':
        return {
          icon: Shield,
          text: 'Enterprise Verified',
          bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
      default:
        return {
          icon: CheckCircle2,
          text: 'Verified Seller',
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
    }
  }

  const config = getVerificationConfig()
  const Icon = config.icon

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-3 py-2 text-sm'
      default:
        return 'px-2 py-1 text-xs'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'lg':
        return 'h-4 w-4'
      default:
        return 'h-3 w-3'
    }
  }

  return (
    <div className={`inline-flex items-center space-x-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${getSizeClasses()} ${className}`}>
      <Icon className={`${getIconSize()} ${config.iconColor}`} />
      <span>{config.text}</span>
      {trustScore && (
        <span className="ml-1 opacity-90">
          {trustScore}%
        </span>
      )}
    </div>
  )
}


