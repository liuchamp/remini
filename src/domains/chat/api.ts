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
  },

  sendReadReceipt(threadId: string, messageIds: string[]) {
    return http.post<void>(`/threads/${threadId}/read-receipt`, { messageIds })
  },

  deleteThread(id: string) {
    return http.delete<void>(`/threads/${id}`)
  },

  pinThread(id: string, pinned: boolean) {
    return http.post<void>(`/threads/${id}/pin`, { pinned })
  }
}
