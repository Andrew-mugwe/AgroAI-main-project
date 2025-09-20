import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Shield,
  Truck,
  QrCode,
  TrendingUp,
  MessageCircle,
  Leaf,
  ChevronDown,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  Store,
  BadgeCheck,
  ShieldCheck,
  LineChart,
  Users,
  DollarSign,
  Link as LinkIcon,
  BarChart,
  Sprout,
  Hand,
  Satellite,
  Cpu,
  Wifi,
  Plane,
  Tablet,
  Bot,
  Cloud,
  Heart,
  GraduationCap,
  TreePine,
  Globe,
  Target,
  TrendingDown,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  Receipt,
  Building,
  Landmark,
  Languages,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Calendar,
  Scale,
  PiggyBank,
  Coins,
  Percent,
  FileText,
  Award,
  BookOpen,
  Video,
  MessageSquare
} from 'lucide-react'

// Import new marketplace components
import { CartProvider, useCart } from '../context/CartContext'
import { CartDrawer } from '../components/marketplace/CartDrawer'
import { ProductCard } from '../components/marketplace/ProductCard'
import { CartIcon } from '../components/marketplace/CartIcon'
import { CurrencyToggle } from '../components/marketplace/CurrencyToggle'
import { AdvancedFilters } from '../components/marketplace/AdvancedFilters'

// Types
// Advanced AI Recommendations
interface AIRecommendations {
  bestPlantingTime: Date;
  expectedYield: number;
  predictedMarketPrice: number;
  optimalHarvestWindow: { start: Date; end: Date };
  potentialBuyers: {
    name: string;
    matchScore: number;
    preferredQuantity: number;
    historicalPrice: number;
  }[];
  weatherRiskAnalysis: {
    riskType: string;
    probability: number;
    mitigation: string;
  }[];
}

// Blockchain Traceability
interface TraceabilityStep {
  timestamp: Date;
  location: { lat: number; lng: number; name: string };
  handler: string;
  temperature?: number;
  humidity?: number;
  qualityChecks?: { parameter: string; value: number; status: 'pass' | 'fail' }[];
}

interface Certification {
  name: string;
  issuer: string;
  validUntil: Date;
  verificationUrl: string;
}

// Smart Contract Terms
interface ContractTerms {
  pricePerUnit: number;
  minimumQuantity: number;
  qualityStandards: {
    parameter: string;
    minValue: number;
    maxValue: number;
  }[];
  deliveryTerms: {
    deadline: Date;
    location: string;
    transportMethod: string;
  };
}

// Knowledge Hub
interface LocalizedContent {
  language: string;
  title: string;
  content: string;
  author: string;
  verifiedBy?: string;
  upvotes: number;
}

interface Product {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'harvest';
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  seller: {
    name: string;
    isVerified: boolean;
    rating: number;
    trustScore?: number;
    verificationBadges?: string[];
    expertise?: string[];
    yearsInBusiness?: number;
    totalTransactions?: number;
  };
  image: string;
  badges: string[];
  stock: number;
  location: string;
  sustainablyGrown: boolean;
  hasQrVerification: boolean;
  priceAlert?: {
    type: 'increase' | 'decrease';
    percentage: number;
  };
  paymentMethods: {
    mobileMoney: boolean;
    stripe: boolean;
    bank: boolean;
    wallet: boolean;
    escrow?: boolean;
    cryptoEnabled?: boolean;
  };
  delivery: {
    lastMile: boolean;
    pickupPoints: string[];
    estimatedDays: number;
    realTimeTracking?: boolean;
    temperatureControlled?: boolean;
    insuranceCovered?: boolean;
  };
  reviews?: {
    language: string;
    text: string;
    rating: number;
    userName: string;
    verifiedPurchase?: boolean;
    images?: string[];
    helpfulCount?: number;
  }[];
  traceability?: {
    blockchainId: string;
    originFarm: {
      name: string;
      location: { lat: number; lng: number };
      certifications: Certification[];
    };
    journey: TraceabilityStep[];
    carbonFootprint: number;
    waterUsage: number;
    sustainabilityScore: number;
  };
  aiRecommendations?: AIRecommendations;
  smartContract?: {
    available: boolean;
    terms: ContractTerms;
    escrowEnabled: boolean;
    automatedPayouts: boolean;
    disputeResolution: boolean;
  };
  knowledgeHub?: {
    relatedContent: LocalizedContent[];
    expertConsultation: boolean;
    communityDiscussions: number;
    videoTutorials: string[];
  };
  qualityAssurance: {
    labTested: boolean;
    certifications: string[];
    standardsCompliance: string[];
    warrantyPeriod?: number;
  };
  financing?: {
    availableOptions: string[];
    interestRates: number[];
    terms: string[];
    microfinanceEnabled: boolean;
  };
}

