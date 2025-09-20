import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  MapPin, 
  Star, 
  Calendar,
  Package,
  TrendingUp,
  Shield,
  ExternalLink
} from 'lucide-react';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { RatingStars } from '../components/RatingStars';
import { apiClient } from '../services/apiClient';

interface SellerProfile {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  profile_image?: string;
  location: {
    country: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  verified: boolean;
  created_at: string;
  stats: {
    avg_rating: number;
    total_reviews: number;
    five_star_reviews: number;
    positive_reviews: number;
    negative_reviews: number;
    recent_reviews: number;
    total_orders: number;
    completed_orders: number;
    recent_orders: number;
    total_sales: number;
    recent_sales: number;
  };
  reputation: {
    base_score: number;
    rating_contrib: number;
    orders_contrib: number;
    disputes_penalty: number;
    verified_bonus: number;
    final_score: number;
    badge: string;
    message: string;
  };
  recent_reviews: Review[];
}

interface Review {
  id: string;
  buyer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface SellerProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  stock: number;
}

export function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSellerProfile();
      loadSellerProducts();
    }
  }, [id]);

  const loadSellerProfile = async () => {
    try {
      const response = await apiClient.get(`/sellers/${id}`);
      if (response.data.success) {
        setSeller(response.data.data);
      } else {
        setError('Failed to load seller profile');
      }
    } catch (err) {
      setError('Seller not found');
    } finally {
      setLoading(false);
    }
  };

  const loadSellerProducts = async () => {
    try {
      const response = await apiClient.get(`/products?trader_id=${id}`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleMessageSeller = () => {
    if (seller) {
      // Navigate to messaging with seller
      navigate(`/marketplace/chat?seller=${seller.user_id}`);
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seller Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {seller.profile_image ? (
                <img
                  src={seller.profile_image}
                  alt={seller.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100">
                  <span className="text-2xl font-bold text-gray-500">
                    {seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{seller.name}</h2>
                <VerifiedBadge verified={seller.verified} size="md" showText />
              </div>

              {seller.bio && (
                <p className="text-gray-600 mb-4">{seller.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                {seller.location.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location.city}, {seller.location.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(seller.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <RatingStars 
                  rating={seller.stats.avg_rating} 
                  showNumber 
                  showCount 
                  reviewCount={seller.stats.total_reviews}
                  size="md"
                />
                <button
                  onClick={handleMessageSeller}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Seller
                </button>
              </div>
            </div>

            {/* Reputation Score */}
            <div className="flex-shrink-0">
              <div className={`px-4 py-3 rounded-lg text-center ${getReputationColor(seller.reputation.final_score)}`}>
                <div className="text-2xl font-bold">
                  {Math.round(seller.reputation.final_score)}
                </div>
                <div className="text-sm font-medium">
                  {seller.reputation.badge}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <Package className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-500">Products</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{seller.stats.total_reviews}</div>
            <div className="text-sm text-gray-500">Reviews</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{seller.stats.completed_orders}</div>
            <div className="text-sm text-gray-500">Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <Shield className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(seller.reputation.final_score)}
            </div>
            <div className="text-sm text-gray-500">Reputation</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'products', label: 'Products', count: products.length },
                { id: 'reviews', label: 'Reviews', count: seller.stats.total_reviews },
                { id: 'about', label: 'About' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-green-600 font-bold text-lg">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category} • {product.stock} in stock
                      </p>
                      <button
                        onClick={() => navigate(`/marketplace/product/${product.id}`)}
                        className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Product
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {seller.recent_reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{review.buyer_name}</span>
                        <RatingStars rating={review.rating} size="sm" />
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
                {seller.recent_reviews.length === 0 && (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reputation Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Score:</span>
                        <span className="font-medium">{Math.round(seller.reputation.base_score)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating Contribution:</span>
                        <span className="font-medium">{Math.round(seller.reputation.rating_contrib)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orders Bonus:</span>
                        <span className="font-medium">{Math.round(seller.reputation.orders_contrib)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified Bonus:</span>
                        <span className="font-medium">{Math.round(seller.reputation.verified_bonus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disputes Penalty:</span>
                        <span className="font-medium text-red-600">{Math.round(seller.reputation.disputes_penalty)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Final Score:</span>
                        <span>{Math.round(seller.reputation.final_score)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-3">{seller.reputation.message}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{seller.stats.completed_orders}</div>
                      <div className="text-sm text-gray-500">Completed Orders</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">${seller.stats.total_sales.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Total Sales</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerProfile;
