import { create } from 'zustand'
import { productApi, type ProductListParams } from './api'

interface ProductState {
  // Homepage
  recommendProducts: Product[]
  recommendPage: number
  recommendHasMore: boolean

  // Search
  searchResults: Product[]
  searchParams: ProductListParams
  searchHasMore: boolean

  // Categories
  categories: Category[]

  // Detail
  currentProduct: Product | null
  isFavorited: boolean

  // Loading
  loading: boolean
  refreshing: boolean

  // Actions
  loadRecommendations: (refresh?: boolean) => Promise<void>
  searchProducts: (params: ProductListParams, refresh?: boolean) => Promise<void>
  loadCategories: () => Promise<void>
  loadDetail: (id: string) => Promise<void>
  toggleFavorite: (productId: string) => Promise<void>
  clearDetail: () => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  recommendProducts: [],
  recommendPage: 1,
  recommendHasMore: true,
  searchResults: [],
  searchParams: { page: 1 },
  searchHasMore: true,
  categories: [],
  currentProduct: null,
  isFavorited: false,
  loading: false,
  refreshing: false,

  loadRecommendations: async (refresh = false) => {
    const page = refresh ? 1 : get().recommendPage
    set(refresh ? { refreshing: true } : { loading: true })
    try {
      const res = await productApi.getRecommendations({ page, limit: 20 })
      if (res.code === 0) {
        set({
          recommendProducts: refresh ? res.data.products : [...get().recommendProducts, ...res.data.products],
          recommendPage: page + 1,
          recommendHasMore: res.data.hasMore,
          refreshing: false,
          loading: false
        })
      }
    } catch {
      set({ loading: false, refreshing: false })
    }
  },

  searchProducts: async (params, refresh = false) => {
    const page = refresh ? 1 : get().searchParams.page
    set({ loading: true })
    try {
      const res = await productApi.search({ ...params, page })
      if (res.code === 0) {
        set({
          searchResults: refresh ? res.data.products : [...get().searchResults, ...res.data.products],
          searchParams: { ...params, page: page + 1 },
          searchHasMore: res.data.hasMore,
          loading: false
        })
      }
    } catch {
      set({ loading: false })
    }
  },

  loadCategories: async () => {
    try {
      const res = await productApi.getCategories()
      if (res.code === 0) set({ categories: res.data })
    } catch { /* silent */ }
  },

  loadDetail: async (id) => {
    set({ loading: true })
    try {
      const res = await productApi.getDetail(id)
      if (res.code === 0) {
        set({ currentProduct: res.data, loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },

  toggleFavorite: async (productId) => {
    const prev = get().isFavorited
    set({ isFavorited: !prev })
    try {
      const res = await productApi.toggleFavorite(productId)
      if (res.code === 0) set({ isFavorited: res.data.isFavorited })
    } catch {
      set({ isFavorited: prev })
    }
  },

  clearDetail: () => set({ currentProduct: null, isFavorited: false })
}))
