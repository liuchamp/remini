import type { MockRoute } from '../mock-interceptor'

const dashboardStats = {
  totalUsers: 12580,
  totalProducts: 3842,
  totalOrders: 8956,
  totalRevenue: 567890.50,
  pendingProducts: 12,
  pendingWithdrawals: 5,
}

const orderTrend = [
  { label: 'Mon', value: 45 },
  { label: 'Tue', value: 62 },
  { label: 'Wed', value: 38 },
  { label: 'Thu', value: 71 },
  { label: 'Fri', value: 55 },
  { label: 'Sat', value: 89 },
  { label: 'Sun', value: 76 },
]

const revenueTrend = [
  { label: 'Mon', value: 3200 },
  { label: 'Tue', value: 4500 },
  { label: 'Wed', value: 2800 },
  { label: 'Thu', value: 5100 },
  { label: 'Fri', value: 3900 },
  { label: 'Sat', value: 6200 },
  { label: 'Sun', value: 5500 },
]

const recentActivities = [
  { id: 'a1', type: 'user_register', content: 'New user registered: user_8821', createdAt: '2026-06-10T09:15:00Z' },
  { id: 'a2', type: 'product_created', content: 'New product listed: iPhone 15 Pro Max', createdAt: '2026-06-10T08:42:00Z' },
  { id: 'a3', type: 'order_placed', content: 'Order #20260610001 placed', createdAt: '2026-06-10T08:30:00Z' },
  { id: 'a4', type: 'withdraw_request', content: 'Withdrawal request: ¥1,200.00', createdAt: '2026-06-10T07:55:00Z' },
  { id: 'a5', type: 'user_register', content: 'New user registered: tech_fan_99', createdAt: '2026-06-10T07:20:00Z' },
]

const mockUsers = [
  { id: 'u1', username: 'alice_wonder', phone: '138****1234', status: 'active', productCount: 12, orderCount: 34, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'u2', username: 'bob_builder', phone: '139****5678', status: 'active', productCount: 5, orderCount: 18, createdAt: '2026-02-20T14:30:00Z' },
  { id: 'u3', username: 'spam_king', phone: '137****9012', status: 'banned', productCount: 0, orderCount: 2, createdAt: '2026-03-05T08:00:00Z' },
]

const mockPendingProducts = [
  { id: 'p1', title: 'iPhone 15 Pro Max 256GB', price: 8999, sellerName: 'alice_wonder', images: ['/static/products/iphone15.jpg'], createdAt: '2026-06-09T16:00:00Z' },
  { id: 'p2', title: 'MacBook Air M3', price: 9499, sellerName: 'bob_builder', images: ['/static/products/macbook.jpg'], createdAt: '2026-06-09T14:30:00Z' },
]

const mockWithdrawals = [
  { id: 'w1', userId: 'u1', username: 'alice_wonder', amount: 1200, status: 'pending', createdAt: '2026-06-10T07:55:00Z' },
  { id: 'w2', userId: 'u2', username: 'bob_builder', amount: 500, status: 'pending', createdAt: '2026-06-09T18:00:00Z' },
]

const mockDisputes = [
  { id: 'd1', orderId: 'o1', buyerName: 'alice_wonder', sellerName: 'bob_builder', reason: 'Item not as described', status: 'pending', createdAt: '2026-06-08T10:00:00Z' },
]

export const adminMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/admin\/dashboard$/,
    handler: () => ({
      code: 0,
      data: {
        stats: dashboardStats,
        recentActivities,
        orderTrend,
        revenueTrend,
      },
      message: 'ok',
    }),
  },
  {
    method: 'GET',
    urlPattern: /\/admin\/users$/,
    handler: () => ({
      code: 0,
      data: { list: mockUsers, total: mockUsers.length },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/users\/\w+\/ban$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/users\/\w+\/unban$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/admin\/products\/pending$/,
    handler: () => ({
      code: 0,
      data: { list: mockPendingProducts, total: mockPendingProducts.length },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/products\/\w+\/approve$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/products\/\w+\/reject$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/admin\/withdrawals$/,
    handler: () => ({
      code: 0,
      data: { list: mockWithdrawals, total: mockWithdrawals.length },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/withdrawals\/\w+\/approve$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/withdrawals\/\w+\/reject$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/admin\/disputes$/,
    handler: () => ({
      code: 0,
      data: { list: mockDisputes, total: mockDisputes.length },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/admin\/disputes\/\w+\/resolve$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
