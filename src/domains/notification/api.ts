import { http } from '@/shared/api/request'
import type { Notification } from './types'

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
}
