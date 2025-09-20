import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  showCount?: boolean;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({ 
  rating, 
  maxRating = 5,
  size = 'sm',
  showNumber = false,
  showCount = false,
  reviewCount,
  className = ''
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Generate full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={i}
        className={`${sizeClasses[size]} text-yellow-400`}
        fill="currentColor"
      />
    );
  }

  // Generate half star if needed
  if (hasHalfStar) {
    stars.push(
      <Star
        key="half"
        className={`${sizeClasses[size]} text-yellow-400`}
        fill="url(#half-gradient)"
      />
    );
  }

  // Generate empty stars
  const emptyStars = maxRating - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        className={`${sizeClasses[size]} text-gray-300`}
        fill="none"
        stroke="currentColor"
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* Half star gradient definition */}
      {hasHalfStar && (
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      )}
      
      <div className="flex items-center">
        {stars}
      </div>
      
      {showNumber && (
        <span className={`${textSizeClasses[size]} text-gray-600 ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
      
      {showCount && reviewCount !== undefined && (
        <span className={`${textSizeClasses[size]} text-gray-500 ml-1`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

export default RatingStars;
