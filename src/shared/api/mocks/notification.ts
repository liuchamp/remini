import type { MockRoute } from '../mock-interceptor'
import type { Notification, NotificationPreference } from '@/domains/notification/types'

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'system',
    title: '系统维护通知',
    content: '平台将于2024年3月15日凌晨2:00-4:00进行系统维护，届时部分功能可能暂时不可用。',
    isRead: false,
    createdAt: '2024-03-14 18:00',
  },
  {
    id: 'n2',
    type: 'system',
    title: '版本更新',
    content: '新版本已发布，新增多项实用功能，请前往应用商店更新。',
    isRead: true,
    createdAt: '2024-03-10 10:00',
  },
  {
    id: 'n3',
    type: 'transaction',
    title: '订单已发货',
    content: '您的订单 ORD-2024031201 已发货，快递单号：SF1234567890。',
    isRead: false,
    createdAt: '2024-03-12 14:30',
    link: '/pages/logistics/track/index?orderId=ORD-2024031201',
  },
  {
    id: 'n4',
    type: 'transaction',
    title: '退款成功',
    content: '您的退款申请已通过，退款金额 ¥128.00 将在3个工作日内退回您的账户。',
    isRead: true,
    createdAt: '2024-03-11 09:15',
  },
  {
    id: 'n5',
    type: 'marketing',
    title: '限时优惠',
    content: '春季大促来袭！全场数码产品低至5折，活动截止3月20日。',
    isRead: false,
    createdAt: '2024-03-13 12:00',
    link: '/pages/product/search/index?tag=spring-sale',
  },
  {
    id: 'n6',
    type: 'interaction',
    title: '有人评论了你的商品',
    content: '用户"数码达人"对你的商品"二手 MacBook Pro"发表了评论。',
    isRead: false,
    createdAt: '2024-03-13 16:45',
    link: '/pages/product/detail/index?id=p1',
  },
  {
    id: 'n7',
    type: 'interaction',
    title: '新增粉丝',
    content: '用户"小明"关注了你。',
    isRead: true,
    createdAt: '2024-03-09 08:20',
  },
]

const defaultPreferences: NotificationPreference = {
  system: true,
  transaction: true,
  marketing: true,
  interaction: true,
}

let currentPreferences = { ...defaultPreferences }

export const notificationMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/notifications\/unread-count$/,
    handler: () => ({
      code: 0,
      data: mockNotifications.filter((n) => !n.isRead).length,
      message: 'ok',
    }),
  },
  {
    method: 'GET',
    urlPattern: /\/notifications\/preferences$/,
    handler: () => ({
      code: 0,
      data: currentPreferences,
      message: 'ok',
    }),
  },
  {
    method: 'PUT',
    urlPattern: /\/notifications\/preferences$/,
    handler: (_url, data) => {
      currentPreferences = { ...data }
      return { code: 0, data: null, message: 'ok' }
    },
  },
  {
    method: 'GET',
    urlPattern: /\/notifications\/[^/]+$/,
    handler: (url) => {
      const id = url.match(/\/notifications\/([^/?]+)/)?.[1]
      const notification = mockNotifications.find((n) => n.id === id)
      if (notification) {
        return { code: 0, data: notification, message: 'ok' }
      }
      return { code: 404, data: null, message: '通知不存在' }
    },
  },
  {
    method: 'GET',
    urlPattern: /\/notifications$/,
    handler: (url) => {
      const typeMatch = url.match(/type=([^&]+)/)
      const type = typeMatch ? typeMatch[1] : ''
      const filtered = type
        ? mockNotifications.filter((n) => n.type === type)
        : mockNotifications
      return { code: 0, data: filtered, message: 'ok' }
    },
  },
  {
    method: 'POST',
    urlPattern: /\/notifications\/[^/]+\/read$/,
    handler: (url) => {
      const id = url.match(/\/notifications\/([^/]+)\/read/)?.[1]
      const notification = mockNotifications.find((n) => n.id === id)
      if (notification) {
        notification.isRead = true
      }
      return { code: 0, data: null, message: 'ok' }
    },
  },
  {
    method: 'POST',
    urlPattern: /\/notifications\/read-all$/,
    handler: () => {
      mockNotifications.forEach((n) => {
        n.isRead = true
      })
      return { code: 0, data: null, message: 'ok' }
    },
  },
]
