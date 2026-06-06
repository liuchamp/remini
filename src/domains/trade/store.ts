import { create } from 'zustand'
import { tradeApi } from './api'

interface TradeState {
  orders: any[]
  currentOrder: any | null
  loading: boolean
  loadOrders: (status?: string, page?: number) => Promise<void>
  loadOrderDetail: (id: string) => Promise<void>
  clearOrder: () => void
}

export const useTradeStore = create<TradeState>((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  loadOrders: async (status?, page = 1) => {
    set({ loading: true })
    try {
      const res = await tradeApi.getOrderList(status, page)
      if (res.code === 0) set({ orders: res.data.orders, loading: false })
    } catch { set({ loading: false }) }
  },

  loadOrderDetail: async (id) => {
    set({ loading: true })
    try {
      const res = await tradeApi.getOrderDetail(id)
      if (res.code === 0) set({ currentOrder: res.data, loading: false })
    } catch { set({ loading: false }) }
  },

  clearOrder: () => set({ currentOrder: null })
}))
