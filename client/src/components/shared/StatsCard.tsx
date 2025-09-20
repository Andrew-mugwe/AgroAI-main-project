import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  iconColor?: string
  changeColor?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'green',
  changeColor = 'green',
  delay = 0
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm text-${changeColor}-600 mt-1`}>{change}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${iconColor}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${iconColor}-600`} />
        </div>
      </div>
    </motion.div>
  )
}
