import { create } from 'zustand'
import { ShippingTracking } from './types'

interface ShippingState {
  currentTracking: ShippingTracking | null
  isLoading: boolean
  setCurrentTracking: (data: ShippingTracking) => void
  setLoading: (loading: boolean) => void
}

export const useShippingStore = create<ShippingState>((set) => ({
  currentTracking: null,
  isLoading: false,
  setCurrentTracking: (data) => set({ currentTracking: data }),
  setLoading: (loading) => set({ isLoading: loading })
}))
