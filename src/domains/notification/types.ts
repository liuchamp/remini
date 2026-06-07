export interface Notification {
  id: string
  type: 'system' | 'transaction' | 'marketing'
  title: string
  content: string
  isRead: boolean
  createdAt: string
  link?: string
}
