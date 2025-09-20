import { Clock, CheckCircle2, Truck, XCircle, AlertCircle } from 'lucide-react'

interface OrderStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  showIcon?: boolean
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  confirmed: {
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  shipped: {
    icon: Truck,
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600'
  },
  delivered: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  },
  cancelled: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  }
}

export function OrderStatusBadge({ status, showIcon = true }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600'
  }
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {showIcon && <Icon className={`w-4 h-4 ${config.iconColor} mr-1.5`} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
