import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RatingStars from '../../components/marketplace/RatingStars';
import ReviewList from '../../components/marketplace/ReviewList';
import ReputationBadge from '../../components/marketplace/ReputationBadge';
import './Profile.css';

interface SellerProfile {
  seller_id: string;
  seller_name: string;
  avg_rating: number;
  total_ratings: number;
  five_star_ratings: number;
  positive_ratings: number;
  negative_ratings: number;
  recent_ratings: number;
  current_score: number;
  breakdown: {
    rating_contrib: number;
    orders_contrib: number;
    disputes_penalty: number;
    verified_bonus: number;
    total_ratings: number;
    total_orders: number;
  };
  recent_reviews: Review[];
  reputation_badge: string;
  reputation_message: string;
}

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

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  stock: number;
}

const SellerProfile: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (sellerId) {
      fetchSellerProfile();
      fetchSellerProducts();
    }
  }, [sellerId]);

  const fetchSellerProfile = async () => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, return mock data
      const mockProfile: SellerProfile = {
        seller_id: sellerId!,
        seller_name: "Green Valley Farms",
        avg_rating: 4.3,
        total_ratings: 127,
        five_star_ratings: 89,
        positive_ratings: 115,
        negative_ratings: 12,
        recent_ratings: 23,
        current_score: 87.5,
        breakdown: {
          rating_contrib: 43.0,
          orders_contrib: 15.0,
          disputes_penalty: -2.0,
          verified_bonus: 10.0,
          total_ratings: 127,
          total_orders: 30
        },
        recent_reviews: [
          {
            id: 1,
            order_id: 1234,
            reviewer_id: "user1",
            seller_id: sellerId!,
            rating: 5,
            review: "Excellent quality products, fast delivery! Highly recommended.",
            created_at: "2024-01-15T10:30:00Z",
            reviewer_name: "Alex Johnson"
          },
          {
            id: 2,
            order_id: 1235,
            reviewer_id: "user2",
            seller_id: sellerId!,
            rating: 4,
            review: "Good seller, products as described. Will order again.",
            created_at: "2024-01-14T15:45:00Z",
            reviewer_name: "Sarah Wilson"
          },
          {
            id: 3,
            order_id: 1236,
            reviewer_id: "user3",
            seller_id: sellerId!,
            rating: 5,
            review: "Perfect! Great communication and packaging.",
            created_at: "2024-01-13T09:20:00Z",
            reviewer_name: "Mike Chen"
          }
        ],
        reputation_badge: "Trusted Seller",
        reputation_message: "High-quality seller with great reviews"
      };

      setSellerProfile(mockProfile);
    } catch (err) {
      setError('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    try {
      // Mock products data
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Organic Tomato Seeds",
          price: 15.99,
          currency: "USD",
          image: "/images/tomato-seeds.jpg",
          category: "seeds",
          stock: 50
        },
        {
          id: "2",
          name: "Premium Fertilizer",
          price: 29.99,
          currency: "USD",
          image: "/images/fertilizer.jpg",
          category: "fertilizers",
          stock: 25
        },
        {
          id: "3",
          name: "Garden Tools Set",
          price: 45.99,
          currency: "USD",
          image: "/images/tools.jpg",
          category: "tools",
          stock: 15
        }
      ];

      setProducts(mockProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingDistribution = () => {
    if (!sellerProfile) return [];
    
    return [
      { stars: 5, count: sellerProfile.five_star_ratings, percentage: Math.round((sellerProfile.five_star_ratings / sellerProfile.total_ratings) * 100) },
      { stars: 4, count: sellerProfile.positive_ratings - sellerProfile.five_star_ratings, percentage: Math.round(((sellerProfile.positive_ratings - sellerProfile.five_star_ratings) / sellerProfile.total_ratings) * 100) },
      { stars: 3, count: sellerProfile.total_ratings - sellerProfile.positive_ratings - sellerProfile.negative_ratings, percentage: Math.round(((sellerProfile.total_ratings - sellerProfile.positive_ratings - sellerProfile.negative_ratings) / sellerProfile.total_ratings) * 100) },
      { stars: 2, count: sellerProfile.negative_ratings, percentage: Math.round((sellerProfile.negative_ratings / sellerProfile.total_ratings) * 100) },
      { stars: 1, count: 0, percentage: 0 }
    ];
  };

  if (loading) {
    return (
      <div className="seller-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading seller profile...</p>
      </div>
    );
  }

  if (error || !sellerProfile) {
    return (
      <div className="seller-profile-error">
        <h2>Seller Not Found</h2>
        <p>{error || 'The seller profile could not be loaded.'}</p>
        <button onClick={() => navigate('/marketplace')} className="back-button">
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="seller-profile">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button onClick={() => navigate('/marketplace')} className="back-button">
            ← Back to Marketplace
          </button>
          <h1 className="seller-name">{sellerProfile.seller_name}</h1>
          <ReputationBadge
            score={sellerProfile.current_score}
            badge={sellerProfile.reputation_badge}
            message={sellerProfile.reputation_message}
            breakdown={sellerProfile.breakdown}
            size="large"
            showTooltip={true}
          />
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{sellerProfile.avg_rating.toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
            <RatingStars rating={sellerProfile.avg_rating} showNumber={true} size="medium" />
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{sellerProfile.total_ratings}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{sellerProfile.current_score.toFixed(0)}</div>
            <div className="stat-label">Reputation Score</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{sellerProfile.recent_ratings}</div>
            <div className="stat-label">Recent Reviews (30 days)</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="rating-distribution">
          <h3>Rating Distribution</h3>
          <div className="distribution-bars">
            {getRatingDistribution().map(({ stars, count, percentage }) => (
              <div key={stars} className="distribution-item">
                <span className="stars">{stars} ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="count">{count} ({percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reputation Breakdown */}
        <div className="reputation-breakdown">
          <div className="breakdown-header">
            <h3>Reputation Breakdown</h3>
            <button 
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="toggle-button"
            >
              {showBreakdown ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showBreakdown && (
            <div className="breakdown-content">
              <div className="breakdown-grid">
                <div className="breakdown-item positive">
                  <span className="breakdown-label">Rating Contribution</span>
                  <span className="breakdown-value">+{sellerProfile.breakdown.rating_contrib.toFixed(1)}</span>
                </div>
                
                <div className="breakdown-item positive">
                  <span className="breakdown-label">Orders Bonus</span>
                  <span className="breakdown-value">+{sellerProfile.breakdown.orders_contrib.toFixed(1)}</span>
                </div>
                
                {sellerProfile.breakdown.disputes_penalty < 0 && (
                  <div className="breakdown-item negative">
                    <span className="breakdown-label">Disputes Penalty</span>
                    <span className="breakdown-value">{sellerProfile.breakdown.disputes_penalty.toFixed(1)}</span>
                  </div>
                )}
                
                {sellerProfile.breakdown.verified_bonus > 0 && (
                  <div className="breakdown-item bonus">
                    <span className="breakdown-label">Verified Bonus</span>
                    <span className="breakdown-value">+{sellerProfile.breakdown.verified_bonus.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="recent-reviews">
          <ReviewList
            reviews={sellerProfile.recent_reviews}
            maxReviews={10}
            showHeader={true}
            showOrderId={true}
          />
        </div>

        {/* Seller Products */}
        <div className="seller-products">
          <h3>Products from {sellerProfile.seller_name}</h3>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">
                    {product.currency} {product.price.toFixed(2)}
                  </p>
                  <p className="product-stock">
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
