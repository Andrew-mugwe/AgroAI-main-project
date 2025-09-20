import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Types
interface SearchFilter {
  id: string
  name: string
  value: any
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean'
  options?: { label: string; value: any }[]
}

interface SearchSort {
  field: string
  direction: 'asc' | 'desc'
  label: string
}

interface SearchResult<T = any> {
  id: string
  data: T
  score?: number
  highlights?: string[]
}

interface SearchState {
  query: string
  results: SearchResult[]
  filters: SearchFilter[]
  sort: SearchSort | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
  searchHistory: string[]
  recentSearches: string[]
  suggestions: string[]
  isSearching: boolean
  searchDebounceMs: number
}

interface SearchContextType<T = any> extends SearchState {
  search: (query: string) => Promise<void>
  setQuery: (query: string) => void
  addFilter: (filter: SearchFilter) => void
  removeFilter: (filterId: string) => void
  updateFilter: (filterId: string, value: any) => void
  clearFilters: () => void
  setSort: (sort: SearchSort) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  clearSearch: () => void
  getSuggestions: (query: string) => Promise<string[]>
  addToHistory: (query: string) => void
  clearHistory: () => void
  clearError: () => void
  setSearchDebounce: (ms: number) => void
}

// Action Types
type SearchAction<T = any> =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_RESULTS'; payload: SearchResult<T>[] }
  | { type: 'ADD_FILTER'; payload: SearchFilter }
  | { type: 'REMOVE_FILTER'; payload: string }
  | { type: 'UPDATE_FILTER'; payload: { id: string; value: any } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: SearchSort }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LIMIT'; payload: number }
  | { type: 'SET_PAGINATION'; payload: { page: number; limit: number; total: number; totalPages: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_SUGGESTIONS'; payload: string[] }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_DEBOUNCE'; payload: number }
  | { type: 'CLEAR_SEARCH' }

// Initial State
const initialState: SearchState = {
  query: '',
  results: [],
  filters: [],
  sort: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null,
  searchHistory: [],
  recentSearches: [],
  suggestions: [],
  isSearching: false,
  searchDebounceMs: 300
}

// Reducer
function searchReducer<T = any>(state: SearchState, action: SearchAction<T>): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload
      }
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        isLoading: false,
        isSearching: false
      }
    
    case 'ADD_FILTER': {
      const existingFilterIndex = state.filters.findIndex(f => f.id === action.payload.id)
      if (existingFilterIndex >= 0) {
        const updatedFilters = [...state.filters]
        updatedFilters[existingFilterIndex] = action.payload
        return { ...state, filters: updatedFilters }
      }
      return {
        ...state,
        filters: [...state.filters, action.payload]
      }
    }
    
    case 'REMOVE_FILTER':
      return {
        ...state,
        filters: state.filters.filter(f => f.id !== action.payload)
      }
    
    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: state.filters.map(f =>
          f.id === action.payload.id
            ? { ...f, value: action.payload.value }
            : f
        )
      }
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: []
      }
    
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload
      }
    
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload
        }
      }
    
    case 'SET_LIMIT':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          limit: action.payload,
          page: 1 // Reset to first page when changing limit
        }
      }
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: action.payload
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSearching: false
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    case 'ADD_TO_HISTORY': {
      const newHistory = [action.payload, ...state.searchHistory.filter(q => q !== action.payload)].slice(0, 10)
      return {
        ...state,
        searchHistory: newHistory,
        recentSearches: newHistory.slice(0, 5)
      }
    }
    
    case 'CLEAR_HISTORY':
      return {
        ...state,
        searchHistory: [],
        recentSearches: []
      }
    
    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: action.payload
      }
    
    case 'SET_SEARCHING':
      return {
        ...state,
        isSearching: action.payload
      }
    
    case 'SET_DEBOUNCE':
      return {
        ...state,
        searchDebounceMs: action.payload
      }
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        query: '',
        results: [],
        filters: [],
        sort: null,
        pagination: {
          ...state.pagination,
          page: 1,
          total: 0,
          totalPages: 0
        },
        error: null,
        suggestions: []
      }
    
    default:
      return state
  }
}

// Create Context
const SearchContext = createContext<SearchContextType | undefined>(undefined)

// Provider Component
interface SearchProviderProps {
  children: ReactNode
  searchEndpoint?: string
  suggestionsEndpoint?: string
  defaultFilters?: SearchFilter[]
  defaultSort?: SearchSort
}

