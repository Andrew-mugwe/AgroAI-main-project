import React from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
  Eye
} from 'lucide-react';

export interface PestReport {
  id: number;
  user_id: string;
  image_url: string;
  pest_name: string;
  confidence: number;
  notes: string;
  created_at: string;
}

interface PestCardProps {
  report: PestReport;
  onDelete?: (id: number) => void;
  onView?: (report: PestReport) => void;
  showActions?: boolean;
}

const PestCard: React.FC<PestCardProps> = ({ 
  report, 
  onDelete, 
  onView, 
  showActions = true 
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt={`Pest detection: ${report.pest_name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className={`absolute inset-0 flex items-center justify-center ${report.image_url ? 'hidden' : ''}`}>
          <div className="text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Pest Image</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getConfidenceColor(report.confidence)}`}>
            {getConfidenceIcon(report.confidence)}
            {report.confidence.toFixed(1)}%
          </div>
        </div>

        {/* Pest Name Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
            {report.pest_name}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {report.pest_name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(report.created_at)}
            </div>
          </div>
        </div>

        {/* Notes */}
        {report.notes && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              {report.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {onView && (
              <button
                onClick={() => onView(report)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(report.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PestCard;
