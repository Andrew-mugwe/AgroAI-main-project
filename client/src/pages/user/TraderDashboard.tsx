import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  PieChart,
  Plus,
  Filter,
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  Truck,
  XCircle
} from 'lucide-react'
import { DashboardCard } from '../../components/shared/DashboardCard'
import { ChartCard } from '../../components/shared/ChartCard'
import { ProductListingCard } from '../../components/trader/ProductListingCard'
import { OrderStatusBadge } from '../../components/trader/OrderStatusBadge'
import { AnalyticsCard } from '../../components/trader/AnalyticsCard'
import { api } from '../../services/api'

// Status badge colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export function TraderDashboard() {
  const [activeTab, setActiveTab] = useState('listings')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsRes, ordersRes, analyticsRes] = await Promise.all([
          api.get('/api/trader/products'),
          api.get('/api/trader/orders'),
          api.get('/api/trader/analytics')
        ])
        setProducts(productsRes.data)
        setOrders(ordersRes.data)
        setAnalytics(analyticsRes.data)
      } catch (error) {
        console.error('Error fetching trader data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
          Trader Dashboard
        </h1>
        <p className="text-gray-600">Manage your products and track sales performance</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Active Listings"
          value={analytics?.marketplace_stats?.active_listings || 0}
          icon={Package}
          iconColor="blue"
          trend={{ value: 12, isPositive: true }}
          description="Products available for sale"
          delay={0.1}
        />
        <AnalyticsCard
          title="Pending Orders"
          value={analytics?.marketplace_stats?.pending_orders || 0}
          icon={ShoppingCart}
          iconColor="yellow"
          trend={{ value: 5, isPositive: true }}
          description="Orders awaiting processing"
          delay={0.2}
        />
        <AnalyticsCard
          title="Total Sales"
          value={`$${analytics?.marketplace_stats?.total_sales?.toLocaleString() || 0}`}
          icon={TrendingUp}
          iconColor="green"
          trend={{ value: 15, isPositive: true }}
          description="Revenue this month"
          delay={0.3}
        />
        <AnalyticsCard
          title="Products"
          value={analytics?.marketplace_stats?.products_count || 0}
          icon={Package}
          iconColor="purple"
          trend={{ value: 8, isPositive: true }}
          description="Total products listed"
          delay={0.4}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'listings'
              ? 'bg-green-600 text-white'
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-green-600 text-white'
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-green-600 text-white'
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'listings' && (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any, index: number) => (
                <ProductListingCard
                  key={product.id}
                  product={product}
                  onEdit={(id) => console.log('Edit product:', id)}
                  onArchive={(id) => console.log('Archive product:', id)}
                />
              ))}
            </div>

            {/* List View (Alternative) */}
            <DashboardCard
              title="Product Listings"
              icon={Package}
              iconColor="blue"
              className="overflow-hidden mt-6"
            >
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg mr-3"></div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">${product.price}</td>
                      <td className="px-4 py-3 text-gray-900">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
          </>
        )}

        {activeTab === 'orders' && (
          <DashboardCard
            title="Recent Orders"
            icon={ShoppingCart}
            iconColor="yellow"
            className="overflow-hidden"
          >
            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-gray-900">{order.product_id}</td>
                      <td className="px-4 py-3 text-gray-900">{order.quantity}</td>
                      <td className="px-4 py-3 text-gray-900">${order.total_price}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <ChartCard
              title="Revenue Trend"
              icon={TrendingUp}
              iconColor="green"
              data={{
                labels: analytics?.monthly_trends?.map((t: any) => t.month) || [],
                values: analytics?.monthly_trends?.map((t: any) => t.revenue) || [],
                change: 15 // Calculate from data
              }}
            />

            {/* Orders Trend */}
            <ChartCard
              title="Orders Trend"
              icon={BarChart3}
              iconColor="blue"
              data={{
                labels: analytics?.monthly_trends?.map((t: any) => t.month) || [],
                values: analytics?.monthly_trends?.map((t: any) => t.orders) || [],
                change: 8 // Calculate from data
              }}
              type="bar"
            />

            {/* Top Products */}
            <DashboardCard
              title="Top Products"
              icon={PieChart}
              iconColor="purple"
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics?.top_products?.map((product: any, index: number) => (
                  <div
                    key={product.name}
                    className="p-4 bg-white/50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="text-sm text-green-600">+{product.growth}%</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                    <div className="text-sm text-gray-500">${product.revenue} revenue</div>
                    <div className="text-sm text-gray-500">{product.quantity} units sold</div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        )}
      </motion.div>
    </div>
  )
}
