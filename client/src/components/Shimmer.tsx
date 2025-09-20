import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = false,
}) => {
  return (
    <motion.div
      className={`bg-gray-200 ${height} ${width} ${
        rounded ? 'rounded-full' : 'rounded'
      } ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// Dashboard Shimmer Components
export const DashboardShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer height="h-8" width="w-48" />
          <Shimmer height="h-4" width="w-32" />
        </div>
        <Shimmer height="h-10" width="w-24" rounded />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-3">
              <Shimmer height="h-4" width="w-20" />
              <Shimmer height="h-8" width="w-16" />
              <Shimmer height="h-3" width="w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <Shimmer height="h-6" width="w-32" />
              <Shimmer height="h-64" width="w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Shimmer
export const TableShimmer: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <Shimmer key={i} height="h-4" width="w-24" />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-gray-100">
          <div className="flex space-x-4">
            {[...Array(4)].map((_, j) => (
              <Shimmer key={j} height="h-4" width="w-20" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Card Shimmer
export const CardShimmer: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <Shimmer height="h-6" width="w-3/4" />
        <Shimmer height="h-4" width="w-full" />
        <Shimmer height="h-4" width="w-5/6" />
        <Shimmer height="h-4" width="w-4/6" />
        <div className="pt-4">
          <Shimmer height="h-8" width="w-24" rounded />
        </div>
      </div>
    </div>
  );
};

// List Shimmer
export const ListShimmer: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
          <Shimmer height="h-12" width="w-12" rounded />
          <div className="flex-1 space-y-2">
            <Shimmer height="h-4" width="w-3/4" />
            <Shimmer height="h-3" width="w-1/2" />
          </div>
          <Shimmer height="h-8" width="w-16" rounded />
        </div>
      ))}
    </div>
  );
};