export function SearchProvider({ 
  children, 
  searchEndpoint = '/api/search',
  suggestionsEndpoint = '/api/search/suggestions',
  defaultFilters = [],
  defaultSort
}: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, {
    ...initialState,
    filters: defaultFilters,
    sort: defaultSort || null
  })

  // Load search history from localStorage on mount
  useEffect(() => {
    const loadSearchHistory = () => {
      try {
        const savedHistory = localStorage.getItem('search_history')
        if (savedHistory) {
          const history = JSON.parse(savedHistory)
          dispatch({ type: 'ADD_TO_HISTORY', payload: history[0] || '' })
        }
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }

    loadSearchHistory()
  }, [])

  // Save search history to localStorage
  useEffect(() => {
    if (state.searchHistory.length > 0) {
      localStorage.setItem('search_history', JSON.stringify(state.searchHistory))
    }
  }, [state.searchHistory])

  // Debounced search effect
  useEffect(() => {
    if (!state.query.trim()) {
      dispatch({ type: 'SET_RESULTS', payload: [] })
      return
    }

    const timeoutId = setTimeout(() => {
      if (state.query.trim()) {
        performSearch(state.query)
      }
    }, state.searchDebounceMs)

    return () => clearTimeout(timeoutId)
  }, [state.query, state.filters, state.sort, state.pagination.page, state.pagination.limit])

  // API Functions
  const performSearch = async (query: string) => {
    try {
      dispatch({ type: 'SET_SEARCHING', payload: true })
      dispatch({ type: 'SET_LOADING', payload: true })

      const searchParams = new URLSearchParams({
        q: query,
        page: state.pagination.page.toString(),
        limit: state.pagination.limit.toString()
      })

      // Add filters to search params
      state.filters.forEach(filter => {
        if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
          if (Array.isArray(filter.value)) {
            filter.value.forEach(v => searchParams.append(`filter.${filter.name}`, v))
          } else {
            searchParams.append(`filter.${filter.name}`, filter.value.toString())
          }
        }
      })

      // Add sort to search params
      if (state.sort) {
        searchParams.append('sort', state.sort.field)
        searchParams.append('order', state.sort.direction)
      }

      const response = await fetch(`${searchEndpoint}?${searchParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Search failed')
      }

      dispatch({ type: 'SET_RESULTS', payload: data.results })
      dispatch({ 
        type: 'SET_PAGINATION', 
        payload: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      })

      // Add to search history
      if (query.trim()) {
        dispatch({ type: 'ADD_TO_HISTORY', payload: query.trim() })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }

  const search = async (query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query })
  }

  const setQuery = (query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query })
  }

  const addFilter = (filter: SearchFilter) => {
    dispatch({ type: 'ADD_FILTER', payload: filter })
  }

  const removeFilter = (filterId: string) => {
    dispatch({ type: 'REMOVE_FILTER', payload: filterId })
  }

  const updateFilter = (filterId: string, value: any) => {
    dispatch({ type: 'UPDATE_FILTER', payload: { id: filterId, value } })
  }

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }

  const setSort = (sort: SearchSort) => {
    dispatch({ type: 'SET_SORT', payload: sort })
  }

  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page })
  }

  const setLimit = (limit: number) => {
    dispatch({ type: 'SET_LIMIT', payload: limit })
  }

  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' })
  }

  const getSuggestions = async (query: string): Promise<string[]> => {
    try {
      if (!query.trim()) {
        dispatch({ type: 'SET_SUGGESTIONS', payload: [] })
        return []
      }

      const response = await fetch(`${suggestionsEndpoint}?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (response.ok) {
        dispatch({ type: 'SET_SUGGESTIONS', payload: data.suggestions })
        return data.suggestions
      }

      return []
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      return []
    }
  }

  const addToHistory = (query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_TO_HISTORY', payload: query.trim() })
    }
  }

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' })
    localStorage.removeItem('search_history')
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const setSearchDebounce = (ms: number) => {
    dispatch({ type: 'SET_DEBOUNCE', payload: ms })
  }

  const value: SearchContextType = {
    ...state,
    search,
    setQuery,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setSort,
    setPage,
    setLimit,
    clearSearch,
    getSuggestions,
    addToHistory,
    clearHistory,
    clearError,
    setSearchDebounce
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

// Custom Hook
export function useSearch<T = any>() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context as SearchContextType<T>
}

// Utility Hooks
export function useSearchFilters() {
  const { filters, addFilter, removeFilter, updateFilter, clearFilters } = useSearch()
  
  return {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasActiveFilters: filters.some(f => f.value !== null && f.value !== undefined && f.value !== '')
  }
}

export function useSearchPagination() {
  const { pagination, setPage, setLimit } = useSearch()
  
  return {
    ...pagination,
    setPage,
    setLimit,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1
  }
}

export function useSearchHistory() {
  const { searchHistory, recentSearches, addToHistory, clearHistory } = useSearch()
  
  return {
    searchHistory,
    recentSearches,
    addToHistory,
    clearHistory
  }
}
