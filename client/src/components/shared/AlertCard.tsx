import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

type AlertType = 'warning' | 'success' | 'info' | 'error'

interface AlertCardProps {
  type: AlertType
  title: string
  message: string
  delay?: number
}

const alertStyles = {
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-600'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    messageColor: 'text-green-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-600'
  }
}

export function AlertCard({ type, title, message, delay = 0 }: AlertCardProps) {
  const style = alertStyles[type]
  const Icon = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-lg border ${style.bg} ${style.border}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
        <div>
          <p className={`text-sm font-medium ${style.titleColor}`}>{title}</p>
          <p className={`text-xs ${style.messageColor}`}>{message}</p>
        </div>
      </div>
    </motion.div>
  )
}
