import { create } from 'zustand'
import { sellerApi, type SellerProduct, type SellerStats } from './api'

interface SellerState {
  stats: SellerStats | null
  products: SellerProduct[]
  loading: boolean
  loadStats: () => Promise<void>
  loadProducts: (params?: { status?: string }) => Promise<void>
}

export const useSellerStore = create<SellerState>()((set) => ({
  stats: null,
  products: [],
  loading: false,

  loadStats: async () => {
    const res = await sellerApi.getStats()
    if (res.code === 0) set({ stats: res.data })
  },

  loadProducts: async (params) => {
    set({ loading: true })
    try {
      const res = await sellerApi.getProducts(params)
      if (res.code === 0) set({ products: res.data.list })
    } finally {
      set({ loading: false })
    }
  }
}))
