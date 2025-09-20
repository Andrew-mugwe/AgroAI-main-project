import { motion } from 'framer-motion'
import { Package, Edit, Archive, MoreVertical } from 'lucide-react'

interface ProductListingCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    category: string
    status: string
    imageUrl?: string
  }
  onEdit?: (id: string) => void
  onArchive?: (id: string) => void
}

export function ProductListingCard({ product, onEdit, onArchive }: ProductListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button className="p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {product.status}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{product.category}</span>
          <span>{product.stock} in stock</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(product.id)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onArchive?.(product.id)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
