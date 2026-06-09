import { http } from '@/shared/api/request'
import type { Notification, NotificationPreference } from './types'

export const notificationApi = {
  getNotifications: (params: { type: string; page?: number }) => {
    return http.get<Notification[]>('/notifications', {
      params: { ...params, pageSize: 20 }
    })
  },

  getUnreadCount: () => {
    return http.get<number>('/notifications/unread-count')
  },

  markAsRead: (id: string) => {
    return http.post(`/notifications/${id}/read`)
  },

  markAllAsRead: () => {
    return http.post('/notifications/read-all')
  },

  getPreferences: () => {
    return http.get<NotificationPreference>('/notifications/preferences')
  },

  updatePreferences: (data: NotificationPreference) => {
    return http.put<void>('/notifications/preferences', data)
  },

  getDetail: (id: string) => {
    return http.get<Notification>(`/notifications/${id}`)
  },
}
