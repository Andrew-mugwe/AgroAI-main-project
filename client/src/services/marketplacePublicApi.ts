// Flow14.1.1
import { apiClient } from './apiClient'

export interface PublicProduct {
  id: string
  seller_id: string
  title: string
  description: string
  category: string
  price_cents: number
  currency: string
  stock: number
  images: string[]
  created_at: string
  updated_at: string
  seller_name?: string
  seller_verified?: boolean
  seller_rating?: number
  seller_reviews_count?: number
}

export interface ListParams {
  page?: number
  limit?: number
  category?: string
  min_price?: number
  max_price?: number
  q?: string
  seller_id?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
}

export async function listProducts(params: ListParams = {}): Promise<{ items: PublicProduct[]; meta: { page: number; limit: number; total: number } }> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  })
  return apiClient.get(`/marketplace/products?${qs.toString()}`)
}

export async function getProduct(id: string): Promise<PublicProduct> {
  return apiClient.get(`/marketplace/products/${id}`)
}

export async function listCategories(): Promise<{ items: string[] }> {
  return apiClient.get('/marketplace/categories')
}


