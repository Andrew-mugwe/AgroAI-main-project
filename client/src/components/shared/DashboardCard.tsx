import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  icon?: LucideIcon
  iconColor?: string
  className?: string
  children: React.ReactNode
  delay?: number
  fullWidth?: boolean
}

export function DashboardCard({
  title,
  icon: Icon,
  iconColor = 'gray',
  className = '',
  children,
  delay = 0,
  fullWidth = false
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {Icon && <Icon className={`w-6 h-6 text-${iconColor}-500`} />}
      </div>
      {children}
    </motion.div>
  )
}