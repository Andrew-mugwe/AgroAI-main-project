import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BarChart3,
  PieChart,
  AlertTriangle,
  GraduationCap,
  ShoppingCart,
  FileText,
  Download,
  Search,
  Globe,
  Menu,
  ChevronDown,
  Leaf,
  Filter,
  MapPin,
  TrendingUp,
  Calendar
} from 'lucide-react'

export function NGODashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedRegion, setSelectedRegion] = useState('all')

  const stats = {
    totalFarmers: 1250,
    activeFarmers: 980,
    regionsActive: 8,
    avgEngagement: 78
  }

  const cropInsights = {
    topCrops: [
      { name: 'Maize', percentage: 45 },
      { name: 'Beans', percentage: 25 },
      { name: 'Tomatoes', percentage: 15 },
      { name: 'Coffee', percentage: 15 }
    ],
    soilHealth: {
      excellent: 45,
      good: 30,
      fair: 15,
      poor: 10
    }
  }

  const alerts = [
    { type: 'high', message: 'Drought risk in Eastern Region', affected: 120 },
    { type: 'medium', message: 'Pest outbreak in Central Zone', affected: 85 },
    { type: 'low', message: 'Market price volatility warning', affected: 200 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Luxury Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">KA</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">Kenya Agriculture</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    NGO
                  </span>
                </div>
                <p className="text-sm text-gray-500">Eastern Region</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                AgroAI
              </span>
            </div>

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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Organization Dashboard</h1>
            <p className="text-lg text-gray-600">Monitor and support your farming community</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <option value="all">All Regions</option>
              <option value="eastern">Eastern</option>
              <option value="central">Central</option>
              <option value="western">Western</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFarmers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeFarmers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Regions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.regionsActive}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgEngagement}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Crop & Soil Insights */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Crop & Soil Insights</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-4">Top Crops Distribution</h4>
                <div className="space-y-3">
                  {cropInsights.topCrops.map((crop) => (
                    <div key={crop.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{crop.name}</span>
                        <span>{crop.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${crop.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-4">Soil Health Overview</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(cropInsights.soilHealth).map(([status, percentage]) => (
                    <div key={status} className="text-center">
                      <div className="text-lg font-bold text-gray-900">{percentage}%</div>
                      <div className="text-xs text-gray-600 capitalize">{status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alerts & Risks */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Alerts & Risks</h3>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'high'
                      ? 'bg-red-50 border-red-200'
                      : alert.type === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        alert.type === 'high'
                          ? 'text-red-500'
                          : alert.type === 'medium'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600">{alert.affected} farmers affected</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Basic Training</span>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Advanced Skills</span>
                </div>
                <span className="text-sm font-medium">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Tech Adoption</span>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
            </div>
          </motion.div>

          {/* Marketplace Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Activity</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-sm font-medium">2,450</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="text-sm font-medium">$45,250</div>
                  <div className="text-xs text-gray-600">Input Sales</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-sm font-medium">$78,120</div>
                  <div className="text-xs text-gray-600">Produce Sold</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reports & Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports & Export</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Monthly Report</span>
                </div>
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Training Data</span>
                </div>
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Financial Summary</span>
                </div>
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </motion.div>
        </div>
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
                Resource Library
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Switch Organization
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
