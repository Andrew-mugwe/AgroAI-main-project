import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle,
  CheckCircle,
  Bug,
  Shield,
  Activity,
  TrendingUp
} from 'lucide-react';

import UploadForm from '../../components/pests/UploadForm';
import HistoryList from '../../components/pests/HistoryList';
import { PestReport } from '../../components/pests/ReportCard';

const PestsPage: React.FC = () => {
  const [reports, setReports] = useState<PestReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock API calls - in real implementation, these would call actual endpoints
  const fetchReports = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data with enhanced details
      const mockReports: PestReport[] = [
        {
          id: 1,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/fall_armyworm.png',
          pest_name: 'Fall Armyworm',
          confidence: 87.5,
          notes: 'Detected on maize leaves in the northern field. Heavy infestation observed with characteristic feeding patterns.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'high',
          recommended_action: 'Apply Bacillus thuringiensis (Bt) spray immediately. Monitor field daily for further spread.'
        },
        {
          id: 2,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/leaf_rust.png',
          pest_name: 'Leaf Rust',
          confidence: 92.3,
          notes: 'Found in wheat regions. Early detection allows for timely treatment before significant yield loss.',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'medium',
          recommended_action: 'Apply fungicide containing tebuconazole. Ensure proper field drainage and air circulation.'
        },
        {
          id: 3,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/aphids.png',
          pest_name: 'Aphids',
          confidence: 75.8,
          notes: 'Common in vegetable gardens. Affecting tomato plants primarily with visible honeydew secretion.',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'low',
          recommended_action: 'Introduce beneficial insects like ladybugs. Apply neem oil spray as organic control.'
        },
        {
          id: 4,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/stemborer.png',
          pest_name: 'Stem Borer',
          confidence: 89.2,
          notes: 'Found in sorghum fields. Larvae detected in stem samples with characteristic entry holes.',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'critical',
          recommended_action: 'URGENT: Apply systemic insecticide. Consider crop rotation and resistant varieties for next season.'
        },
        {
          id: 5,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/fall_armyworm.png',
          pest_name: 'Whitefly',
          confidence: 81.4,
          notes: 'Detected on cotton plants. Population density increasing rapidly with visible whitefly clouds.',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'high',
          recommended_action: 'Apply insecticidal soap or pyrethrin-based spray. Monitor for viral transmission.'
        },
        {
          id: 6,
          user_id: '11111111-1111-1111-1111-111111111111',
          image_url: 'assets/seeds/leaf_rust.png',
          pest_name: 'Powdery Mildew',
          confidence: 94.1,
          notes: 'White powdery coating on cucumber leaves. High humidity conditions favoring fungal growth.',
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'medium',
          recommended_action: 'Improve air circulation. Apply sulfur-based fungicide. Reduce overhead watering.'
        }
      ];
      
      setReports(mockReports);
    } catch (err) {
      setError('Failed to fetch pest reports');
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
      
      // Mock successful upload with AI analysis
      const newReport: PestReport = {
        id: Date.now(),
        user_id: '11111111-1111-1111-1111-111111111111',
        image_url: URL.createObjectURL(file),
        pest_name: 'Whitefly', // Mock AI detection
        confidence: 85.2,
        notes: notes,
        created_at: new Date().toISOString(),
        severity: 'high',
        recommended_action: 'Apply insecticidal soap immediately. Monitor for viral transmission and consider beneficial insects.'
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
    fetchReports();
  }, []);

  // Calculate stats
  const totalReports = reports.length;
  const avgConfidence = reports.reduce((sum, report) => sum + report.confidence, 0) / reports.length || 0;
  const criticalReports = reports.filter(r => r.severity === 'critical').length;
  const highSeverityReports = reports.filter(r => r.severity === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6 shadow-xl"
          >
            <Bug className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Detect Crop Pests & Diseases Instantly
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI-powered pest and disease detection for healthier crops and better yields. 
            Upload an image and get instant analysis with recommended treatments.
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-gray-900">{totalReports}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-green-600">{avgConfidence.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-red-600">{criticalReports}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-orange-600">{highSeverityReports}</div>
              <div className="text-sm text-gray-600">High Severity</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <UploadForm
            onUpload={handleUpload}
            isUploading={loading}
          />
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <HistoryList
            reports={reports}
            onDelete={handleDeleteReport}
            onView={handleViewReport}
            onRefresh={fetchReports}
            loading={loading}
          />
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Our AI Detection?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Analysis</h3>
              <p className="text-gray-600">
                Get immediate pest identification and severity assessment within seconds.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Recommendations</h3>
              <p className="text-gray-600">
                Receive tailored treatment recommendations based on pest type and severity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your crop health over time with detailed detection history.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PestsPage;
