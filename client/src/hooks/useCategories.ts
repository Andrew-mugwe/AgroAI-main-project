import { useState, useEffect, useCallback } from 'react'

// Types
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
  level: number
  sortOrder: number
  isActive: boolean
  productCount?: number
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  description?: string
  image?: File | string
  parentId?: string
  sortOrder: number
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
}

interface CategoryFilters {
  search?: string
  parentId?: string
  isActive?: boolean
  level?: number
  sortBy?: 'name' | 'sortOrder' | 'createdAt' | 'productCount'
  sortOrder?: 'asc' | 'desc'
}

interface CategoryState {
  categories: Category[]
  categoryTree: Category[]
  selectedCategory: Category | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  filters: CategoryFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseCategoriesReturn extends CategoryState {
  // CRUD Operations
  fetchCategories: (filters?: CategoryFilters) => Promise<void>
  fetchCategory: (id: string) => Promise<Category | null>
  createCategory: (data: CategoryFormData) => Promise<Category>
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  
  // Tree Operations
  buildCategoryTree: (categories: Category[]) => Category[]
  getCategoryPath: (categoryId: string) => Category[]
  getCategoryChildren: (parentId: string) => Category[]
  getCategoryAncestors: (categoryId: string) => Category[]
  
  // Utility Functions
  setSelectedCategory: (category: Category | null) => void
  setFilters: (filters: Partial<CategoryFilters>) => void
  clearFilters: () => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  clearError: () => void
  
  // Validation
  validateCategory: (data: CategoryFormData) => string[]
  generateSlug: (name: string, parentId?: string) => string
  
  // Search and Filter
  searchCategories: (query: string) => Category[]
  filterCategories: (filters: CategoryFilters) => Category[]
}

// Initial State
const initialState: CategoryState = {
  categories: [],
  categoryTree: [],
  selectedCategory: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    sortBy: 'sortOrder',
    sortOrder: 'asc'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
}

export function useCategories(): UseCategoriesReturn {
  const [state, setState] = useState<CategoryState>(initialState)

  // API Base URL
  const API_BASE = '/api/categories'

  // Helper function to update state
  const updateState = useCallback((updates: Partial<CategoryState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Fetch all categories
  const fetchCategories = useCallback(async (filters?: CategoryFilters) => {
    try {
      updateState({ isLoading: true, error: null })

      const searchParams = new URLSearchParams()
      
      // Add pagination
      searchParams.append('page', state.pagination.page.toString())
      searchParams.append('limit', state.pagination.limit.toString())
      
      // Add filters
      const activeFilters = { ...state.filters, ...filters }
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${API_BASE}?${searchParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories')
      }

      const categories = data.categories || []
      const categoryTree = buildCategoryTree(categories)

      updateState({
        categories,
        categoryTree,
        pagination: data.pagination || state.pagination,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
      updateState({ error: errorMessage, isLoading: false })
    }
  }, [state.filters, state.pagination.page, state.pagination.limit, updateState])

  // Fetch single category
  const fetchCategory = useCallback(async (id: string): Promise<Category | null> => {
    try {
      updateState({ isLoading: true, error: null })

      const response = await fetch(`${API_BASE}/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch category')
      }

      updateState({ selectedCategory: data.category, isLoading: false })
      return data.category
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category'
      updateState({ error: errorMessage, isLoading: false })
      return null
    }
  }, [updateState])

  // Create category
  const createCategory = useCallback(async (data: CategoryFormData): Promise<Category> => {
    try {
      updateState({ isCreating: true, error: null })

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value)
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      const response = await fetch(API_BASE, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create category')
      }

      // Refresh categories list
      await fetchCategories()

      updateState({ isCreating: false })
      return result.category
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category'
      updateState({ error: errorMessage, isCreating: false })
      throw error
    }
  }, [fetchCategories, updateState])

  // Update category
  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    try {
      updateState({ isUpdating: true, error: null })

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value)
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update category')
      }

      // Update local state
      const updatedCategories = state.categories.map(cat =>
        cat.id === id ? { ...cat, ...result.category } : cat
      )
      const updatedTree = buildCategoryTree(updatedCategories)

      updateState({
        categories: updatedCategories,
        categoryTree: updatedTree,
        selectedCategory: state.selectedCategory?.id === id ? result.category : state.selectedCategory,
        isUpdating: false
      })

      return result.category
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category'
      updateState({ error: errorMessage, isUpdating: false })
      throw error
    }
  }, [state.categories, state.selectedCategory, updateState])

  // Delete category
  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      updateState({ isDeleting: true, error: null })

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete category')
      }

      // Remove from local state
      const updatedCategories = state.categories.filter(cat => cat.id !== id)
      const updatedTree = buildCategoryTree(updatedCategories)

      updateState({
        categories: updatedCategories,
        categoryTree: updatedTree,
        selectedCategory: state.selectedCategory?.id === id ? null : state.selectedCategory,
        isDeleting: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
      updateState({ error: errorMessage, isDeleting: false })
      throw error
    }
  }, [state.categories, state.selectedCategory, updateState])

  // Build category tree from flat array
  const buildCategoryTree = useCallback((categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Build tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    // Sort categories at each level
    const sortCategories = (cats: Category[]): Category[] => {
      return cats
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(cat => ({
          ...cat,
          children: cat.children ? sortCategories(cat.children) : []
        }))
    }

    return sortCategories(rootCategories)
  }, [])

  // Get category path (breadcrumb)
  const getCategoryPath = useCallback((categoryId: string): Category[] => {
    const path: Category[] = []
    const categoryMap = new Map(state.categories.map(cat => [cat.id, cat]))
    
    let currentId = categoryId
    while (currentId) {
      const category = categoryMap.get(currentId)
      if (!category) break
      
      path.unshift(category)
      currentId = category.parentId || ''
    }
    
    return path
  }, [state.categories])

  // Get category children
  const getCategoryChildren = useCallback((parentId: string): Category[] => {
    return state.categories.filter(cat => cat.parentId === parentId)
  }, [state.categories])

  // Get category ancestors
  const getCategoryAncestors = useCallback((categoryId: string): Category[] => {
    const ancestors: Category[] = []
    const categoryMap = new Map(state.categories.map(cat => [cat.id, cat]))
    
    let currentId = categoryId
    while (currentId) {
      const category = categoryMap.get(currentId)
      if (!category) break
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          ancestors.unshift(parent)
          currentId = parent.id
        } else {
          break
        }
      } else {
        break
      }
    }
    
    return ancestors
  }, [state.categories])

  // Set selected category
  const setSelectedCategory = useCallback((category: Category | null) => {
    updateState({ selectedCategory: category })
  }, [updateState])

  // Set filters
  const setFilters = useCallback((filters: Partial<CategoryFilters>) => {
    updateState({ 
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }
    })
  }, [state.filters, state.pagination, updateState])

  // Clear filters
  const clearFilters = useCallback(() => {
    updateState({ 
      filters: { sortBy: 'sortOrder', sortOrder: 'asc' },
      pagination: { ...state.pagination, page: 1 }
    })
  }, [state.pagination, updateState])

  // Set page
  const setPage = useCallback((page: number) => {
    updateState({ pagination: { ...state.pagination, page } })
  }, [state.pagination, updateState])

  // Set limit
  const setLimit = useCallback((limit: number) => {
    updateState({ 
      pagination: { ...state.pagination, limit, page: 1 }
    })
  }, [state.pagination, updateState])

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // Validate category data
  const validateCategory = useCallback((data: CategoryFormData): string[] => {
    const errors: string[] = []

    if (!data.name.trim()) {
      errors.push('Category name is required')
    }

    if (data.name.length > 100) {
      errors.push('Category name must be less than 100 characters')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    if (data.sortOrder < 0) {
      errors.push('Sort order must be a positive number')
    }

    if (data.tags && data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed')
    }

    return errors
  }, [])

  // Generate slug from name
  const generateSlug = useCallback((name: string, parentId?: string): string => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    if (parentId) {
      const parent = state.categories.find(cat => cat.id === parentId)
      if (parent) {
        return `${parent.slug}/${baseSlug}`
      }
    }

    return baseSlug
  }, [state.categories])

  // Search categories
  const searchCategories = useCallback((query: string): Category[] => {
    if (!query.trim()) return state.categories

    const searchTerm = query.toLowerCase()
    return state.categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm) ||
      category.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }, [state.categories])

  // Filter categories
  const filterCategories = useCallback((filters: CategoryFilters): Category[] => {
    let filtered = [...state.categories]

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.parentId !== undefined) {
      filtered = filtered.filter(category => category.parentId === filters.parentId)
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(category => category.isActive === filters.isActive)
    }

    if (filters.level !== undefined) {
      filtered = filtered.filter(category => category.level === filters.level)
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy!]
        const bValue = b[filters.sortBy!]
        
        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [state.categories])

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    ...state,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    buildCategoryTree,
    getCategoryPath,
    getCategoryChildren,
    getCategoryAncestors,
    setSelectedCategory,
    setFilters,
    clearFilters,
    setPage,
    setLimit,
    clearError,
    validateCategory,
    generateSlug,
    searchCategories,
    filterCategories
  }
}
