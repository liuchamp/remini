import { create } from 'zustand'
import { notificationApi, NotificationItem } from './api'

interface NotificationState {
  list: NotificationItem[]
  unreadCount: number
  loading: boolean
  loadList: (page?: number) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  loadUnreadCount: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  list: [],
  unreadCount: 0,
  loading: false,

  loadList: async (page?: number) => {
    set({ loading: true })
    const res = await notificationApi.getList(page)
    if (res.code === 0) {
      const list = res.data as NotificationItem[]
      set({
        list,
        unreadCount: list.filter(n => !n.isRead).length,
        loading: false
      })
    } else {
      set({ loading: false })
    }
  },

  markRead: async (id: string) => {
    const res = await notificationApi.markRead(id)
    if (res.code === 0) {
      const list = get().list.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
      set({
        list,
        unreadCount: list.filter(n => !n.isRead).length
      })
    }
  },

  markAllRead: async () => {
    const res = await notificationApi.markAllRead()
    if (res.code === 0) {
      const list = get().list.map(n => ({ ...n, isRead: true }))
      set({ list, unreadCount: 0 })
    }
  },

  loadUnreadCount: async () => {
    const res = await notificationApi.getUnreadCount()
    if (res.code === 0) set({ unreadCount: res.data as number })
  }
}))
