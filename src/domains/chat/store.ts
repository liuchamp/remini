import { create } from 'zustand'
import { wsManager } from '@/shared/api/websocket'
import { chatApi } from './api'

interface ChatState {
  threads: ChatThread[]
  messages: ChatMessage[]
  unreadTotal: number
  loading: boolean
  blocking: boolean
  pinnedThreads: string[]

  loadThreads: () => Promise<void>
  loadMessages: (threadId: string) => Promise<void>
  sendMessage: (threadId: string, content: string, type?: string) => void
  connect: (url: string, token: string) => void
  disconnect: () => void
  blockUser: (userId: string) => Promise<void>
  unblockUser: (userId: string) => Promise<void>
  deleteThread: (id: string) => Promise<void>
  pinThread: (id: string, pinned: boolean) => Promise<void>
  sendReadReceipt: (threadId: string, messageIds: string[]) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  messages: [],
  unreadTotal: 0,
  loading: false,
  blocking: false,
  pinnedThreads: [],

  loadThreads: async () => {
    const res = await chatApi.getThreads()
    if (res.code === 0) {
      set({
        threads: res.data,
        unreadTotal: (res.data as any[]).reduce((s: number, t: any) => s + (t.unreadCount || 0), 0)
      })
    }
  },

  loadMessages: async (threadId) => {
    set({ loading: true })
    const res = await chatApi.getMessages(threadId)
    if (res.code === 0) set({ messages: res.data, loading: false })
    else set({ loading: false })
  },

  sendMessage: (threadId, content, type = 'text') => {
    wsManager.send({ type: 'send_message', payload: { threadId, content, messageType: type } })
  },

  connect: (url, token) => {
    wsManager.connect(url, token)
    wsManager.on('new_message', (data: any) => {
      set({ messages: [...get().messages, data] })
      get().loadThreads()
    })
  },

  disconnect: () => wsManager.disconnect(),

  blockUser: async (userId) => {
    set({ blocking: true })
    try {
      await chatApi.blockUser(userId)
      const threads = get().threads.map(t =>
        t.participant.id === userId ? { ...t, isBlocked: true } : t
      )
      set({ threads })
    } finally {
      set({ blocking: false })
    }
  },

  unblockUser: async (userId) => {
    set({ blocking: true })
    try {
      await chatApi.unblockUser(userId)
      const threads = get().threads.map(t =>
        t.participant.id === userId ? { ...t, isBlocked: false } : t
      )
      set({ threads })
    } finally {
      set({ blocking: false })
    }
  },

  deleteThread: async (id) => {
    await chatApi.deleteThread(id)
    set((s) => ({ threads: s.threads.filter((t) => t.id !== id) }))
  },

  pinThread: async (id, pinned) => {
    await chatApi.pinThread(id, pinned)
    set((s) => ({
      pinnedThreads: pinned
        ? [...s.pinnedThreads, id]
        : s.pinnedThreads.filter((t) => t !== id),
    }))
  },

  sendReadReceipt: async (threadId, messageIds) => {
    await chatApi.sendReadReceipt(threadId, messageIds)
  }
}))
