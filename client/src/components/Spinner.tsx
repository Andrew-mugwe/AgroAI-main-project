import { cn } from '../utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  white: 'text-white',
  gray: 'text-gray-600'
}

export function Spinner({ 
  size = 'md', 
  color = 'primary', 
  className,
  label = 'Loading...'
}: SpinnerProps) {
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-current',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
  spinnerColor?: 'primary' | 'secondary' | 'white' | 'gray'
  overlayClassName?: string
  label?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  spinnerSize = 'lg',
  spinnerColor = 'white',
  overlayClassName,
  label = 'Loading...'
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div 
        className={cn(
          'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
          overlayClassName
        )}
      >
        <div className="flex flex-col items-center space-y-2">
          <Spinner size={spinnerSize} color={spinnerColor} />
          <p className="text-white text-sm">{label}</p>
        </div>
      </div>
    </div>
  )
}

// Button with loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  spinnerSize?: 'sm' | 'md' | 'lg'
  spinnerColor?: 'primary' | 'secondary' | 'white' | 'gray'
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  spinnerSize = 'sm',
  spinnerColor = 'white',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'btn btn-primary flex items-center justify-center space-x-2',
        isLoading && 'opacity-75 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner size={spinnerSize} color={spinnerColor} />
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  )
}

// Page loading component
interface PageLoadingProps {
  message?: string
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
  spinnerColor?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export function PageLoading({
  message = 'Loading...',
  spinnerSize = 'xl',
  spinnerColor = 'primary',
  className
}: PageLoadingProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-screen space-y-4',
      className
    )}>
      <Spinner size={spinnerSize} color={spinnerColor} />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  )
}

// Inline loading component
interface InlineLoadingProps {
  message?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
  spinnerColor?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export function InlineLoading({
  message = 'Loading...',
  spinnerSize = 'md',
  spinnerColor = 'primary',
  className
}: InlineLoadingProps) {
  return (
    <div className={cn(
      'flex items-center justify-center space-x-2 py-4',
      className
    )}>
      <Spinner size={spinnerSize} color={spinnerColor} />
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

// Skeleton loading components
interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div 
        className={cn(
          'animate-pulse bg-gray-200 rounded',
          className
        )}
      />
    )
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-gray-200 rounded',
            index === lines - 1 ? 'w-3/4' : 'w-full',
            className
          )}
        />
      ))}
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card p-6 space-y-4', className)}>
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="p-6">
        <Skeleton className="h-4 w-1/4 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className="h-4 flex-1" 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
