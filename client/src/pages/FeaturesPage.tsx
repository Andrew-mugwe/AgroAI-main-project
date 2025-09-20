import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Bug, 
  Bell, 
  BarChart3, 
  Users, 
  ShoppingCart,
  Camera,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      id: 'messaging',
      title: 'Messaging & Chat',
      description: 'Secure, role-aware communication between farmers, NGOs, traders, and administrators.',
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      route: '/features/chat',
      status: '✅ Live',
      features: [
        'Direct & Group Conversations',
        'Real-time Message Polling',
        'Role-based Access Control',
        'Message Validation & Sanitization',
        '17 Sample Messages Included'
      ]
    },
    {
      id: 'pest-detection',
      title: 'Pest & Disease Detection',
      description: 'AI-powered identification of agricultural pests and diseases through image analysis.',
      icon: Bug,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      route: '/features/pest-detection',
      status: '✅ Live',
      features: [
        'Image Upload & Analysis',
        'AI Classification Stub',
        'Confidence Scoring',
        'Pest Analytics Dashboard',
        '4 Sample Pest Types'
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      description: 'Smart notification system with email fallback and role-specific alerts.',
      icon: Bell,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      route: '/notifications',
      status: '✅ Live',
      features: [
        'In-app Notifications',
        'Email Fallback (SendGrid)',
        'Role-specific Alerts',
        'Read/Unread Status',
        'Real-time Updates'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for agricultural insights.',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      route: '/dashboard',
      status: '✅ Live',
      features: [
        'Crop Performance Metrics',
        'Weather Data Integration',
        'Market Price Tracking',
        'Yield Predictions',
        'Custom Reports'
      ]
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Role-based user system with farmer, NGO, trader, and admin roles.',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      route: '/dashboard',
      status: '✅ Live',
      features: [
        'Multi-role Authentication',
        'JWT Security',
        'Profile Management',
        'Role-based Dashboards',
        'Secure Access Control'
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Agricultural marketplace for buying and selling crops and supplies.',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/marketplace',
      status: '🚧 Coming Soon',
      features: [
        'Product Listings',
        'Price Comparison',
        'Order Management',
        'Payment Integration',
        'Review System'
      ]
    }
  ];

  const stats = [
    { label: 'Active Features', value: '5', icon: Zap },
    { label: 'API Endpoints', value: '15+', icon: Globe },
    { label: 'User Roles', value: '4', icon: Users },
    { label: 'Sample Data', value: '50+', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🚀 AgroAI Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the comprehensive suite of agricultural technology features 
            designed to empower farmers, NGOs, traders, and agricultural professionals.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className={`p-6 ${feature.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      feature.status.includes('Live') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="p-6">
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-3 ${feature.iconColor.replace('text-', 'bg-')}`}></div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Link
                    to={feature.route}
                    className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      feature.status.includes('Live')
                        ? `bg-gradient-to-r ${feature.color} text-white hover:opacity-90`
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {feature.status.includes('Live') ? 'Explore Feature' : 'Coming Soon'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-white rounded-xl shadow-lg border border-gray-100 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🛠️ Technology Stack
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚛️</span>
              </div>
              <h3 className="font-semibold text-gray-900">React</h3>
              <p className="text-sm text-gray-600">Frontend Framework</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🐹</span>
              </div>
              <h3 className="font-semibold text-gray-900">Go</h3>
              <p className="text-sm text-gray-600">Backend Language</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🐘</span>
              </div>
              <h3 className="font-semibold text-gray-900">PostgreSQL</h3>
              <p className="text-sm text-gray-600">Database</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900">Tailwind CSS</h3>
              <p className="text-sm text-gray-600">Styling</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Explore the features and see how AgroAI can transform your agricultural operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Try Messaging
              </Link>
              <Link
                to="/pest-detection"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors"
              >
                Test Pest Detection
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesPage;
