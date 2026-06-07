import { create } from 'zustand'
import { marketingApi, type Coupon, type ReferralInfo } from './api'

interface MarketingState {
  checkInStreak: number
  pointsBalance: number
  coupons: Coupon[]
  referralInfo: ReferralInfo | null
  loading: boolean
  checkIn: () => Promise<void>
  loadPoints: () => Promise<void>
  loadCoupons: (status?: string) => Promise<void>
  loadReferralInfo: () => Promise<void>
}

export const useMarketingStore = create<MarketingState>()((set) => ({
  checkInStreak: 0,
  pointsBalance: 0,
  coupons: [],
  referralInfo: null,
  loading: false,

  checkIn: async () => {
    const res = await marketingApi.checkIn()
    if (res.code === 0) {
      set({ checkInStreak: res.data.streak })
    }
  },

  loadPoints: async () => {
    const res = await marketingApi.getPointsBalance()
    if (res.code === 0) set({ pointsBalance: res.data.balance })
  },

  loadCoupons: async (status) => {
    set({ loading: true })
    try {
      const res = await marketingApi.getCoupons(status)
      if (res.code === 0) set({ coupons: res.data })
    } finally {
      set({ loading: false })
    }
  },

  loadReferralInfo: async () => {
    const res = await marketingApi.getReferralInfo()
    if (res.code === 0) set({ referralInfo: res.data })
  }
}))
