import { notificationService, type Notification as Api2Notification, type PreferenceItem } from '@/shared/api2'
import type { ApiResponse } from '@/shared/api/request'
import type { Notification, NotificationPreference } from './types'

type NotificationType = Notification['type']

function ok<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    data,
    message: 'ok',
  }
}

function toNotificationId(id: string) {
  return Number(id)
}

function toNotificationType(type: string | undefined): NotificationType {
  if (type === 'system' || type === 'transaction' || type === 'marketing' || type === 'interaction') {
    return type
  }

  return 'system'
}

function toNotificationLink(notification: Api2Notification) {
  if (!notification.targetType || notification.targetId === undefined || notification.targetId === null) {
    return undefined
  }

  if (notification.targetType === 'order') {
    return `/pages/order/detail/index?id=${notification.targetId}`
  }

  if (notification.targetType === 'product') {
    return `/pages/product/detail/index?id=${notification.targetId}`
  }

  if (notification.targetType === 'post') {
    return `/pages/community/post/index?id=${notification.targetId}`
  }

  return undefined
}

function toNotification(notification: Api2Notification): Notification {
  return {
    id: String(notification.id ?? ''),
    type: toNotificationType(notification.type),
    title: notification.title ?? '',
    content: notification.content ?? '',
    isRead: notification.isRead ?? false,
    createdAt: notification.createdAt ?? '',
    link: toNotificationLink(notification),
  }
}

function toPreferences(items: PreferenceItem[] | undefined): NotificationPreference {
  const preferences: NotificationPreference = {
    system: true,
    transaction: true,
    marketing: true,
    interaction: true,
  }

  for (const item of items ?? []) {
    const type = item.type
    if (type === 'system' || type === 'transaction' || type === 'marketing' || type === 'interaction') {
      preferences[type] = item.enabled ?? false
    }
  }

  return preferences
}

function toPreferenceItems(preferences: NotificationPreference): PreferenceItem[] {
  return [
    { type: 'system', channel: 'in_app', enabled: preferences.system },
    { type: 'transaction', channel: 'in_app', enabled: preferences.transaction },
    { type: 'marketing', channel: 'in_app', enabled: preferences.marketing },
    { type: 'interaction', channel: 'in_app', enabled: preferences.interaction },
  ]
}

export const notificationApi = {
  getNotifications: async (params: { type: string; page?: number }) => {
    const res = await notificationService.ListNotifications({
      userId: undefined,
      page: params.page,
      pageSize: 20,
      unreadOnly: undefined,
    })
    const notifications = (res.notifications ?? [])
      .map(toNotification)
      .filter(notification => params.type === 'all' || notification.type === params.type)
    return ok(notifications)
  },

  getUnreadCount: async () => {
    const res = await notificationService.GetUnreadCount({})
    return ok(res.count ?? 0)
  },

  markAsRead: async (id: string) => {
    const res = await notificationService.MarkRead({ id: toNotificationId(id) })
    return ok({ success: res.success ?? false })
  },

  markAllAsRead: async () => {
    const res = await notificationService.MarkAllRead({ userId: undefined })
    return ok({ success: res.success ?? false })
  },

  getPreferences: async () => {
    const res = await notificationService.GetPreferences({ userId: undefined })
    return ok(toPreferences(res.preferences))
  },

  updatePreferences: async (data: NotificationPreference) => {
    await notificationService.UpdatePreferences({
      userId: undefined,
      preferences: toPreferenceItems(data),
    })
    return ok<void>(undefined)
  },

  getDetail: async (id: string) => {
    const res = await notificationService.GetNotification({ id: toNotificationId(id) })
    return ok(toNotification(res.notification!))
  },
}
