import React, { Suspense } from 'react'
import { motion } from 'framer-motion'

// Skeleton loader component
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />
)

// Dashboard chart skeleton
export const ChartSkeleton = () => (
  <div className="p-4 border rounded-lg bg-white">
    <Skeleton className="h-8 w-1/3 mb-4" />
    <Skeleton className="h-64" />
  </div>
)

// Table skeleton
export const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex space-x-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-8 flex-1" />
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        {[...Array(4)].map((_, j) => (
          <Skeleton key={j} className="h-6 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

// HOC for lazy loading components with suspense
export const withLazy = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType = ChartSkeleton
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingComponent />}>
      <Component {...props} />
    </Suspense>
  )
}

// Utility for lazy loading routes
export const lazyRoute = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  LoadingComponent: React.ComponentType = ChartSkeleton
) => {
  const LazyComponent = React.lazy(importFunc)
  return withLazy(LazyComponent, LoadingComponent)
}
