import { cn } from '../utils/cn'

interface PriceProps {
  amount: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'
  showCurrency?: boolean
  className?: string
  originalPrice?: number
  showDiscount?: boolean
  discountPercentage?: number
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl'
}

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  gray: 'text-gray-600'
}

export function Price({
  amount,
  currency = 'USD',
  size = 'md',
  color = 'primary',
  showCurrency = true,
  className,
  originalPrice,
  showDiscount = true,
  discountPercentage
}: PriceProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPriceWithoutCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const displayPrice = showCurrency ? formatPrice(amount) : formatPriceWithoutCurrency(amount)
  const hasDiscount = originalPrice && originalPrice > amount
  const calculatedDiscountPercentage = discountPercentage || 
    (hasDiscount ? Math.round(((originalPrice! - amount) / originalPrice!) * 100) : 0)

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className={cn(
        'font-semibold',
        sizeClasses[size],
        colorClasses[color]
      )}>
        {displayPrice}
      </span>
      
      {hasDiscount && showDiscount && (
        <div className="flex items-center space-x-1">
          <span className={cn(
            'line-through text-gray-500',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {showCurrency ? formatPrice(originalPrice!) : formatPriceWithoutCurrency(originalPrice!)}
          </span>
          {calculatedDiscountPercentage > 0 && (
            <span className={cn(
              'bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs font-medium',
              size === 'sm' && 'text-xs px-1 py-0.5'
            )}>
              -{calculatedDiscountPercentage}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Price range component
interface PriceRangeProps {
  minPrice: number
  maxPrice: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'
  showCurrency?: boolean
  className?: string
  separator?: string
}

export function PriceRange({
  minPrice,
  maxPrice,
  currency = 'USD',
  size = 'md',
  color = 'primary',
  showCurrency = true,
  className,
  separator = ' - '
}: PriceRangeProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPriceWithoutCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const displayMinPrice = showCurrency ? formatPrice(minPrice) : formatPriceWithoutCurrency(minPrice)
  const displayMaxPrice = showCurrency ? formatPrice(maxPrice) : formatPriceWithoutCurrency(maxPrice)

  return (
    <span className={cn(
      'font-semibold',
      sizeClasses[size],
      colorClasses[color],
      className
    )}>
      {displayMinPrice}{separator}{displayMaxPrice}
    </span>
  )
}

// Price comparison component
interface PriceComparisonProps {
  currentPrice: number
  originalPrice: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSavings?: boolean
  className?: string
}

export function PriceComparison({
  currentPrice,
  originalPrice,
  currency = 'USD',
  size = 'md',
  showSavings = true,
  className
}: PriceComparisonProps) {
  const savings = originalPrice - currentPrice
  const savingsPercentage = Math.round((savings / originalPrice) * 100)

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center space-x-2">
        <Price
          amount={currentPrice}
          currency={currency}
          size={size}
          color="success"
        />
        <span className={cn(
          'line-through text-gray-500',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {formatPrice(originalPrice)}
        </span>
      </div>
      
      {showSavings && savings > 0 && (
        <div className="flex items-center space-x-1">
          <span className="text-green-600 text-sm font-medium">
            Save {formatPrice(savings)}
          </span>
          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-medium">
            {savingsPercentage}% off
          </span>
        </div>
      )}
    </div>
  )
}

// Price input component
interface PriceInputProps {
  value: number
  onChange: (value: number) => void
  currency?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  error?: string
  label?: string
  className?: string
  showCurrency?: boolean
}

export function PriceInput({
  value,
  onChange,
  currency = 'USD',
  placeholder = '0.00',
  min = 0,
  max,
  step = 0.01,
  disabled = false,
  error,
  label,
  className,
  showCurrency = true
}: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    onChange(newValue)
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {showCurrency && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">
              {currency === 'USD' ? '$' : currency}
            </span>
          </div>
        )}
        
        <input
          type="number"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'input w-full',
            showCurrency && 'pl-8',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

// Price filter component
interface PriceFilterProps {
  minPrice: number
  maxPrice: number
  onMinPriceChange: (value: number) => void
  onMaxPriceChange: (value: number) => void
  currency?: string
  min?: number
  max?: number
  step?: number
  className?: string
  label?: string
}

export function PriceFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  currency = 'USD',
  min = 0,
  max = 1000,
  step = 1,
  className,
  label = 'Price Range'
}: PriceFilterProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-gray-900">{label}</h3>
      
      <div className="space-y-3">
        <PriceInput
          label="Min Price"
          value={minPrice}
          onChange={onMinPriceChange}
          currency={currency}
          min={min}
          max={maxPrice}
          step={step}
        />
        
        <PriceInput
          label="Max Price"
          value={maxPrice}
          onChange={onMaxPriceChange}
          currency={currency}
          min={minPrice}
          max={max}
          step={step}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <Price amount={minPrice} currency={currency} size="sm" />
        <span>-</span>
        <Price amount={maxPrice} currency={currency} size="sm" />
      </div>
    </div>
  )
}

// Price summary component
interface PriceSummaryProps {
  subtotal: number
  tax?: number
  shipping?: number
  discount?: number
  total: number
  currency?: string
  className?: string
  showBreakdown?: boolean
}

export function PriceSummary({
  subtotal,
  tax = 0,
  shipping = 0,
  discount = 0,
  total,
  currency = 'USD',
  className,
  showBreakdown = true
}: PriceSummaryProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {showBreakdown && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">{formatPrice(tax)}</span>
            </div>
          )}
          
          {shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{formatPrice(shipping)}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">-{formatPrice(discount)}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="border-t pt-3">
        <div className="flex justify-between">
          <span className="text-base font-medium text-gray-900">Total</span>
          <Price amount={total} currency={currency} size="lg" color="primary" />
        </div>
      </div>
    </div>
  )
}
