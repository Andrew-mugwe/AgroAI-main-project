import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface ChartCardProps {
  title: string
  icon?: LucideIcon
  iconColor?: string
  data: {
    labels: string[]
    values: number[]
    change?: number
  }
  type?: 'line' | 'bar'
  delay?: number
}

export function ChartCard({
  title,
  icon: Icon,
  iconColor = 'blue',
  data,
  type = 'line',
  delay = 0
}: ChartCardProps) {
  const maxValue = Math.max(...data.values)
  const minValue = Math.min(...data.values)
  const range = maxValue - minValue
  const normalizedValues = data.values.map(v => ((v - minValue) / range) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`w-5 h-5 text-${iconColor}-500`} />}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {data.change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${
            data.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(data.change)}%</span>
          </div>
        )}
      </div>

      <div className="h-48 flex items-end space-x-2">
        {normalizedValues.map((value, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center"
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ duration: 0.5, delay: delay + index * 0.1 }}
              className={`w-full ${type === 'line' ? 'border-t-2' : 'rounded-t-sm'} ${
                type === 'line' ? `border-${iconColor}-500` : `bg-${iconColor}-500`
              }`}
            />
            <span className="text-xs text-gray-600 mt-2">{data.labels[index]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
