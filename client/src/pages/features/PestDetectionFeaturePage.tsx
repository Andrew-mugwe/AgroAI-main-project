import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Camera, Shield, Activity, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PestDetectionFeaturePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl"
          >
            <Bug className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Pest Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Detect crop pests and diseases instantly with our advanced AI technology. 
            Upload an image and get immediate analysis with expert recommendations for treatment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pest-detection"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              <Camera className="w-5 h-5" />
              Start Detection
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg border border-green-200"
            >
              <Zap className="w-5 h-5" />
              View All Features
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Camera className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Analysis</h3>
            <p className="text-gray-600 mb-6">
              Upload a photo of your crop and get instant AI-powered pest identification 
              with confidence scores and detailed analysis.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Drag-and-drop image upload</li>
              <li>• Real-time AI processing</li>
              <li>• Confidence scoring system</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Recommendations</h3>
            <p className="text-gray-600 mb-6">
              Receive tailored treatment recommendations based on pest type, severity, 
              and crop conditions from our agricultural experts.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Treatment recommendations</li>
              <li>• Severity assessment</li>
              <li>• Prevention strategies</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Track & Monitor</h3>
            <p className="text-gray-600 mb-6">
              Keep track of all your pest detections with detailed history, 
              analytics, and progress monitoring over time.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Detection history</li>
              <li>• Analytics dashboard</li>
              <li>• Progress tracking</li>
            </ul>
          </motion.div>
        </div>

        {/* Sample Pests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Detect Common Agricultural Pests
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Fall Armyworm', severity: 'High', confidence: '87%' },
              { name: 'Leaf Rust', severity: 'Medium', confidence: '92%' },
              { name: 'Aphids', severity: 'Low', confidence: '75%' },
              { name: 'Stem Borer', severity: 'Critical', confidence: '89%' }
            ].map((pest, index) => (
              <motion.div
                key={pest.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Bug className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{pest.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Severity: {pest.severity}</p>
                <p className="text-sm text-green-600 font-medium">Confidence: {pest.confidence}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Protect Your Crops Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers using AI to detect and prevent crop damage
          </p>
          <Link
            to="/pest-detection"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg"
          >
            <Camera className="w-5 h-5" />
            Upload Your First Image
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PestDetectionFeaturePage;
