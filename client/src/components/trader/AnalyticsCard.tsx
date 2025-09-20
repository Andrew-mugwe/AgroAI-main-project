import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  icon: LucideIcon
  iconColor?: string
  description?: string
  delay?: number
}

export function AnalyticsCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = 'green',
  description,
  delay = 0
}: AnalyticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${iconColor}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${iconColor}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </motion.div>
  )
}
