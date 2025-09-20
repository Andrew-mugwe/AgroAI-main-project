import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  BarChart3, 
  Upload, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import PestCard, { PestReport } from '../../components/pest/PestCard';
import PestUploadForm from '../../components/pest/PestUploadForm';
import PestAnalytics, { PestAnalytics as PestAnalyticsType } from '../../components/pest/PestAnalytics';

const PestDetectionPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'reports' | 'analytics'>('upload');
  const [reports, setReports] = useState<PestReport[]>([]);
  const [analytics, setAnalytics] = useState<PestAnalyticsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock API calls - in real implementation, these would call actual endpoints
  const fetchReports = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockReports: PestReport[] = [
        {
          id: 1,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/fall_armyworm.png',
          pest_name: 'Fall Armyworm',
          confidence: 87.5,
          notes: 'Detected on maize leaves in the northern field. Heavy infestation observed.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/leaf_rust.png',
          pest_name: 'Leaf Rust',
          confidence: 92.3,
          notes: 'Found in wheat regions. Early detection allows for timely treatment.',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/aphids.png',
          pest_name: 'Aphids',
          confidence: 75.8,
          notes: 'Common in vegetable gardens. Affecting tomato plants primarily.',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setReports(mockReports);
    } catch (err) {
      setError('Failed to fetch pest reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      const mockAnalytics: PestAnalyticsType[] = [
        {
          pest_name: 'Fall Armyworm',
          count: 15,
          avg_confidence: 87.2,
          last_detected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          pest_name: 'Leaf Rust',
          count: 8,
          avg_confidence: 91.5,
          last_detected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          pest_name: 'Aphids',
          count: 12,
          avg_confidence: 78.3,
          last_detected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          pest_name: 'Stem Borer',
          count: 6,
          avg_confidence: 82.1,
          last_detected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, notes: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful upload
      const newReport: PestReport = {
        id: Date.now(),
        user_id: '11111111-1111-1111-1111-111111111111',
        image_url: URL.createObjectURL(file),
        pest_name: 'Whitefly', // Mock AI detection
        confidence: 85.2,
        notes: notes,
        created_at: new Date().toISOString()
      };
      
      setReports(prev => [newReport, ...prev]);
      setSuccess('Pest image uploaded and analyzed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReports(prev => prev.filter(report => report.id !== id));
      setSuccess('Pest report deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete report');
    }
  };

  const handleViewReport = (report: PestReport) => {
    // In a real implementation, this would open a detailed view modal
    console.log('Viewing report:', report);
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'upload', label: 'Upload Image', icon: Upload },
    { id: 'reports', label: 'My Reports', icon: Camera },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🐛 Pest & Disease Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered pest and disease detection for healthier crops and better yields
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <PestUploadForm
                onUpload={handleUpload}
                isUploading={loading}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  My Pest Reports ({reports.length})
                </h2>
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No pest reports yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Upload your first pest image to get started with AI detection.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map((report) => (
                    <PestCard
                      key={report.id}
                      report={report}
                      onDelete={handleDeleteReport}
                      onView={handleViewReport}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pest Detection Analytics
                </h2>
                <button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <PestAnalytics analytics={analytics} loading={loading} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PestDetectionPage;
