import { create } from 'zustand'
import { wsManager } from '@/shared/api/websocket'
import { chatApi } from './api'

interface ChatState {
  threads: ChatThread[]
  messages: ChatMessage[]
  unreadTotal: number
  loading: boolean

  loadThreads: () => Promise<void>
  loadMessages: (threadId: string) => Promise<void>
  sendMessage: (threadId: string, content: string, type?: string) => void
  connect: (url: string, token: string) => void
  disconnect: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  messages: [],
  unreadTotal: 0,
  loading: false,

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

  disconnect: () => wsManager.disconnect()
}))
