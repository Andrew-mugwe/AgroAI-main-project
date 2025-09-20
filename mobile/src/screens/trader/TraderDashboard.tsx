import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  useWindowDimensions
} from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout
} from 'react-native-reanimated'
import {
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react-native'
import { api } from '../../services/api'
import { theme } from '../../theme'
import { AnalyticsCard } from '../../components/trader/AnalyticsCard'
import { ProductListingCard } from '../../components/trader/ProductListingCard'
import { OrderListItem } from '../../components/trader/OrderListItem'
import { LineChart, BarChart } from 'react-native-chart-kit'

// Tab Scenes
const ListingsRoute = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/trader/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={styles.scene}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchProducts} />
      }
    >
      <View style={styles.grid}>
        {products.map((product, index) => (
          <Animated.View
            key={product.id}
            entering={FadeInRight.delay(index * 100)}
            layout={Layout.springify()}
            style={styles.gridItem}
          >
            <ProductListingCard
              product={product}
              onEdit={(id) => console.log('Edit:', id)}
              onArchive={(id) => console.log('Archive:', id)}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  )
}

const OrdersRoute = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/trader/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={styles.scene}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
      }
    >
      {orders.map((order, index) => (
        <Animated.View
          key={order.id}
          entering={FadeInDown.delay(index * 100)}
          layout={Layout.springify()}
        >
          <OrderListItem order={order} />
        </Animated.View>
      ))}
    </ScrollView>
  )
}

const AnalyticsRoute = () => {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { width } = useWindowDimensions()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/trader/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={styles.scene}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAnalytics} />
      }
    >
      {/* Analytics Cards */}
      <View style={styles.statsGrid}>
        <AnalyticsCard
          title="Active Listings"
          value={analytics?.marketplace_stats?.active_listings || 0}
          icon={Package}
          iconColor={theme.colors.blue[500]}
          trend={{ value: 12, isPositive: true }}
        />
        <AnalyticsCard
          title="Pending Orders"
          value={analytics?.marketplace_stats?.pending_orders || 0}
          icon={ShoppingCart}
          iconColor={theme.colors.yellow[500]}
          trend={{ value: 5, isPositive: true }}
        />
        <AnalyticsCard
          title="Total Sales"
          value={`$${analytics?.marketplace_stats?.total_sales?.toLocaleString() || 0}`}
          icon={TrendingUp}
          iconColor={theme.colors.green[500]}
          trend={{ value: 15, isPositive: true }}
        />
      </View>

      {/* Revenue Chart */}
      {analytics?.monthly_trends && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <LineChart
            data={{
              labels: analytics.monthly_trends.map((t: any) => t.month),
              datasets: [{
                data: analytics.monthly_trends.map((t: any) => t.revenue)
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.white,
              backgroundGradientFrom: theme.colors.white,
              backgroundGradientTo: theme.colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.green[500],
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Orders Chart */}
      {analytics?.monthly_trends && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Orders Trend</Text>
          <BarChart
            data={{
              labels: analytics.monthly_trends.map((t: any) => t.month),
              datasets: [{
                data: analytics.monthly_trends.map((t: any) => t.orders)
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.white,
              backgroundGradientFrom: theme.colors.white,
              backgroundGradientTo: theme.colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.blue[500],
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
          />
        </View>
      )}
    </ScrollView>
  )
}

export function TraderDashboard() {
  const layout = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'listings', title: 'Listings' },
    { key: 'orders', title: 'Orders' },
    { key: 'analytics', title: 'Analytics' }
  ])

  const renderScene = SceneMap({
    listings: ListingsRoute,
    orders: OrdersRoute,
    analytics: AnalyticsRoute
  })

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={theme.colors.green[600]}
      inactiveColor={theme.colors.gray[600]}
    />
  )

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50]
  },
  scene: {
    flex: 1,
    padding: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8
  },
  gridItem: {
    width: '50%',
    padding: 8
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 20
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.md
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray[900],
    marginBottom: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  tabBar: {
    backgroundColor: theme.colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200]
  },
  tabIndicator: {
    backgroundColor: theme.colors.green[600]
  },
  tabLabel: {
    fontWeight: '600',
    textTransform: 'none'
  }
})
