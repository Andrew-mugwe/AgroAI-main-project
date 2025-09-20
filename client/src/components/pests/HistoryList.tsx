import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar,
  X,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ReportCard, { PestReport } from './ReportCard';

interface HistoryListProps {
  reports: PestReport[];
  onDelete?: (id: number) => void;
  onView?: (report: PestReport) => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ 
  reports, 
  onDelete, 
  onView, 
  onRefresh,
  loading = false,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedReport, setSelectedReport] = useState<PestReport | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Filter reports based on search and severity
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.pest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleViewReport = (report: PestReport) => {
    setSelectedReport(report);
    onView?.(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  const getSeverityStats = () => {
    const stats = reports.reduce((acc, report) => {
      const severity = report.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const severityStats = getSeverityStats();

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Detection History
          </h2>
          <p className="text-gray-600">
            {filteredReports.length} of {reports.length} reports
          </p>
        </div>
        
        {onRefresh && (
          <motion.button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Severity Stats */}
      {Object.keys(severityStats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(severityStats).map(([severity, count]) => (
            <motion.div
              key={severity}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                {severity === 'critical' && <X className="w-4 h-4 text-red-600" />}
                {severity === 'high' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                {severity === 'medium' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                {severity === 'low' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {severity === 'unknown' && <AlertCircle className="w-4 h-4 text-gray-600" />}
                <span className="text-sm font-semibold text-gray-700 capitalize">
                  {severity}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reports Grid/List */}
      {filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reports found
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterSeverity !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first pest image to get started'
            }
          </p>
        </motion.div>
      ) : (
        <motion.div
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }
          layout
        >
          <AnimatePresence>
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <ReportCard
                  report={report}
                  onDelete={onDelete}
                  onView={handleViewReport}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Report Details
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                <ReportCard
                  report={selectedReport}
                  onDelete={onDelete}
                  onView={onView}
                  showActions={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryList;