const categories = [
  { id: 'seeds', name: 'Seeds & Planting', icon: '🌱' },
  { id: 'fertilizers', name: 'Fertilizers', icon: '💪' },
  { id: 'pesticides', name: 'Crop Protection', icon: '🛡️' },
  { id: 'tools', name: 'Tools & Equipment', icon: '🔧' },
  { id: 'harvest', name: 'Harvest Trading', icon: '🌾' }
]

const sampleProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Premium Maize Seeds (Drought Resistant)',
    category: 'seeds',
    price: 25,
    currency: 'USD',
    rating: 4.8,
    reviews: 156,
    seller: {
      name: 'AgriTech Solutions Ltd',
      isVerified: true,
      rating: 4.9,
      trustScore: 98,
      verificationType: 'premium',
      location: 'Nairobi',
      country: 'Kenya',
      region: 'Central'
    },
    image: '/images/products/maize-seeds.jpg',
    badges: ['Best Seller', 'Certified', 'Traceable'],
    stock: 500,
    location: 'Nairobi, Kenya',
    sustainablyGrown: true,
    hasQrVerification: true,
    priceAlert: {
      type: 'decrease',
      percentage: 10
    }
  },
  {
    id: 'demo-2',
    name: 'Organic Beans (50kg bag)',
    category: 'seeds',
    price: 30,
    currency: 'USD',
    rating: 4.6,
    reviews: 89,
    seller: {
      name: 'Uganda Farmers Co-op',
      isVerified: true,
      rating: 4.6,
      trustScore: 95,
      verificationType: 'basic',
      location: 'Kampala',
      country: 'Uganda',
      region: 'Central'
    },
    image: '/images/products/beans.jpg',
    badges: ['Organic', 'Lab Tested', 'Traceable'],
    stock: 300,
    location: 'Kampala, Uganda',
    sustainablyGrown: true,
    hasQrVerification: true
  },
  {
    id: 'demo-3',
    name: 'DAP Fertilizer (50kg)',
    category: 'fertilizers',
    price: 40,
    currency: 'USD',
    rating: 4.2,
    reviews: 45,
    seller: {
      name: 'East Africa Fertilizers',
      isVerified: false,
      rating: 4.2,
      trustScore: 75,
      verificationType: 'basic',
      location: 'Mombasa',
      country: 'Kenya',
      region: 'Coast'
    },
    image: '/images/products/fertilizer.jpg',
    badges: ['High Quality', 'Lab Tested'],
    stock: 200,
    location: 'Mombasa, Kenya',
    sustainablyGrown: false,
    hasQrVerification: false
  },
  {
    id: 'demo-4',
    name: 'Smart Irrigation Kit (Drip System)',
    category: 'tools',
    price: 120,
    currency: 'USD',
    rating: 4.9,
    reviews: 78,
    seller: {
      name: 'Tanzania Agricultural NGO',
      isVerified: true,
      rating: 4.9,
      trustScore: 92,
      verificationType: 'enterprise',
      location: 'Dar es Salaam',
      country: 'Tanzania',
      region: 'Dar es Salaam'
    },
    image: '/images/products/irrigation-kit.jpg',
    badges: ['Smart Device', 'Water Saving', 'AI-Enabled'],
    stock: 50,
    location: 'Dar es Salaam, Tanzania',
    sustainablyGrown: false,
    hasQrVerification: true
  },
  {
    id: 'demo-5',
    name: 'Fall Armyworm Control Pesticide',
    category: 'pesticides',
    price: 15,
    currency: 'USD',
    rating: 4.5,
    reviews: 124,
    seller: {
      name: 'Rwanda Crop Protection',
      isVerified: true,
      rating: 4.5,
      trustScore: 88,
      verificationType: 'premium',
      location: 'Kigali',
      country: 'Rwanda',
      region: 'Kigali'
    },
    image: '/images/products/pesticide.jpg',
    badges: ['Eco-Friendly', 'Safe for Bees', 'Certified'],
    stock: 150,
    location: 'Kigali, Rwanda',
    sustainablyGrown: true,
    hasQrVerification: true
  },
  {
    id: 'demo-6',
    name: 'Solar-Powered Crop Dryer',
    category: 'tools',
    price: 200,
    currency: 'USD',
    rating: 4.7,
    reviews: 92,
    seller: {
      name: 'Green Energy Farmers',
      isVerified: true,
      rating: 4.7,
      trustScore: 96,
      verificationType: 'enterprise',
      location: 'Nakuru',
      country: 'Kenya',
      region: 'Rift Valley'
    },
    image: '/images/products/solar-dryer.jpg',
    badges: ['Solar Powered', 'Eco-Friendly', 'Energy Efficient'],
    stock: 25,
    location: 'Nakuru, Kenya',
    sustainablyGrown: true,
    hasQrVerification: true
  }
]

