import { http } from '@/shared/api/request'

export interface NotificationItem {
  id: string
  type: 'system' | 'trade' | 'marketing'
  title: string
  content: string
  preview: string
  isRead: boolean
  link?: string
  createdAt: string
}

export const notificationApi = {
  getList(page?: number) { return http.get('/notifications', { page }) },
  markRead(id: string) { return http.post(`/notifications/${id}/read`) },
  markAllRead() { return http.post('/notifications/read-all') },
  getUnreadCount() { return http.get('/notifications/unread-count') }
}
