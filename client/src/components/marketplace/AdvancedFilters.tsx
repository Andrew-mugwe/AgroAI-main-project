import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface FilterOptions {
  priceRange: [number, number]
  availability: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  verifiedOnly: boolean
  sustainableOnly: boolean
  hasQrCode: boolean
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name'
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  maxPrice: number
}

export function AdvancedFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  maxPrice 
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      priceRange: [0, maxPrice],
      availability: 'all',
      verifiedOnly: false,
      sustainableOnly: false,
      hasQrCode: false,
      sortBy: 'newest'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={localFilters.priceRange[0]}
                        onChange={(e) => handleFilterChange('priceRange', [
                          parseInt(e.target.value) || 0,
                          localFilters.priceRange[1]
                        ])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Min price"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        value={localFilters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [
                          localFilters.priceRange[0],
                          parseInt(e.target.value) || maxPrice
                        ])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Max price"
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      Range: KES {localFilters.priceRange[0].toLocaleString()} - KES {localFilters.priceRange[1].toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Products' },
                      { value: 'in-stock', label: 'In Stock' },
                      { value: 'low-stock', label: 'Low Stock' },
                      { value: 'out-of-stock', label: 'Out of Stock' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="availability"
                          value={option.value}
                          checked={localFilters.availability === option.value}
                          onChange={(e) => handleFilterChange('availability', e.target.value)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quality Filters */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quality & Verification</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={localFilters.verifiedOnly}
                        onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">Verified Sellers Only</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={localFilters.sustainableOnly}
                        onChange={(e) => handleFilterChange('sustainableOnly', e.target.checked)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">Sustainable Products Only</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={localFilters.hasQrCode}
                        onChange={(e) => handleFilterChange('hasQrCode', e.target.checked)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">QR Code Verification</span>
                    </label>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sort By</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'price-asc', label: 'Price: Low to High' },
                      { value: 'price-desc', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Highest Rated' },
                      { value: 'name', label: 'Name A-Z' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={localFilters.sortBy === option.value}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 space-y-3">
                <button
                  onClick={handleReset}
                  className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={handleApply}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
