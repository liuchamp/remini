export interface Notification {
  id: string
  type: 'system' | 'transaction' | 'marketing' | 'interaction'
  title: string
  content: string
  isRead: boolean
  createdAt: string
  link?: string
}

export interface NotificationPreference {
  system: boolean
  transaction: boolean
  marketing: boolean
  interaction: boolean
}
