import { http } from '@/shared/api/request'

export const chatApi = {
  getThreads() {
    return http.get<ChatThread[]>('/threads')
  },

  getMessages(threadId: string, page?: number) {
    return http.get<ChatMessage[]>(`/threads/${threadId}/messages`, { page })
  },

  markRead(threadId: string) {
    return http.post(`/threads/${threadId}/read`)
  },

  blockUser(userId: string) {
    return http.post('/blocks', { userId })
  },

  unblockUser(userId: string) {
    return http.delete('/blocks', { userId })
  }
}
