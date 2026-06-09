import type { MockRoute } from '../mock-interceptor'

export const marketingMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/marketing\/referral\/info$/,
    handler: () => ({
      code: 0,
      data: {
        code: 'USER2026',
        link: 'https://remx.com/invite?code=USER2026',
        totalReferrals: 12,
        totalRewards: 360,
        leaderboard: [
          { rank: 1, name: '用户A', avatar: '/static/avatars/a.jpg', referrals: 45 },
          { rank: 2, name: '用户B', avatar: '/static/avatars/b.jpg', referrals: 32 },
        ],
      },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/marketing\/coupons\/claim$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/marketing\/coupons\/templates$/,
    handler: () => ({
      code: 0,
      data: [
        { id: 'ct1', name: '新人专享', type: '满减', discount: 20, minAmount: 100, remaining: 50, total: 200, expiresAt: '2026-12-31' },
        { id: 'ct2', name: '限时折扣', type: '折扣', discount: 8, minAmount: 50, remaining: 0, total: 100, expiresAt: '2026-07-01' },
      ],
      message: 'ok',
    }),
  },
  {
    method: 'GET',
    urlPattern: /\/marketing\/commission$/,
    handler: () => ({
      code: 0,
      data: {
        totalCommission: 2580.5,
        availableCommission: 1200,
        monthlyEstimate: 450,
        records: [
          { id: 'cr1', orderId: 'ORD001', productName: '二手iPhone 15', amount: 35, status: 'settled', createdAt: '2026-06-01' },
          { id: 'cr2', orderId: 'ORD002', productName: '机械键盘', amount: 18, status: 'pending', createdAt: '2026-06-05' },
        ],
      },
      message: 'ok',
    }),
  },
]
