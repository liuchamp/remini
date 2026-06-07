import { http } from '@/shared/api/request'
import type { CheckinData, CheckinResult, PointsData, PointsRecord, Coupon } from './types'

export const marketingApi = {
  getCheckinData: () => {
    return http.get<CheckinData>('/marketing/checkin')
  },

  checkin: () => {
    return http.post<CheckinResult>('/marketing/checkin')
  },

  getPointsData: () => {
    return http.get<PointsData>('/marketing/points')
  },

  getPointsRecords: (params?: { category?: string; page?: number }) => {
    return http.get<PointsRecord[]>('/marketing/points/records', {
      params: { ...params, pageSize: 20 }
    })
  },

  getCoupons: (params: { status: string; page?: number }) => {
    return http.get<Coupon[]>('/marketing/coupons', {
      params: { ...params, pageSize: 20 }
    })
  },

  useCoupon: (id: string) => {
    return http.post(`/marketing/coupons/${id}/use`)
  },

  exchangeCoupon: (couponId: string) => {
    return http.post(`/marketing/coupons/${couponId}/exchange`)
  },
}
