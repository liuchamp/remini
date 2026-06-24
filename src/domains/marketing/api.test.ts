import { beforeEach, describe, expect, it, vi } from 'vitest'

import { marketingApi } from './api'

const {
  getStorageSyncMock,
  getCheckinDataMock,
  checkinMock,
  getPointsMock,
  listPointsRecordsMock,
  listUserCouponsMock,
  useCouponMock,
  exchangeCouponMock,
  getReferralInfoMock,
  claimCouponMock,
  listCouponTemplatesMock,
  getCommissionDataMock,
} = vi.hoisted(() => ({
  getStorageSyncMock: vi.fn(),
  getCheckinDataMock: vi.fn(),
  checkinMock: vi.fn(),
  getPointsMock: vi.fn(),
  listPointsRecordsMock: vi.fn(),
  listUserCouponsMock: vi.fn(),
  useCouponMock: vi.fn(),
  exchangeCouponMock: vi.fn(),
  getReferralInfoMock: vi.fn(),
  claimCouponMock: vi.fn(),
  listCouponTemplatesMock: vi.fn(),
  getCommissionDataMock: vi.fn(),
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: getStorageSyncMock,
  },
}))

vi.mock('@/shared/api/request', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/shared/api2', () => ({
  marketingService: {
    GetCheckinData: getCheckinDataMock,
    Checkin: checkinMock,
    GetPoints: getPointsMock,
    ListPointsRecords: listPointsRecordsMock,
    ListUserCoupons: listUserCouponsMock,
    UseCoupon: useCouponMock,
    ExchangeCoupon: exchangeCouponMock,
    GetReferralInfo: getReferralInfoMock,
    ClaimCoupon: claimCouponMock,
    ListCouponTemplates: listCouponTemplatesMock,
    GetCommissionData: getCommissionDataMock,
  },
}))

describe('marketingApi', () => {
  beforeEach(() => {
    getStorageSyncMock.mockReset()
    getCheckinDataMock.mockReset()
    checkinMock.mockReset()
    getPointsMock.mockReset()
    listPointsRecordsMock.mockReset()
    listUserCouponsMock.mockReset()
    useCouponMock.mockReset()
    exchangeCouponMock.mockReset()
    getReferralInfoMock.mockReset()
    claimCouponMock.mockReset()
    listCouponTemplatesMock.mockReset()
    getCommissionDataMock.mockReset()
  })

  it('maps checkin and points responses to the legacy shapes', async () => {
    getStorageSyncMock.mockReturnValue({ id: 12 })
    getCheckinDataMock.mockResolvedValue({
      checkedToday: true,
      continuousDays: 4,
      todayPoints: 15,
      calendar: [
        { date: '2026-06-01', checked: true, points: 5 },
        { date: '2026-06-02', checked: false, points: 0 },
      ],
    })
    checkinMock.mockResolvedValue({ pointsAwarded: 20, continuousDays: 5 })
    getPointsMock.mockResolvedValue({ account: { balance: 99 } })

    await expect(marketingApi.getCheckinData()).resolves.toEqual({
      code: 0,
      message: 'ok',
      data: {
        checkinDays: [1],
        continuousDays: 4,
        todayChecked: true,
        rewards: { base: 15, continuous: 0 },
      },
    })
    await expect(marketingApi.checkin()).resolves.toEqual({
      code: 0,
      message: 'ok',
      data: {
        points: 20,
        continuousDays: 5,
        rewards: { base: 20, continuous: 0 },
      },
    })
    await expect(marketingApi.getPointsData()).resolves.toEqual({
      code: 0,
      message: 'ok',
      data: {
        totalPoints: 99,
        todayEarned: 0,
        monthEarned: 0,
      },
    })
    expect(getPointsMock).toHaveBeenCalledWith({ userId: 12 })
  })

  it('maps records, coupons, referral, templates, and commission responses', async () => {
    getStorageSyncMock.mockReturnValue({ id: 12 })
    listPointsRecordsMock.mockResolvedValue({
      records: [{ id: 1, amount: 8, description: 'Daily checkin', createdAt: '2026-06-24' }],
    })
    listUserCouponsMock.mockResolvedValue({
      coupons: [{ id: 2, discount: 10, used: false, expiresAt: '2026-07-01' }],
    })
    useCouponMock.mockResolvedValue({ success: true })
    exchangeCouponMock.mockResolvedValue({ coupon: { id: 3 } })
    claimCouponMock.mockResolvedValue({ coupon: { id: 4 } })
    listCouponTemplatesMock.mockResolvedValue({
      templates: [{ id: 5, name: 'Ten off', type: 'amount', discount: 10, minAmount: 50, remainingStock: 3, totalStock: 10, expiresAt: '2026-08-01' }],
    })
    getReferralInfoMock.mockResolvedValue({
      referral: { code: 'ABC', useCount: 2 },
      invitedUsers: 2,
      pointsEarned: 30,
      commissionEarned: 12,
    })
    getCommissionDataMock.mockResolvedValue({
      availableAmount: 12,
      pendingAmount: 5,
      settledAmount: 20,
      records: [{ id: 6, orderId: 7, amount: 3, status: 'settled', createdAt: '2026-06-24' }],
    })

    await expect(marketingApi.getPointsRecords({ category: 'checkin', page: 2 })).resolves.toMatchObject({
      data: [{ id: '1', title: 'Daily checkin', points: 8, category: 'checkin' }],
    })
    await expect(marketingApi.getCoupons({ status: 'active', page: 1 })).resolves.toMatchObject({
      data: [{ id: '2', title: '优惠券', value: 10, status: 'active' }],
    })
    await expect(marketingApi.useCoupon('2')).resolves.toMatchObject({ data: { success: true } })
    await expect(marketingApi.exchangeCoupon('3')).resolves.toMatchObject({ data: { id: '3' } })
    await expect(marketingApi.claimCoupon('4')).resolves.toMatchObject({ data: undefined })
    await expect(marketingApi.getCouponTemplates()).resolves.toMatchObject({
      data: [{ id: '5', name: 'Ten off', discount: 10, remaining: 3, total: 10 }],
    })
    await expect(marketingApi.getReferralInfo()).resolves.toMatchObject({
      data: { code: 'ABC', totalReferrals: 2, totalRewards: 42 },
    })
    await expect(marketingApi.getCommissionData()).resolves.toMatchObject({
      data: {
        totalCommission: 37,
        availableCommission: 12,
        monthlyEstimate: 5,
        records: [{ id: '6', orderId: '7', amount: 3, status: 'settled' }],
      },
    })
  })
})
