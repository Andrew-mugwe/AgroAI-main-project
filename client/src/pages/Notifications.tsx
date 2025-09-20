import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Filter, 
  Check, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Package,
  Cloud,
  Bug,
  GraduationCap,
  DollarSign,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Notification {
  id: string;
  user_id: string;
  role: string;
  type: string;
  message: string;
  status: 'unread' | 'read';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  recent_7_days: number;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    role: '',
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: ((pagination.page - 1) * pagination.pageSize).toString(),
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.role) params.append('role', filters.role);
      
      const response = await axios.get<NotificationResponse>(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.total_pages,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!user) return;

    try {
      const response = await axios.get('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/mark-read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read' as const }
            : notification
        )
      );
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update stats
      if (stats && notification) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          unread: notification.status === 'unread' ? Math.max(0, prev.unread - 1) : prev.unread,
        } : null);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' as const }))
      );
      
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: 0 } : null);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'unread' | 'read') => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, status: tab === 'all' ? '' : tab }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    const icons = {
      weather: <Cloud className="w-4 h-4" />,
      pest: <Bug className="w-4 h-4" />,
      training: <GraduationCap className="w-4 h-4" />,
      stock: <Package className="w-4 h-4" />,
      price: <DollarSign className="w-4 h-4" />,
      system: <Settings className="w-4 h-4" />,
      market: <TrendingUp className="w-4 h-4" />,
      crop: <Package className="w-4 h-4" />,
      general: <Info className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Info className="w-4 h-4" />;
  };

  // Get notification type color
  const getTypeColor = (type: string) => {
    const colors = {
      weather: 'bg-blue-100 text-blue-800 border-blue-200',
      pest: 'bg-red-100 text-red-800 border-red-200',
      training: 'bg-green-100 text-green-800 border-green-200',
      stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      price: 'bg-purple-100 text-purple-800 border-purple-200',
      system: 'bg-gray-100 text-gray-800 border-gray-200',
      market: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      crop: 'bg-orange-100 text-orange-800 border-orange-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const colors = {
      farmer: 'text-green-600 bg-green-50',
      ngo: 'text-blue-600 bg-blue-50',
      trader: 'text-orange-600 bg-orange-50',
      admin: 'text-purple-600 bg-purple-50',
    };
    return colors[role as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchStats();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, pagination.page, filters]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="w-8 h-8 mr-3" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with your latest alerts and messages</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => { fetchNotifications(); fetchStats(); }}
                className="btn btn-outline"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {stats && stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-primary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recent_7_days}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Types</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.by_type).length}</p>
                </div>
                <Info className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All', count: stats?.total || 0 },
                { key: 'unread', label: 'Unread', count: stats?.unread || 0 },
                { key: 'read', label: 'Read', count: (stats?.total || 0) - (stats?.unread || 0) },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as 'all' | 'unread' | 'read')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Types</option>
                  <option value="weather">Weather</option>
                  <option value="pest">Pest Alert</option>
                  <option value="training">Training</option>
                  <option value="stock">Stock</option>
                  <option value="price">Price</option>
                  <option value="system">System</option>
                  <option value="market">Market</option>
                  <option value="crop">Crop</option>
                  <option value="general">General</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Roles</option>
                  <option value="farmer">Farmer</option>
                  <option value="ngo">NGO</option>
                  <option value="trader">Trader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="card">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! Check back later for new updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 ${
                    notification.status === 'unread' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg border ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRoleColor(notification.role)}`}>
                            {notification.role}
                          </span>
                          {notification.status === 'unread' && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-900 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">{formatTime(notification.created_at)}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
