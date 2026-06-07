import { create } from 'zustand'
import { marketingApi } from './api'
import type { CheckinData, CheckinResult, PointsData, PointsRecord, Coupon } from './types'

interface CheckinState {
  checkinData: CheckinData | null
  loading: boolean
  loadCheckinData: () => Promise<void>
  checkin: () => Promise<CheckinResult | undefined>
}

export const useCheckinStore = create<CheckinState>((set) => ({
  checkinData: null,
  loading: false,

  loadCheckinData: async () => {
    set({ loading: true })
    try {
      const res = await marketingApi.getCheckinData()
      if (res.code === 0) {
        set({ checkinData: res.data as CheckinData })
      }
    } finally {
      set({ loading: false })
    }
  },

  checkin: async () => {
    try {
      const res = await marketingApi.checkin()
      if (res.code === 0) {
        const result = res.data as CheckinResult
        set(state => ({
          checkinData: state.checkinData ? {
            ...state.checkinData,
            todayChecked: true,
            continuousDays: result.continuousDays
          } : null
        }))
        return result
      }
    } catch (error) {
      console.error('Failed to checkin:', error)
      throw error
    }
  }
}))

interface PointsState {
  pointsData: PointsData | null
  records: PointsRecord[]
  loading: boolean
  loadPointsData: () => Promise<void>
  loadRecords: (category?: string) => Promise<void>
}

export const usePointsStore = create<PointsState>((set) => ({
  pointsData: null,
  records: [],
  loading: false,

  loadPointsData: async () => {
    set({ loading: true })
    try {
      const res = await marketingApi.getPointsData()
      if (res.code === 0) {
        set({ pointsData: res.data as PointsData })
      }
    } finally {
      set({ loading: false })
    }
  },

  loadRecords: async (category) => {
    try {
      const res = await marketingApi.getPointsRecords({ category })
      if (res.code === 0) {
        set({ records: res.data as PointsRecord[] })
      }
    } catch (error) {
      console.error('Failed to load records:', error)
    }
  }
}))

interface CouponState {
  coupons: Coupon[]
  activeTab: 'active' | 'used' | 'expired'
  loading: boolean
  loadCoupons: (tab: string) => Promise<void>
  useCoupon: (couponId: string) => Promise<void>
}

export const useCouponStore = create<CouponState>((set) => ({
  coupons: [],
  activeTab: 'active',
  loading: false,

  loadCoupons: async (tab) => {
    set({ loading: true, activeTab: tab as CouponState['activeTab'] })
    try {
      const res = await marketingApi.getCoupons({ status: tab })
      if (res.code === 0) {
        set({ coupons: res.data as Coupon[] })
      }
    } finally {
      set({ loading: false })
    }
  },

  useCoupon: async (couponId) => {
    try {
      await marketingApi.useCoupon(couponId)
      set(state => ({
        coupons: state.coupons.map(coupon =>
          coupon.id === couponId
            ? { ...coupon, status: 'used', usedAt: new Date().toISOString() }
            : coupon
        )
      }))
    } catch (error) {
      console.error('Failed to use coupon:', error)
      throw error
    }
  }
}))
