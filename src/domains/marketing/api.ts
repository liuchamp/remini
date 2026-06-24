import Taro from '@tarojs/taro'

import {
  marketingService,
  type CheckinDay,
  type CommissionRecord as Api2CommissionRecord,
  type Coupon as Api2Coupon,
  type CouponTemplate as Api2CouponTemplate,
  type PointsTransaction,
} from '@/shared/api2'
import type { ApiResponse } from '@/shared/api/request'
import type {
  CheckinData,
  CheckinResult,
  PointsData,
  PointsRecord,
  Coupon,
  ReferralInfo,
  CouponTemplate,
  CommissionData,
  CommissionRecord,
} from './types'

export type { ReferralInfo, CouponTemplate, CommissionData, CommissionRecord, ReferralLeaderboardEntry } from './types'

function ok<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    data,
    message: 'ok',
  }
}

function currentUserId() {
  const storedUser = Taro.getStorageSync('user') as { id?: number | string } | undefined
  const storedUserId = Taro.getStorageSync('userId') as number | string | undefined
  const id = storedUser?.id ?? storedUserId
  const numericId = Number(id)

  return Number.isFinite(numericId) && numericId > 0 ? numericId : 1
}

function calendarDay(date: string | undefined) {
  if (!date) return 0
  const day = Number(date.slice(-2))
  return Number.isFinite(day) ? day : 0
}

function toCheckinDays(calendar: CheckinDay[] | undefined) {
  return (calendar ?? [])
    .filter(day => day.checked)
    .map(day => calendarDay(day.date))
    .filter(day => day > 0)
}

function toPointCategory(description: string | undefined): PointsRecord['category'] {
  const value = (description ?? '').toLowerCase()
  if (value.includes('checkin') || value.includes('签到')) return 'checkin'
  if (value.includes('order') || value.includes('订单')) return 'order'
  if (value.includes('invite') || value.includes('邀请')) return 'invite'
  if (value.includes('exchange') || value.includes('兑换')) return 'exchange'
  return 'other'
}

function toPointsRecord(record: PointsTransaction): PointsRecord {
  return {
    id: String(record.id ?? ''),
    title: record.description ?? '',
    points: record.amount ?? 0,
    category: toPointCategory(record.description),
    createdAt: record.createdAt ?? '',
  }
}

function toCouponType(typeOrDiscount: string | number | undefined): Coupon['type'] {
  if (typeOrDiscount === 'discount') return '折扣'
  if (typeOrDiscount === 'threshold' || typeOrDiscount === 'amount') return '满减'
  if (typeOrDiscount === 'cash') return '无门槛'
  return '满减'
}

function toCouponStatus(coupon: Api2Coupon): Coupon['status'] {
  if (coupon.used) return 'used'
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) return 'expired'
  return 'active'
}

function toCoupon(coupon: Api2Coupon): Coupon {
  return {
    id: String(coupon.id ?? ''),
    title: '优惠券',
    type: toCouponType(coupon.discount),
    value: coupon.discount ?? 0,
    minSpend: 0,
    startTime: '',
    endTime: coupon.expiresAt ?? '',
    status: toCouponStatus(coupon),
    usedAt: coupon.usedAt,
  }
}

function toCouponTemplate(template: Api2CouponTemplate): CouponTemplate {
  return {
    id: String(template.id ?? ''),
    name: template.name ?? '',
    type: toCouponType(template.type),
    discount: template.discount ?? 0,
    minAmount: template.minAmount ?? 0,
    remaining: template.remainingStock ?? 0,
    total: template.totalStock ?? 0,
    expiresAt: template.expiresAt ?? '',
  }
}

function toCommissionStatus(status: string | undefined): CommissionRecord['status'] {
  if (status === 'settled' || status === 'cancelled' || status === 'pending') return status
  return 'pending'
}

function toCommissionRecord(record: Api2CommissionRecord): CommissionRecord {
  return {
    id: String(record.id ?? ''),
    orderId: String(record.orderId ?? ''),
    productName: '',
    amount: record.amount ?? 0,
    status: toCommissionStatus(record.status),
    createdAt: record.createdAt ?? '',
  }
}

export const marketingApi = {
  async getCheckinData() {
    const res = await marketingService.GetCheckinData({})
    return ok<CheckinData>({
      checkinDays: toCheckinDays(res.calendar),
      continuousDays: res.continuousDays ?? 0,
      todayChecked: res.checkedToday ?? false,
      rewards: {
        base: res.todayPoints ?? 0,
        continuous: 0,
      },
    })
  },

  async checkin() {
    const res = await marketingService.Checkin({})
    const points = res.pointsAwarded ?? 0
    return ok<CheckinResult>({
      points,
      continuousDays: res.continuousDays ?? 0,
      rewards: {
        base: points,
        continuous: 0,
      },
    })
  },

  async getPointsData() {
    const res = await marketingService.GetPoints({ userId: currentUserId() })
    return ok<PointsData>({
      totalPoints: res.account?.balance ?? 0,
      todayEarned: 0,
      monthEarned: 0,
    })
  },

  async getPointsRecords(params?: { category?: string; page?: number }) {
    const res = await marketingService.ListPointsRecords({
      page: params?.page,
      pageSize: 20,
      type: params?.category,
    })
    return ok<PointsRecord[]>((res.records ?? []).map(toPointsRecord))
  },

  async getCoupons(params: { status: string; page?: number }) {
    const res = await marketingService.ListUserCoupons({
      userId: currentUserId(),
      includeUsed: params.status !== 'active',
    })
    const coupons = (res.coupons ?? [])
      .map(toCoupon)
      .filter(coupon => params.status === 'all' || coupon.status === params.status)
    return ok<Coupon[]>(coupons)
  },

  async useCoupon(id: string) {
    const res = await marketingService.UseCoupon({
      couponId: Number(id),
      userId: currentUserId(),
      orderAmount: undefined,
    })
    return ok({ success: res.success ?? false, discount: res.discount ?? 0 })
  },

  async exchangeCoupon(couponId: string) {
    const res = await marketingService.ExchangeCoupon({ couponTemplateId: Number(couponId) })
    return ok(res.coupon ? toCoupon(res.coupon) : undefined)
  },

  async getReferralInfo() {
    const res = await marketingService.GetReferralInfo({})
    const totalRewards = (res.pointsEarned ?? 0) + (res.commissionEarned ?? 0)
    const code = res.referral?.code ?? ''
    return ok<ReferralInfo>({
      code,
      link: code ? `/pages/auth/register/index?ref=${code}` : '',
      totalReferrals: res.invitedUsers ?? res.referral?.useCount ?? 0,
      totalRewards,
      leaderboard: [],
    })
  },

  async claimCoupon(couponTemplateId: string) {
    await marketingService.ClaimCoupon({ couponTemplateId: Number(couponTemplateId) })
    return ok<void>(undefined)
  },

  async getCouponTemplates() {
    const res = await marketingService.ListCouponTemplates({
      page: undefined,
      pageSize: undefined,
      scene: undefined,
    })
    return ok<CouponTemplate[]>((res.templates ?? []).map(toCouponTemplate))
  },

  async getCommissionData() {
    const res = await marketingService.GetCommissionData({})
    const availableCommission = res.availableAmount ?? 0
    const monthlyEstimate = res.pendingAmount ?? 0
    return ok<CommissionData>({
      totalCommission: availableCommission + monthlyEstimate + (res.settledAmount ?? 0),
      availableCommission,
      monthlyEstimate,
      records: (res.records ?? []).map(toCommissionRecord),
    })
  },
}
