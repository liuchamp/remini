import { create } from 'zustand'
import { notificationApi } from './api'
import type { Notification } from './types'

interface NotificationState {
  notifications: Notification[]
  activeTab: 'system' | 'transaction' | 'marketing'
  unreadCount: number
  loading: boolean
  polling: boolean
  loadNotifications: (tab: string) => Promise<void>
  loadUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  let pollingTimer: ReturnType<typeof setInterval> | null = null
  
  return {
    notifications: [],
    activeTab: 'system',
    unreadCount: 0,
    loading: false,
    polling: false,
    
    loadNotifications: async (tab) => {
      set({ loading: true, activeTab: tab as NotificationState['activeTab'] })
      try {
        const res = await notificationApi.getNotifications({ type: tab })
        if (res.code === 0) {
          set({ notifications: res.data as Notification[] })
        }
      } finally {
        set({ loading: false })
      }
    },
    
    loadUnreadCount: async () => {
      try {
        const res = await notificationApi.getUnreadCount()
        if (res.code === 0) {
          set({ unreadCount: res.data as number })
        }
      } catch (error) {
        console.error('Failed to load unread count:', error)
      }
    },
    
    markAsRead: async (id) => {
      try {
        await notificationApi.markAsRead(id)
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    },
    
    markAllAsRead: async () => {
      try {
        await notificationApi.markAllAsRead()
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0
        }))
      } catch (error) {
        console.error('Failed to mark all as read:', error)
      }
    },
    
    startPolling: () => {
      if (get().polling) return
      
      // Clear any existing timer before creating a new one
      if (pollingTimer) {
        clearInterval(pollingTimer)
      }
      
      set({ polling: true })
      pollingTimer = setInterval(() => {
        get().loadUnreadCount()
      }, 30000)
    },
    
    stopPolling: () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
      set({ polling: false })
    }
  }
})
