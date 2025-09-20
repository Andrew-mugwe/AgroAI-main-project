import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Clock, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatFeaturePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-xl"
          >
            <MessageSquare className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Chat & Messaging System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with farmers, traders, and NGOs through our secure, role-aware messaging platform. 
            Share insights, coordinate activities, and build stronger agricultural communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
            >
              <MessageSquare className="w-5 h-5" />
              Start Chatting
            </Link>
            <Link
              to="/demo/messaging"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg border border-blue-200"
            >
              <Zap className="w-5 h-5" />
              View Demo
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 shadow-lg"
            >
              ← Back to Features
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Access</h3>
            <p className="text-gray-600 mb-6">
              Secure messaging with role-specific permissions. Farmers, traders, and NGOs can communicate 
              based on their access levels and business relationships.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Direct farmer-trader conversations</li>
              <li>• NGO group discussions</li>
              <li>• Secure message encryption</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Communication</h3>
            <p className="text-gray-600 mb-6">
              Stay connected with instant messaging, real-time notifications, and live updates 
              from your agricultural network.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Instant message delivery</li>
              <li>• Push notifications</li>
              <li>• Message status indicators</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h3>
            <p className="text-gray-600 mb-6">
              Enterprise-grade security with end-to-end encryption, message history, 
              and privacy controls for sensitive agricultural discussions.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• End-to-end encryption</li>
              <li>• Message history backup</li>
              <li>• Privacy controls</li>
            </ul>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of agricultural professionals already using our messaging platform
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
            Start Your First Conversation
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatFeaturePage;
