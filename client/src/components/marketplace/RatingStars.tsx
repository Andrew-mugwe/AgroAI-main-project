import React, { useState } from 'react';
import './RatingStars.css';

interface RatingStarsProps {
  rating?: number;
  maxRating?: number;
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 0,
  maxRating = 5,
  interactive = false,
  size = 'medium',
  showNumber = false,
  onRatingChange,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [tempRating, setTempRating] = useState(rating);

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      setTempRating(starRating);
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive ? (hoverRating || tempRating) : rating;

  const getStarSize = () => {
    switch (size) {
      case 'small': return '16px';
      case 'large': return '24px';
      default: return '20px';
    }
  };

  const getStarColor = (starIndex: number) => {
    if (starIndex < displayRating) {
      return '#fbbf24'; // Gold/yellow for filled stars
    }
    return '#d1d5db'; // Gray for empty stars
  };

  return (
    <div className={`rating-stars ${interactive ? 'interactive' : ''} ${className}`}>
      <div className="stars-container">
        {Array.from({ length: maxRating }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`star-button ${interactive ? 'clickable' : ''}`}
            onClick={() => handleStarClick(index + 1)}
            onMouseEnter={() => handleStarHover(index + 1)}
            onMouseLeave={handleStarLeave}
            disabled={!interactive}
            style={{
              fontSize: getStarSize(),
              color: getStarColor(index),
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              padding: '2px',
              transition: 'color 0.2s ease'
            }}
            aria-label={`Rate ${index + 1} out of ${maxRating} stars`}
          >
            ★
          </button>
        ))}
      </div>
      {showNumber && (
        <span className="rating-number">
          {rating.toFixed(1)}
        </span>
      )}
      {interactive && (
        <div className="rating-text">
          {displayRating === 0 ? 'Click to rate' : 
           displayRating === 1 ? 'Poor' :
           displayRating === 2 ? 'Fair' :
           displayRating === 3 ? 'Good' :
           displayRating === 4 ? 'Very Good' :
           displayRating === 5 ? 'Excellent' : ''}
        </div>
      )}
    </div>
  );
};

export default RatingStars;