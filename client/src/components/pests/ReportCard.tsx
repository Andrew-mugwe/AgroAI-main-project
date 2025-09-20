import React from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
  Eye,
  Shield,
  Activity,
  TrendingUp
} from 'lucide-react';

export interface PestReport {
  id: number;
  user_id: string;
  image_url: string;
  pest_name: string;
  confidence: number;
  notes: string;
  created_at: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recommended_action?: string;
}

interface ReportCardProps {
  report: PestReport;
  onDelete?: (id: number) => void;
  onView?: (report: PestReport) => void;
  showActions?: boolean;
  className?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  onDelete, 
  onView, 
  showActions = true,
  className = ""
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 75) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Image Section with Medical Scan Styling */}
      <div className="relative h-64 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {report.image_url ? (
          <div className="relative w-full h-full">
            <img
              src={report.image_url}
              alt={`Pest detection: ${report.pest_name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            
            {/* Medical scan overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
            
            {/* Scan lines animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />
          </div>
        ) : null}
        
        {/* Fallback placeholder */}
        <div className={`absolute inset-0 flex items-center justify-center ${report.image_url ? 'hidden' : ''}`}>
          <div className="text-center">
            <div className="relative">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-green-400"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <p className="text-gray-500 text-lg font-medium">Pest Image</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="absolute top-4 right-4"
        >
          <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ${getConfidenceColor(report.confidence)}`}>
            {getConfidenceIcon(report.confidence)}
            {report.confidence.toFixed(1)}%
          </div>
        </motion.div>

        {/* Pest Name Badge */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4"
        >
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-lg font-bold text-gray-800 shadow-lg">
            {report.pest_name}
          </div>
        </motion.div>

        {/* Severity Badge */}
        {report.severity && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-4 right-4"
          >
            <div className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${getSeverityColor(report.severity)}`}>
              {getSeverityIcon(report.severity)}
              {report.severity.toUpperCase()}
            </div>
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-xl mb-2">
              {report.pest_name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(report.created_at)}
            </div>
          </div>
        </div>

        {/* Notes */}
        {report.notes && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {report.notes}
            </p>
          </div>
        )}

        {/* Recommended Action */}
        {report.recommended_action && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Recommended Action:</p>
                <p className="text-sm text-blue-700">{report.recommended_action}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Confidence</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI Analysis</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            ID: #{report.id}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 pt-4 border-t border-gray-100"
          >
            {onView && (
              <motion.button
                onClick={() => onView(report)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                View Details
              </motion.button>
            )}
            
            {onDelete && (
              <motion.button
                onClick={() => onDelete(report.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors ml-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ReportCard;
