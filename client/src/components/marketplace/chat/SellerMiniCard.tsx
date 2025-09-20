import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { VerifiedBadge } from '../../VerifiedBadge';
import { RatingStars } from '../../RatingStars';

interface SellerMiniCardProps {
  seller: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    reviews_count: number;
    reputation_score?: number;
    location?: {
      country: string;
      city: string;
    };
  };
  compact?: boolean;
  className?: string;
}

export function SellerMiniCard({ seller, compact = false, className = '' }: SellerMiniCardProps) {
  const navigate = useNavigate();

  const handleSellerClick = () => {
    navigate(`/sellers/${seller.id}`);
  };

  if (compact) {
    return (
      <div className={`seller-mini-card-compact ${className}`}>
        <button
          onClick={handleSellerClick}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
        >
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-900 truncate">
                {seller.name}
              </span>
              <VerifiedBadge verified={seller.verified} size="sm" />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <RatingStars rating={seller.rating} size="sm" showNumber />
              <span>({seller.reviews_count})</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`seller-mini-card ${className}`}>
      <button
        onClick={handleSellerClick}
        className="w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 truncate">
                {seller.name}
              </span>
              <VerifiedBadge verified={seller.verified} size="sm" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <RatingStars 
                rating={seller.rating} 
                size="sm"
                showNumber
                showCount
                reviewCount={seller.reviews_count}
              />
            </div>

            {/* Location */}
            {seller.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{seller.location.city}, {seller.location.country}</span>
              </div>
            )}

            {/* Reputation Score */}
            {seller.reputation_score && (
              <div className="mt-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    seller.reputation_score >= 80 ? 'bg-green-500' :
                    seller.reputation_score >= 60 ? 'bg-blue-500' :
                    seller.reputation_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-600">
                    Reputation: {Math.round(seller.reputation_score)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

export default SellerMiniCard;
