import React from 'react'
import { MapPin, Globe, Flag } from 'lucide-react'

interface SellerLocationProps {
  location: string
  country?: string
  region?: string
  showFlag?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SellerLocation({ 
  location, 
  country,
  region,
  showFlag = true,
  size = 'md',
  className = ''
}: SellerLocationProps) {
  const sizeClasses = {
    sm: 'h-3 w-3 text-xs',
    md: 'h-4 w-4 text-sm',
    lg: 'h-5 w-5 text-base'
  }

  const getCountryFlag = (countryName?: string) => {
    const flagMap: Record<string, string> = {
      'Kenya': '🇰🇪',
      'Uganda': '🇺🇬',
      'Tanzania': '🇹🇿',
      'Rwanda': '🇷🇼',
      'Ethiopia': '🇪🇹',
      'Ghana': '🇬🇭',
      'Nigeria': '🇳🇬',
      'South Africa': '🇿🇦'
    }
    return flagMap[countryName || ''] || '🌍'
  }

  const displayLocation = region ? `${region}, ${location}` : location
  const flag = getCountryFlag(country)

  return (
    <div className={`flex items-center space-x-1 text-gray-600 ${className}`}>
      {showFlag && (
        <span className="text-sm">{flag}</span>
      )}
      <MapPin className={`${sizeClasses[size].split(' ')[0]} text-gray-400`} />
      <span className={`${sizeClasses[size].split(' ')[1]} truncate`}>
        {displayLocation}
      </span>
    </div>
  )
}


