import { http } from '@/shared/api/request'

export interface ProductListParams {
  page: number
  limit?: number
  categoryId?: string
  keyword?: string
  sort?: 'default' | 'price_asc' | 'price_desc' | 'newest' | 'distance'
  minPrice?: number
  maxPrice?: number
  condition?: string
  latitude?: number
  longitude?: number
  radius?: number
}

export interface FavoriteToggleResult {
  isFavorited: boolean
}

export const productApi = {
  getRecommendations(params: { page: number; limit?: number; tab?: 'recommend' | 'nearby' | 'following' }) {
    return http.get<{ products: Product[]; hasMore: boolean }>('/recommendations/home', params)
  },
  getList(params: ProductListParams) {
    return http.get<{ products: Product[]; total: number; hasMore: boolean }>('/products', params)
  },
  getDetail(id: string) {
    return http.get<Product>(`/products/${id}`)
  },
  search(params: ProductListParams) {
    return http.get<{ products: Product[]; total: number; hasMore: boolean }>('/products/search', params)
  },
  getCategories() {
    return http.get<Category[]>('/categories')
  },
  toggleFavorite(productId: string) {
    return http.post<FavoriteToggleResult>(`/products/${productId}/favorite`)
  },
  getFavorites(page: number = 1) {
    return http.get<{ products: Product[]; hasMore: boolean }>('/user/favorites', { page })
  },
  create(data: {
    title: string
    description: string
    price: number
    condition: string
    categoryId: string
    images: string[]
    isNegotiable: boolean
  }) {
    return http.post<Product>('/products', data)
  },
  update(id: string, data: {
    title?: string
    description?: string
    price?: number
    condition?: string
    categoryId?: string
    images?: string[]
    isNegotiable?: boolean
  }) {
    return http.put<Product>(`/products/${id}`, data)
  }
}
