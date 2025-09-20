import { useState, useRef, useEffect } from 'react'
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  showFilters?: boolean
  showSort?: boolean
  sortOptions?: Array<{
    value: string
    label: string
  }>
  sortValue?: string
  onSortChange?: (value: string) => void
  sortDirection?: 'asc' | 'desc'
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void
  filterOptions?: Array<{
    value: string
    label: string
  }>
  filterValue?: string
  onFilterChange?: (value: string) => void
  className?: string
  disabled?: boolean
  autoFocus?: boolean
  debounceMs?: number
}

export function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  onClear,
  showFilters = false,
  showSort = false,
  sortOptions = [],
  sortValue = '',
  onSortChange,
  sortDirection = 'asc',
  onSortDirectionChange,
  filterOptions = [],
  filterValue = '',
  onFilterChange,
  className = '',
  disabled = false,
  autoFocus = false,
  debounceMs = 300
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced onChange effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onChange(internalValue)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [internalValue, onChange, debounceMs])

  // Sync external value changes
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }

  const handleClear = () => {
    setInternalValue('')
    onChange('')
    onClear?.()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  const toggleSortDirection = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    onSortDirectionChange?.(newDirection)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={internalValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-10 input w-full"
          />
          {internalValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {showFilters && filterOptions.length > 0 && (
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`btn btn-outline flex items-center space-x-2 ${
                filterValue ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onFilterChange?.('')
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      !filterValue ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onFilterChange?.(option.value)
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filterValue === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort Dropdown */}
        {showSort && sortOptions.length > 0 && (
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="btn btn-outline flex items-center space-x-2"
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              <span>Sort</span>
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange?.(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                        sortValue === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortValue === option.value && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSortDirection()
                          }}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {sortDirection === 'asc' ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(filterValue || sortValue) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filterValue && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Filter: {filterOptions.find(opt => opt.value === filterValue)?.label || filterValue}
              <button
                onClick={() => onFilterChange?.('')}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sortValue && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Sort: {sortOptions.find(opt => opt.value === sortValue)?.label || sortValue} ({sortDirection})
              <button
                onClick={() => onSortChange?.('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Hook for using SearchInput with state management
export function useSearchInput(initialValue = '', debounceMs = 300) {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, debounceMs])

  return {
    value,
    setValue,
    debouncedValue,
    clear: () => setValue('')
  }
}
