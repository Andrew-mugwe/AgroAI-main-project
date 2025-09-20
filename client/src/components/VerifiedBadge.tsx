import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VerifiedBadge({ 
  verified, 
  size = 'sm', 
  showText = false, 
  className = '' 
}: VerifiedBadgeProps) {
  if (!verified) return null;

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

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <CheckCircle 
        className={`${sizeClasses[size]} text-blue-500`} 
        fill="currentColor"
      />
      {showText && (
        <span className={`${textSizeClasses[size]} text-blue-600 font-medium`}>
          Verified
        </span>
      )}
    </div>
  );
}

export default VerifiedBadge;