// Filter options interface
interface FilterOptions {
  priceRange: [number, number]
  availability: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  verifiedOnly: boolean
  sustainableOnly: boolean
  hasQrCode: boolean
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name'
}

// Marketplace content component
function MarketplaceContent() {
  const { state: cartState, toggleCart } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 50000],
    availability: 'all',
    verifiedOnly: false,
    sustainableOnly: false,
    hasQrCode: false,
    sortBy: 'newest'
  })

  return (
    <div className="bg-[#15192C] min-h-screen pt-16">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
        <div className="relative bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Transforming <span className="text-green-400">African Agriculture</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                  Join thousands of farmers and buyers creating sustainable trade relationships through AI-powered marketplace
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <span>Get Started Today</span>
                    <ArrowUpRight className="h-5 w-5" />
                  </button>
                  <button className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center space-x-2 border border-white/20">
                    <MessageCircle className="h-5 w-5" />
                    <span>Chat With Us</span>
                  </button>
                </div>
              </div>

              {/* Right Content - Enhanced Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">50K+</div>
                  <div className="text-green-400 font-semibold mb-1">Active Farmers</div>
                  <div className="text-gray-400 text-sm">Active producers across Africa</div>
                </div>

                <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">120+</div>
                  <div className="text-blue-400 font-semibold mb-1">Countries</div>
                  <div className="text-gray-400 text-sm">International buyers worldwide</div>
                </div>

                <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">$2.5B+</div>
                  <div className="text-purple-400 font-semibold mb-1">Trade Volume</div>
                  <div className="text-gray-400 text-sm">Agricultural exports across Africa</div>
                </div>

                <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">+300%</div>
                  <div className="text-orange-400 font-semibold mb-1">Growth Rate</div>
                  <div className="text-gray-400 text-sm">Year-over-year platform growth</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Listing Section */}
      <div className="relative bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Directory Listing Overlay */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-green-600 mb-4">DIRECTORY LISTING</h2>
              <p className="text-gray-600 text-lg">Discover and connect with verified agricultural businesses, products, and services</p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-8">
              {/* Seeds & Plants */}
              <div className="p-4 bg-green-100 rounded-xl text-center hover:bg-green-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Seeds & Plants</span>
              </div>

              {/* Fertilizers */}
              <div className="p-4 bg-orange-100 rounded-xl text-center hover:bg-orange-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Fertilizers</span>
              </div>

              {/* Equipment & Tools */}
              <div className="p-4 bg-blue-100 rounded-xl text-center hover:bg-blue-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Equipment</span>
              </div>

              {/* Financial Services */}
              <div className="p-4 bg-purple-100 rounded-xl text-center hover:bg-purple-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CircleDollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Finance</span>
              </div>

              {/* Expert Services */}
              <div className="p-4 bg-pink-100 rounded-xl text-center hover:bg-pink-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Experts</span>
              </div>

              {/* Technology */}
              <div className="p-4 bg-cyan-100 rounded-xl text-center hover:bg-cyan-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Technology</span>
              </div>
            </div>

            {/* Find Your Business Text */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">FIND YOUR BUSINESS</h3>
              <p className="text-gray-600">Browse verified listings or add your own to the AGROAI network</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <BarChart className="h-5 w-5" />
                <span>VIEW LISTING</span>
              </button>
              <button className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <span>+</span>
                <span>ADD LISTING</span>
              </button>
              <button className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                <span>Explore Listings</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">2,500+</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">850+</div>
                <div className="text-sm text-gray-600">Verified Sellers</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">15K+</div>
                <div className="text-sm text-gray-600">Monthly Searches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Alert Banner */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
          <div className="flex items-center text-white">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-base font-medium">Regional Alert: Best time to buy fertilizers - Prices expected to drop by 15% next week</span>
          </div>
          <button className="text-white text-sm font-medium underline ml-auto">
            Learn More
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Bar */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products, sellers, or categories..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Location Selector */}
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select className="w-full pl-12 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Locations</option>
                <option value="nairobi">Nairobi Region</option>
                <option value="mombasa">Mombasa Region</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Currency Toggle */}
            <CurrencyToggle className="hidden lg:flex" />

            {/* Filter Button */}
            <button 
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Cart Icon */}
            <CartIcon onClick={toggleCart} />
          </div>

          {/* Categories */}
          <div className="mt-6 flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>All Products</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onContact={(product) => console.log('Contact:', product.name)}
              onVerify={(product) => console.log('Verify:', product.name)}
            />
          ))}
        </div>

        {/* Advanced AI Insights Panel */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">AI-Powered Insights</h2>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg">Real-time</span>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Intelligence */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <LineChart className="h-5 w-5 text-blue-400" />
                  <h3 className="font-medium text-white">Price Analytics</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Current Trend</span>
                    <span className="text-green-400">↓ Decreasing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Predicted Change</span>
                    <span className="text-green-400">-15% in 2 weeks</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Market Volatility</span>
                    <span className="text-yellow-400">Medium</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <h3 className="font-medium text-white">Buyer Matching</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Potential Buyers</span>
                    <span className="text-white">12 matches</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Avg. Order Size</span>
                    <span className="text-white">500kg</span>
                  </div>
                  <button className="w-full mt-2 px-3 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                    View Matches
                  </button>
                </div>
              </div>
            </div>

            {/* Weather & Planting */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <CloudRain className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-medium text-white">Weather Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <Thermometer className="h-4 w-4 text-red-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-300">28°C</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <Droplets className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-300">65%</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <Wind className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-300">12km/h</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <Sun className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-300">High</span>
                  </div>
                </div>
                <div className="text-xs text-gray-300">
                  Optimal conditions for planting in the next 5 days
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <h3 className="font-medium text-white">Planting Calendar</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Best Plant Time</span>
                    <span className="text-green-400">Next Week</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Growth Period</span>
                    <span className="text-white">90-120 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Expected Yield</span>
                    <span className="text-green-400">↑ 25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Quality */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Scale className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-medium text-white">Quality Metrics</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Lab Test Score</span>
                    <span className="text-green-400">98/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Certification</span>
                    <span className="text-blue-400">ISO 9001</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Shelf Life</span>
                    <span className="text-white">24 months</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <PiggyBank className="h-5 w-5 text-pink-400" />
                  <h3 className="font-medium text-white">Financial Options</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <Coins className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Microfinance Available</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Percent className="h-4 w-4 mr-2 text-green-400" />
                    <span>4.5% Interest Rate</span>
                  </div>
                  <button className="w-full mt-2 px-3 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                    View Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Traceability */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">Blockchain Traceability</h2>
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-lg">Verified</span>
            </div>
            <LinkIcon className="h-6 w-6 text-blue-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Journey */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <Sprout className="h-5 w-5 text-green-400" />
                  <h3 className="font-medium text-white">Product Journey</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Origin Farm</div>
                      <div className="text-xs text-gray-300">Mwea, Kenya</div>
                      <div className="text-xs text-gray-400 mt-1">Verified on Jan 15, 2024</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Quality Check</div>
                      <div className="text-xs text-gray-300">ISO 9001 Certified</div>
                      <div className="text-xs text-gray-400 mt-1">Lab Tested on Jan 20, 2024</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Distribution</div>
                      <div className="text-xs text-gray-300">Temperature Controlled</div>
                      <div className="text-xs text-gray-400 mt-1">In Transit - ETA: 2 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <Leaf className="h-5 w-5 text-green-400" />
                  <h3 className="font-medium text-white">Environmental Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-300 mb-1">Carbon Footprint</div>
                    <div className="text-sm text-white">12.5 kg CO₂</div>
                    <div className="text-xs text-green-400 mt-1">20% below avg.</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-300 mb-1">Water Usage</div>
                    <div className="text-sm text-white">850 L/kg</div>
                    <div className="text-xs text-green-400 mt-1">15% below avg.</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-300 mb-1">Energy Used</div>
                    <div className="text-sm text-white">45 kWh</div>
                    <div className="text-xs text-green-400 mt-1">30% renewable</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-300 mb-1">Sustainability Score</div>
                    <div className="text-sm text-white">8.5/10</div>
                    <div className="text-xs text-green-400 mt-1">Top 10%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Hub */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">Knowledge Hub</h2>
              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-lg">Community</span>
            </div>
            <BookOpen className="h-6 w-6 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Tutorials */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Video className="h-5 w-5 text-red-400" />
                <h3 className="font-medium text-white">Video Tutorials</h3>
              </div>
              <div className="space-y-3">
                <div className="group cursor-pointer">
                  <div className="text-sm text-white group-hover:text-green-400 transition-colors">Best Practices for Seed Storage</div>
                  <div className="text-xs text-gray-400">12 min • 2.5k views</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-sm text-white group-hover:text-green-400 transition-colors">Organic Farming Techniques</div>
                  <div className="text-xs text-gray-400">15 min • 3.8k views</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-sm text-white group-hover:text-green-400 transition-colors">Smart Irrigation Systems</div>
                  <div className="text-xs text-gray-400">8 min • 1.9k views</div>
                </div>
              </div>
            </div>

            {/* Community Discussions */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-yellow-400" />
                <h3 className="font-medium text-white">Community Discussions</h3>
              </div>
              <div className="space-y-3">
                <div className="group cursor-pointer">
                  <div className="text-sm text-white group-hover:text-green-400 transition-colors">Tips for Drought Resistance</div>
                  <div className="text-xs text-gray-400">32 replies • Active</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-sm text-white group-hover:text-green-400 transition-colors">Natural Pest Control Methods</div>
                  <div className="text-xs text-gray-400">45 replies • Active</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-sm text-white group-hover:text-green-400 transition-colors">Market Price Discussions</div>
                  <div className="text-xs text-gray-400">28 replies • Active</div>
                </div>
              </div>
            </div>

            {/* Expert Network */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-5 w-5 text-orange-400" />
                <h3 className="font-medium text-white">Expert Network</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Dr. Sarah Kimani</div>
                    <div className="text-xs text-gray-400">Agronomist • 15 yrs exp</div>
                  </div>
                  <button className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                    Connect
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">John Mwangi</div>
                    <div className="text-xs text-gray-400">Soil Expert • 12 yrs exp</div>
                  </div>
                  <button className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                    Connect
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">Mary Ochieng</div>
                    <div className="text-xs text-gray-400">Market Analyst • 8 yrs exp</div>
                  </div>
                  <button className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Farming Integration */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">Smart Farming Integration</h2>
              <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded-lg">IoT Enabled</span>
            </div>
            <Bot className="h-6 w-6 text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* IoT Devices */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <h3 className="font-medium text-white">Connected Devices</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Satellite className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">GPS Trackers</span>
                  </div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-white">Crop Drones</span>
                  </div>
                  <span className="text-xs text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-white">Weather Stations</span>
                  </div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </div>
            </div>

            {/* Mobile Integration */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Smartphone className="h-5 w-5 text-purple-400" />
                <h3 className="font-medium text-white">Mobile Integration</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white">Real-time Alerts</span>
                  </div>
                  <button className="text-xs text-cyan-400">Configure</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tablet className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white">Field Reports</span>
                  </div>
                  <button className="text-xs text-cyan-400">View</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-white">AI Assistant</span>
                  </div>
                  <button className="text-xs text-cyan-400">Enable</button>
                </div>
              </div>
            </div>

            {/* Data Analytics */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart className="h-5 w-5 text-yellow-400" />
                <h3 className="font-medium text-white">Data Analytics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Soil Health Score</span>
                  <span className="text-sm text-green-400">92/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Growth Rate</span>
                  <span className="text-sm text-green-400">+15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Resource Usage</span>
                  <span className="text-sm text-yellow-400">Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Services Hub */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">Financial Services Hub</h2>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg">Fintech</span>
            </div>
            <CircleDollarSign className="h-6 w-6 text-green-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Microfinance */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Banknote className="h-5 w-5 text-green-400" />
                <h3 className="font-medium text-white">Microfinance Options</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Seasonal Loan</span>
                    <span className="text-xs text-green-400">4.5% APR</span>
                  </div>
                  <div className="text-xs text-gray-400">Up to $5,000 • 12 months</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Equipment Finance</span>
                    <span className="text-xs text-green-400">5.2% APR</span>
                  </div>
                  <div className="text-xs text-gray-400">Up to $10,000 • 24 months</div>
                </div>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>

            {/* Insurance */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium text-white">Insurance Products</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Crop Insurance</span>
                    <span className="text-xs text-blue-400">From $2/acre</span>
                  </div>
                  <div className="text-xs text-gray-400">Weather & pest protection</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Equipment Cover</span>
                    <span className="text-xs text-blue-400">Flexible terms</span>
                  </div>
                  <div className="text-xs text-gray-400">All-risk coverage</div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Get Quote
                </button>
              </div>
            </div>

            {/* Payment Solutions */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Receipt className="h-5 w-5 text-purple-400" />
                <h3 className="font-medium text-white">Payment Solutions</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white">Mobile Money</span>
                  </div>
                  <span className="text-xs text-green-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">Bank Transfer</span>
                  </div>
                  <span className="text-xs text-green-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <Landmark className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-white">USSD Banking</span>
                  </div>
                  <span className="text-xs text-green-400">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Impact */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">Social Impact</h2>
              <span className="px-2 py-1 bg-orange-600/20 text-orange-400 text-xs rounded-lg">Community</span>
            </div>
            <Heart className="h-6 w-6 text-orange-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Education Initiatives */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium text-white">Education Initiatives</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white">Farmer Training</div>
                    <div className="text-xs text-gray-400">500+ graduates</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <TreePine className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white">Youth Programs</div>
                    <div className="text-xs text-gray-400">20 communities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-5 w-5 text-green-400" />
                <h3 className="font-medium text-white">Environmental Impact</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white">TreePines Planted</div>
                    <div className="text-xs text-gray-400">10,000+ this year</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white">Water Saved</div>
                    <div className="text-xs text-gray-400">1M+ liters</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Support */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Hand className="h-5 w-5 text-red-400" />
                <h3 className="font-medium text-white">Community Support</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white">SDG Goals</div>
                    <div className="text-xs text-gray-400">5 goals impacted</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white">Lives Impacted</div>
                    <div className="text-xs text-gray-400">100,000+ farmers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AGROAI Network Visualization */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              The <span className="text-green-400">AGROAI NETWORK</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              A strategic trade and investment facilitation hub dedicated to enhancing agribusiness connections 
              between Africa and the Global market through our unified AI-powered platform.
            </p>
          </div>

          {/* Network Diagram */}
          <div className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-8 min-h-[500px] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400 rounded-full blur-3xl"></div>
            </div>

            {/* Network Nodes */}
            <div className="relative z-10 grid grid-cols-3 gap-8 h-full">
              {/* Left Column - Farmers & Producers */}
              <div className="space-y-6">
                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Local Farmers</h3>
                  <p className="text-gray-400 text-sm">50K+ verified producers across Africa</p>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Agro-Dealers</h3>
                  <p className="text-gray-400 text-sm">Local distribution partners</p>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Logistics</h3>
                  <p className="text-gray-400 text-sm">Last-mile delivery network</p>
                </div>
              </div>

              {/* Center Column - AGROAI Platform */}
              <div className="flex flex-col justify-center items-center space-y-6">
                <div className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl border-2 border-white/30 text-center shadow-2xl">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">AGROAI</h2>
                  <p className="text-green-100 text-sm">AI-Powered Marketplace</p>
                </div>

                {/* Connection Lines */}
                <div className="flex flex-col space-y-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-transparent mx-auto"></div>
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent mx-auto"></div>
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-transparent mx-auto"></div>
                </div>
              </div>

              {/* Right Column - Global Market */}
              <div className="space-y-6">
                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Global Buyers</h3>
                  <p className="text-gray-400 text-sm">120+ countries worldwide</p>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Importers</h3>
                  <p className="text-gray-400 text-sm">Verified international partners</p>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CircleDollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Financial Hub</h3>
                  <p className="text-gray-400 text-sm">Payment & insurance services</p>
                </div>
              </div>
            </div>

            {/* Floating Network Elements */}
            <div className="absolute top-4 left-1/4 p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">Verified</span>
              </div>
            </div>

            <div className="absolute top-4 right-1/4 p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-emerald-400" />
                <span className="text-white text-sm">Sustainable</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/3 p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-white text-sm">Growing</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-1/3 p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose AGROAI Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {/* Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-green-400">50K+</div>
              <div className="text-sm text-gray-300">Active Farmers</div>
              <div className="text-xs text-gray-400">Across Africa & Global</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-blue-400">120+</div>
              <div className="text-sm text-gray-300">Countries</div>
              <div className="text-xs text-gray-400">International buyers</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-purple-400">$2.5B+</div>
              <div className="text-sm text-gray-300">Trade Volume</div>
              <div className="text-xs text-gray-400">Agricultural exports</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-orange-400">300%</div>
              <div className="text-sm text-gray-300">Growth Rate</div>
              <div className="text-xs text-gray-400">Year-over-year growth</div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose <span className="text-green-400">AGROAI</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              A comprehensive AI-powered marketplace empowering global agribusinesses with smart technology, 
              financial services, and sustainable growth opportunities.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Global Market Access */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">Global Market Access</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Streamlined access to international markets with AI-powered matching, 
                while supporting global stakeholders in engaging with Africa's vibrant agricultural sector.
              </p>
            </div>

            {/* AI-Powered Intelligence */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">AI Market Intelligence</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Access real-time market insights, predictive analytics, and AI-driven recommendations 
                for informed decision-making and strategic planning.
              </p>
            </div>

            {/* Smart Farming Integration */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">Smart Farming Tech</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Integrated IoT devices, drone monitoring, and AI analytics to optimize 
                farming practices and maximize yield potential.
              </p>
            </div>

            {/* Financial Services */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CircleDollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">Financial Inclusion</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Access to microfinance, crop insurance, and flexible payment solutions 
                to support your agricultural business growth.
              </p>
            </div>

            {/* Quality Assurance */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">Quality Assurance</h3>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered quality grading, blockchain traceability, and verified 
                certifications ensure premium product standards.
              </p>
            </div>

            {/* Sustainable Growth */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">Sustainable Growth</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Promote responsible farming practices, environmental impact tracking, 
                and long-term sustainable agricultural development.
              </p>
            </div>
          </div>

          {/* Seller vs Buyer Benefits */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* For Sellers */}
            <div className="p-6 bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-xl border border-green-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">For Sellers & Farmers</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Direct access to global buyers with AI-powered matching</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Smart pricing recommendations based on market data</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Access to microfinance and crop insurance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">IoT integration for farm optimization</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Quality certification and traceability</span>
                </li>
              </ul>
            </div>

            {/* For Buyers */}
            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">For Buyers & Importers</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Verified suppliers with quality guarantees</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Real-time market intelligence and pricing</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Secure transactions with escrow protection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">End-to-end logistics and tracking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Sustainable sourcing and impact tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center mb-8">
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-lg">The System</span>
            <h2 className="text-2xl font-semibold text-white mt-4">How AGROAI Works</h2>
            <p className="text-gray-400 mt-2">Smart steps to connect with global markets and optimize your farming</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Smart Registration</h3>
                <p className="text-gray-400 text-sm">
                  Create your profile with AI-powered verification, role selection, and blockchain credentials
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Multi-role support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">AI verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Reputation scoring</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2. AI-Enhanced Listing</h3>
                <p className="text-gray-400 text-sm">
                  Upload products with AI-assisted categorization, quality grading, and dynamic pricing
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Auto quality grading</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Smart pricing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Traceability QR</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Intelligent Matching</h3>
                <p className="text-gray-400 text-sm">
                  Our AI matches you with optimal buyers using market data, logistics, and preferences
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Market analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Logistics optimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Smart contracts</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-600 rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Secure Trade Plus</h3>
                <p className="text-gray-400 text-sm">
                  Complete transactions with multi-layer security, quality checks, and integrated services
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Multi-layer escrow</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Quality verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-300">Insurance integration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-3">
                <Bot className="h-5 w-5 text-cyan-400" />
                <h4 className="font-medium text-white">AI Assistant</h4>
              </div>
              <p className="text-sm text-gray-400">
                Get personalized guidance throughout your journey with our AI-powered assistant
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-3">
                <Smartphone className="h-5 w-5 text-green-400" />
                <h4 className="font-medium text-white">Multi-Platform</h4>
              </div>
              <p className="text-sm text-gray-400">
                Access via web, mobile app, SMS, or USSD - we meet you where you are
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="h-5 w-5 text-blue-400" />
                <h4 className="font-medium text-white">Global Reach</h4>
              </div>
              <p className="text-sm text-gray-400">
                Connect with buyers and sellers worldwide while maintaining local expertise
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="mt-8 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl p-8 border border-yellow-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Email & SMS List</h2>
            <p className="text-gray-300 text-lg">Be the first to receive info on specials, sales, and market updates!</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              <button className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-gray-400 text-sm text-center mt-3">
              Get market insights, price alerts, and exclusive offers delivered to your inbox
            </p>
          </div>
        </div>

        {/* Trust & Support Features */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fast Shipping */}
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">FAST SHIPPING</h3>
              <p className="text-gray-400 text-sm">Reliable logistics support with real-time tracking</p>
            </div>

            {/* Online Payment */}
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ONLINE PAYMENT</h3>
              <p className="text-gray-400 text-sm">Secure checkouts with multiple payment options</p>
            </div>

            {/* 24/7 Support */}
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 SUPPORT</h3>
              <p className="text-gray-400 text-sm">Responsive help desk with AI assistant</p>
            </div>

            {/* 100% Safe */}
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">100% SAFE</h3>
              <p className="text-gray-400 text-sm">Unlimited benefits with escrow protection</p>
            </div>
          </div>
        </div>

        {/* Social Media & Language Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Social Media Links */}
            <div className="flex flex-col items-center lg:items-start">
              <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <span className="text-white font-bold">f</span>
                </a>
                <a href="#" className="w-12 h-12 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <span className="text-white font-bold">X</span>
                </a>
                <a href="#" className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                  <span className="text-white font-bold">P</span>
                </a>
                <a href="#" className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors">
                  <span className="text-white font-bold">in</span>
                </a>
                <a href="#" className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition-colors">
                  <MessageCircle className="h-6 w-6 text-white" />
                </a>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                <div className="w-6 h-4 bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-sm"></div>
                <span className="text-white font-medium">EN</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-gray-400 text-sm">Select Language</span>
            </div>

            {/* Chat Support Button */}
            <div className="flex items-center space-x-4">
              <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </button>
              <div className="text-center">
                <div className="text-white font-medium">Live Chat</div>
                <div className="text-gray-400 text-sm">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Orders Banner */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">No Internet? No Problem!</h2>
              <p className="text-green-50">
                Order via SMS, USSD, or WhatsApp. We'll deliver to your nearest agro-dealer.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-white text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors">
                Learn More
              </button>
              <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={cartState.isOpen}
        onClose={toggleCart}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        maxPrice={50000}
      />
    </div>
  )
}

// Main Marketplace component
export default function Marketplace() {
  return <MarketplaceContent />
}
