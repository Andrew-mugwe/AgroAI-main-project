import React from 'react';
import RatingStars from './RatingStars';
import './ReviewList.css';

interface Review {
  id: number;
  order_id: number;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  review: string;
  created_at: string;
  reviewer_name?: string;
}

interface ReviewListProps {
  reviews: Review[];
  maxReviews?: number;
  showHeader?: boolean;
  showOrderId?: boolean;
  className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  maxReviews = 5,
  showHeader = true,
  showOrderId = false,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReviewerName = (reviewerId: string, reviewerName?: string) => {
    if (reviewerName) return reviewerName;
    
    // For demo purposes, generate a name from the ID
    const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn'];
    const index = parseInt(reviewerId.slice(-2), 16) % names.length;
    return names[index];
  };

  const displayedReviews = reviews.slice(0, maxReviews);

  if (reviews.length === 0) {
    return (
      <div className={`review-list empty ${className}`}>
        {showHeader && (
          <h3 className="review-list-header">Customer Reviews</h3>
        )}
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this seller!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`review-list ${className}`}>
      {showHeader && (
        <div className="review-list-header">
          <h3>Customer Reviews</h3>
          <span className="review-count">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      
      <div className="reviews-container">
        {displayedReviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <span className="reviewer-name">
                  {getReviewerName(review.reviewer_id, review.reviewer_name)}
                </span>
                {showOrderId && (
                  <span className="order-id">
                    Order #{review.order_id}
                  </span>
                )}
              </div>
              <div className="review-meta">
                <RatingStars rating={review.rating} size="small" />
                <span className="review-date">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
            
            {review.review && (
              <div className="review-content">
                <p>{review.review}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {reviews.length > maxReviews && (
        <div className="show-more">
          <button className="show-more-button">
            Show all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
