import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sun,
  Cloud,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  Eye,
  Upload,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Star,
  Trophy,
  Target,
  Zap,
  Leaf,
  Sprout,
  TreePine,
  Globe,
  Phone,
  Menu,
  Search,
  ChevronDown,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Award,
  Flame,
  Users,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

export function FarmerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  // Weather data
  const weatherData = {
    current: { temp: 28, condition: 'Sunny', humidity: 65, wind: 12 },
    forecast: [
      { day: 'Today', temp: 28, condition: 'Sunny', icon: Sun },
      { day: 'Tomorrow', temp: 26, condition: 'Cloudy', icon: Cloud },
      { day: 'Wed', temp: 24, condition: 'Rain', icon: CloudRain },
      { day: 'Thu', temp: 27, condition: 'Sunny', icon: Sun },
    ]
  }

  // Soil health data
  const soilHealth = {
    moisture: 75,
    fertility: 82,
    ph: 6.8,
    status: 'excellent'
  }

  // Gamification data
  const gamification = {
    streak: 12,
    level: 8,
    xp: 2450,
    nextLevel: 3000,
    badges: [
      { name: 'Early Bird', icon: Sun, earned: true },
      { name: 'Water Master', icon: Droplets, earned: true },
      { name: 'Harvest Hero', icon: Trophy, earned: false },
    ]
  }

  // AI Recommendations
  const recommendations = [
    {
      title: 'Optimal Planting Window',
      description: 'Plant your maize seeds in the next 3 days for best yield',
      priority: 'high',
      icon: Calendar
    },
    {
      title: 'Soil pH Adjustment',
      description: 'Add lime to increase pH from 6.2 to 6.8',
      priority: 'medium',
      icon: Activity
    },
    {
      title: 'Pest Prevention',
      description: 'Apply neem oil to prevent aphid infestation',
      priority: 'low',
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Luxury Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: User Profile */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JF</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">John Farmer</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Farmer
                  </span>
                </div>
                <p className="text-sm text-gray-500">Nairobi, Kenya</p>
              </div>
            </div>

            {/* Center: Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                AgroAI
              </span>
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Good morning, John! 🌅
          </h1>
          <p className="text-lg text-gray-600">
            Your farm is looking great today. Here's what needs your attention.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
              <Sun className="w-6 h-6 text-yellow-500" />
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {weatherData.current.temp}°C
              </div>
              <div className="text-sm text-gray-600">{weatherData.current.condition}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-sm text-gray-600">Humidity</div>
                <div className="font-semibold">{weatherData.current.humidity}%</div>
              </div>
              <div className="text-center">
                <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <div className="text-sm text-gray-600">Wind</div>
                <div className="font-semibold">{weatherData.current.wind} km/h</div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-green-800 mb-1">AI Farming Advice</div>
              <div className="text-xs text-green-700">
                Perfect weather for planting. Water in the early morning for best results.
              </div>
            </div>
          </motion.div>

          {/* Soil & Crop Health Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Soil & Crop Health</h3>
              <Sprout className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Moisture</span>
                  <span className="font-medium">{soilHealth.moisture}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${soilHealth.moisture}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fertility</span>
                  <span className="font-medium">{soilHealth.fertility}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${soilHealth.fertility}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">pH Level</span>
                  <span className="font-medium">{soilHealth.ph}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(soilHealth.ph / 14) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 capitalize">
                {soilHealth.status} condition
              </span>
            </div>
          </motion.div>

          {/* Pest & Disease Alerts Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pest & Disease Alerts</h3>
              <Eye className="w-6 h-6 text-orange-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">Maize Rust Alert</div>
                  <div className="text-xs text-red-600">Detected in your region</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-800">Aphid Warning</div>
                  <div className="text-xs text-yellow-600">Monitor your crops</div>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload Crop Photo</span>
            </button>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Marketplace Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Marketplace Snapshot</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-700">KSh 45</div>
                  <div className="text-xs text-green-600">Maize per kg</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500 ml-1">+5%</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">KSh 120</div>
                  <div className="text-xs text-blue-600">Tomatoes per kg</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-500 ml-1">-2%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm font-medium">Buy Inputs</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Sell Produce</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Progress & Gamification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Farming Streak</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{gamification.streak} days</span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Level {gamification.level}</span>
                  <span className="font-medium">{gamification.xp}/{gamification.nextLevel} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(gamification.xp / gamification.nextLevel) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {gamification.badges.map((badge, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg text-center ${
                      badge.earned ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-100'
                    }`}
                  >
                    <badge.icon className={`w-6 h-6 mx-auto mb-1 ${
                      badge.earned ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                    <div className={`text-xs font-medium ${
                      badge.earned ? 'text-yellow-800' : 'text-gray-500'
                    }`}>
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Recommendations Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Personalized for you</span>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                  rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-green-50 border-green-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <rec.icon className={`w-5 h-5 mt-0.5 ${
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-amber-200/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contact Support
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Switch Role
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Globe className="w-4 h-4" />
                <span>English</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
