import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Star,
  MapPin,
  CheckCircle2,
  Leaf,
  QrCode,
  Phone,
  Heart,
  Plus,
  Minus,
  Zap,
  ExternalLink
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { VerifiedBadge } from '../VerifiedBadge'
import { RatingStars } from '../RatingStars'

interface Product {
  id: string
  name: string
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'harvest'
  price: number
  currency: string
  rating: number
  reviews: number
  seller: {
    id: string
    name: string
    verified: boolean
    rating: number
    reviews_count: number
    reputation_score?: number
    location: {
      country: string
      city: string
    }
  }
  image: string
  badges: string[]
  stock: number
  location: string
  sustainablyGrown: boolean
  hasQrVerification: boolean
  priceAlert?: {
    type: 'increase' | 'decrease'
    percentage: number
  }
}

interface ProductCardProps {
  product: Product
  onContact?: (product: Product) => void
  onVerify?: (product: Product) => void
}

export function ProductCard({ product, onContact, onVerify }: ProductCardProps) {
  const { addToCart, state } = useCart()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    // Add animation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      seller: product.seller,
      location: product.location,
      stock: product.stock
    })
    
    setIsAdding(false)
  }

  const handleBuyNow = () => {
    // Create a single-item cart for immediate checkout
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      seller: product.seller
    }
    
    // Store in localStorage for checkout page
    localStorage.setItem('cart', JSON.stringify([cartItem]))
    
    // Navigate to checkout
    navigate('/checkout')
  }

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`
  }

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-500' }
    if (product.stock < 10) return { text: 'Low Stock', color: 'text-orange-500' }
    return { text: 'In Stock', color: 'text-green-500' }
  }

  const stockStatus = getStockStatus()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden hover:bg-white/10 transition-colors border border-white/20 group"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.priceAlert && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-medium ${
            product.priceAlert.type === 'decrease' 
              ? 'bg-green-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {product.priceAlert.type === 'decrease' ? '↓' : '↑'} {product.priceAlert.percentage}%
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-2 left-2 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
          <Heart className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-white">
            {formatPrice(product.price, product.currency)}
          </div>
          <RatingStars 
            rating={product.rating}
            size="small"
            showNumber={true}
            className="text-white"
          />
        </div>

        {/* Seller Info with Trust Signals */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/sellers/${product.seller.id}`)}
              className="text-sm text-gray-300 truncate font-medium hover:text-white transition-colors flex items-center gap-1"
            >
              {product.seller.name}
              <ExternalLink className="h-3 w-3" />
            </button>
            <div className="flex items-center gap-2">
              <RatingStars 
                rating={product.seller.rating} 
                size="sm"
                showCount
                reviewCount={product.seller.reviews_count}
              />
              <VerifiedBadge 
                verified={product.seller.verified}
                size="sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>{product.seller.location.city}, {product.seller.location.country}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 bg-white/10 text-white text-xs rounded-lg"
            >
              {badge}
            </span>
          ))}
          {product.sustainablyGrown && (
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg flex items-center">
              <Leaf className="h-3 w-3 mr-1" />
              Sustainable
            </span>
          )}
        </div>

        {/* Location and Stock */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{product.location}</span>
          </div>
          <span className={stockStatus.color}>{stockStatus.text}</span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Qty:</span>
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4 text-white" />
              </button>
              <span className="text-white font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onContact?.(product)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Contact</span>
          </button>
          <button
            onClick={() => onVerify?.(product)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span>Verify</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-3">
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
              product.stock === 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Buy Now</span>
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
              product.stock === 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : isAdding
                ? 'bg-green-500 text-white'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
