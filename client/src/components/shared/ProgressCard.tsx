import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ProgressCardProps {
  title: string
  value: number
  max: number
  icon?: LucideIcon
  iconColor?: string
  progressColor?: string
  subtitle?: string
  delay?: number
}

export function ProgressCard({
  title,
  value,
  max,
  icon: Icon,
  iconColor = 'green',
  progressColor = 'green',
  subtitle,
  delay = 0
}: ProgressCardProps) {
  const percentage = (value / max) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 bg-${iconColor}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${iconColor}-600`} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="text-gray-600">of {max}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, delay }}
            className={`h-full bg-${progressColor}-500 rounded-full`}
          />
        </div>
      </div>
    </motion.div>
  )
}
