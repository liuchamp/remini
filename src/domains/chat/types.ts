export interface ChatMessage {
  id: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'product' | 'order' | 'system'
  isRead: boolean
  readAt?: string
  createdAt: string
  product?: ProductBrief
  order?: Order
}