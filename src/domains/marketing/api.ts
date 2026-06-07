import { http } from '@/shared/api/request'

export interface CheckInRecord {
  date: string
  points: number
  streak: number
}

export interface Coupon {
  id: string
  name: string
  discount: number
  minSpend: number
  expiresAt: string
  status: 'active' | 'used' | 'expired'
}

export interface ReferralInfo {
  code: string
  link: string
  totalReferrals: number
  totalRewards: number
  leaderboard: { rank: number; name: string; avatar: string; referrals: number }[]
}

export const marketingApi = {
  checkIn() {
    return http.post<CheckInRecord>('/marketing/checkin')
  },
  getCheckInStatus() {
    return http.get<{ checked: boolean; streak: number; points: number }>('/marketing/checkin/status')
  },
  getPointsBalance() {
    return http.get<{ balance: number; history: { date: string; amount: number; type: string }[] }>('/marketing/points')
  },
  exchangePointsForCoupon(points: number) {
    return http.post('/marketing/points/exchange', { points })
  },
  getCoupons(status?: string) {
    return http.get<Coupon[]>('/marketing/coupons', { status })
  },
  getReferralInfo() {
    return http.get<ReferralInfo>('/marketing/referral')
  },
  generatePoster() {
    return http.get<{ posterUrl: string }>('/marketing/referral/poster')
  }
}
