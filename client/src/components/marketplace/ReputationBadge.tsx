import React, { useState } from 'react';
import './ReputationBadge.css';

interface ReputationBadgeProps {
  score: number;
  badge?: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  breakdown?: {
    rating_contrib: number;
    orders_contrib: number;
    disputes_penalty: number;
    verified_bonus: number;
    total_ratings: number;
    total_orders: number;
  };
  className?: string;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  score,
  badge,
  message,
  size = 'medium',
  showTooltip = true,
  breakdown,
  className = ''
}) => {
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  const getBadgeInfo = (score: number) => {
    if (score >= 90) {
      return {
        badge: badge || 'Top Seller',
        message: message || 'Excellent reputation with outstanding service',
        color: '#10b981', // Green
        bgColor: '#ecfdf5',
        borderColor: '#10b981'
      };
    } else if (score >= 80) {
      return {
        badge: badge || 'Trusted Seller',
        message: message || 'High-quality seller with great reviews',
        color: '#059669', // Darker green
        bgColor: '#ecfdf5',
        borderColor: '#059669'
      };
    } else if (score >= 70) {
      return {
        badge: badge || 'Good Seller',
        message: message || 'Reliable seller with positive feedback',
        color: '#3b82f6', // Blue
        bgColor: '#eff6ff',
        borderColor: '#3b82f6'
      };
    } else if (score >= 60) {
      return {
        badge: badge || 'Fair Seller',
        message: message || 'Satisfactory service with room for improvement',
        color: '#f59e0b', // Amber
        bgColor: '#fffbeb',
        borderColor: '#f59e0b'
      };
    } else if (score >= 50) {
      return {
        badge: badge || 'Needs Improvement',
        message: message || 'Working to improve service quality',
        color: '#ef4444', // Red
        bgColor: '#fef2f2',
        borderColor: '#ef4444'
      };
    } else {
      return {
        badge: badge || 'Under Review',
        message: message || 'Service quality needs attention',
        color: '#dc2626', // Darker red
        bgColor: '#fef2f2',
        borderColor: '#dc2626'
      };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '6px',
          iconSize: '14px'
        };
      case 'large':
        return {
          fontSize: '16px',
          padding: '8px 16px',
          borderRadius: '10px',
          iconSize: '20px'
        };
      default:
        return {
          fontSize: '14px',
          padding: '6px 12px',
          borderRadius: '8px',
          iconSize: '16px'
        };
    }
  };

  const badgeInfo = getBadgeInfo(score);
  const sizeStyles = getSizeStyles();

  const formatBreakdown = () => {
    if (!breakdown) return null;

    return (
      <div className="breakdown-content">
        <div className="breakdown-header">
          <strong>Reputation Breakdown</strong>
          <div className="score-display">
            <span className="score-number">{score.toFixed(1)}</span>
            <span className="score-label">/100</span>
          </div>
        </div>
        
        <div className="breakdown-items">
          <div className="breakdown-item">
            <span className="breakdown-label">Rating Contribution</span>
            <span className="breakdown-value">+{breakdown.rating_contrib.toFixed(1)}</span>
          </div>
          
          <div className="breakdown-item">
            <span className="breakdown-label">Orders Bonus</span>
            <span className="breakdown-value">+{breakdown.orders_contrib.toFixed(1)}</span>
          </div>
          
          {breakdown.disputes_penalty < 0 && (
            <div className="breakdown-item penalty">
              <span className="breakdown-label">Disputes Penalty</span>
              <span className="breakdown-value">{breakdown.disputes_penalty.toFixed(1)}</span>
            </div>
          )}
          
          {breakdown.verified_bonus > 0 && (
            <div className="breakdown-item bonus">
              <span className="breakdown-label">Verified Bonus</span>
              <span className="breakdown-value">+{breakdown.verified_bonus.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="breakdown-stats">
          <div className="stat">
            <span className="stat-value">{breakdown.total_ratings}</span>
            <span className="stat-label">Ratings</span>
          </div>
          <div className="stat">
            <span className="stat-value">{breakdown.total_orders}</span>
            <span className="stat-label">Orders</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`reputation-badge ${size} ${className}`}
      style={{
        fontSize: sizeStyles.fontSize,
        padding: sizeStyles.padding,
        borderRadius: sizeStyles.borderRadius,
        color: badgeInfo.color,
        backgroundColor: badgeInfo.bgColor,
        border: `1px solid ${badgeInfo.borderColor}`
      }}
      onMouseEnter={() => setShowTooltipContent(true)}
      onMouseLeave={() => setShowTooltipContent(false)}
    >
      <div className="badge-content">
        <div className="badge-icon">
          {score >= 80 ? '⭐' : score >= 60 ? '👍' : '⚠️'}
        </div>
        <div className="badge-text">
          <span className="badge-title">{badgeInfo.badge}</span>
          <span className="badge-score">{score.toFixed(0)}</span>
        </div>
      </div>
      
      {showTooltip && showTooltipContent && (
        <div className="reputation-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-header">
              <span className="tooltip-badge">{badgeInfo.badge}</span>
              <span className="tooltip-score">Score: {score.toFixed(1)}/100</span>
            </div>
            <p className="tooltip-message">{badgeInfo.message}</p>
            {breakdown && formatBreakdown()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationBadge;
