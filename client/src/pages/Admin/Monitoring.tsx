import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface MonitoringOverview {
  total_users: number;
  active_users_7d: number;
  total_orders_7d: number;
  gmv_7d: number;
  avg_reputation: number;
  total_sellers: number;
  verified_sellers: number;
  total_products: number;
  disputes_open: number;
}

interface SellerListItem {
  id: string;
  user_id: string;
  name: string;
  verified: boolean;
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  reputation: number;
  country: string;
  created_at: string;
}

interface ReputationDistribution {
  range: string;
  count: number;
}

interface DisputesOverTime {
  date: string;
  count: number;
}

interface Alert {
  id: string;
  rule_name: string;
  severity: string;
  triggered_at: string;
  payload: any;
  delivered: boolean;
  delivered_channels: string[];
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export function AdminMonitoring() {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [sellers, setSellers] = useState<SellerListItem[]>([]);
  const [reputationDistribution, setReputationDistribution] = useState<ReputationDistribution[]>([]);
  const [disputesOverTime, setDisputesOverTime] = useState<DisputesOverTime[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'analytics' | 'alerts'>('overview');
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOverview();
    loadSellers();
    loadReputationDistribution();
    loadDisputesOverTime();
    loadAlerts();
  }, []);

  useEffect(() => {
    loadSellers();
  }, [sellerFilter, currentPage]);

  const loadOverview = async () => {
    try {
      const response = await apiClient.get('/admin/monitoring/overview');
      if (response.data.success) {
        setOverview(response.data.data);
      }
    } catch (err) {
      setError('Failed to load overview data');
    }
  };

  const loadSellers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (sellerFilter !== 'all') {
        params.append('filter', sellerFilter);
      }
      
      const response = await apiClient.get(`/admin/sellers?${params}`);
      if (response.data.success) {
        setSellers(response.data.data);
        setTotalPages(Math.ceil(response.data.pagination.total / 20));
      }
    } catch (err) {
      setError('Failed to load sellers data');
    } finally {
      setLoading(false);
    }
  };

  const loadReputationDistribution = async () => {
    try {
      const response = await apiClient.get('/admin/monitoring/reputation-distribution');
      if (response.data.success) {
        setReputationDistribution(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load reputation distribution:', err);
    }
  };

  const loadDisputesOverTime = async () => {
    try {
      const response = await apiClient.get('/admin/monitoring/disputes-over-time');
      if (response.data.success) {
        setDisputesOverTime(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load disputes over time:', err);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await apiClient.get('/admin/alerts');
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  const handleVerifySeller = async (sellerId: string, verified: boolean) => {
    try {
      await apiClient.patch(`/admin/sellers/${sellerId}/verify`, { verified });
      loadSellers();
      loadOverview();
    } catch (err) {
      console.error('Failed to update seller verification:', err);
    }
  };

  const handleRecalculateReputation = async (sellerId: string) => {
    try {
      await apiClient.post(`/admin/sellers/${sellerId}/recalculate-reputation`);
      loadSellers();
    } catch (err) {
      console.error('Failed to recalculate reputation:', err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiClient.patch(`/admin/alerts/${alertId}/resolve`);
      loadAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Monitoring</h1>
              <p className="text-gray-600 mt-1">Platform analytics and seller management</p>
            </div>
            <button
              onClick={() => {
                loadOverview();
                loadSellers();
                loadReputationDistribution();
                loadDisputesOverTime();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.total_users.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {overview.active_users_7d} active (7d)
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orders (7d)</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.total_orders_7d.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${overview.gmv_7d.toLocaleString()} GMV
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.total_sellers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {overview.verified_sellers} verified
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Reputation</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.avg_reputation.toFixed(1)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {overview.disputes_open} open disputes
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'sellers', label: 'Sellers', icon: Users },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Reputation Distribution</h4>
                    <div className="space-y-2">
                      {reputationDistribution.map((item) => (
                        <div key={item.range} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.range}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Disputes</h4>
                    <div className="space-y-2">
                      {disputesOverTime.slice(-7).map((item) => (
                        <div key={item.date} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.date}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sellers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Seller Management</h3>
                  <select
                    value={sellerFilter}
                    onChange={(e) => {
                      setSellerFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Sellers</option>
                    <option value="low_reputation">Low Reputation</option>
                    <option value="unverified">Unverified</option>
                    <option value="high_reputation">High Reputation</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reputation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sellers.map((seller) => (
                        <tr key={seller.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                              <div className="text-sm text-gray-500">{seller.country}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              seller.verified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {seller.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <span>{seller.avg_rating.toFixed(1)}</span>
                              <span className="text-gray-500">({seller.total_reviews})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {seller.total_orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              seller.reputation >= 80
                                ? 'bg-green-100 text-green-800'
                                : seller.reputation >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : seller.reputation >= 40
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(seller.reputation)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVerifySeller(seller.user_id, !seller.verified)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  seller.verified
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {seller.verified ? 'Unverify' : 'Verify'}
                              </button>
                              <button
                                onClick={() => handleRecalculateReputation(seller.user_id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                              >
                                Recalc
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                  <button
                    onClick={loadAlerts}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alert
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Triggered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {alerts.map((alert) => (
                        <tr key={alert.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{alert.rule_name}</div>
                              <div className="text-sm text-gray-500">
                                {alert.payload?.description || 'System alert'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : alert.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(alert.triggered_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                alert.delivered
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {alert.delivered ? 'Delivered' : 'Pending'}
                              </span>
                              {alert.delivered_channels.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  via {alert.delivered_channels.join(', ')}
                                </span>
                              )}
                              {alert.resolved_at && (
                                <span className="text-xs text-green-600">
                                  Resolved {new Date(alert.resolved_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!alert.resolved_at && (
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                              >
                                Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {alerts.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No alerts found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Advanced analytics and PostHog integration coming soon.
                    <br />
                    This will include detailed charts, user behavior analysis, and conversion tracking.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMonitoring;
