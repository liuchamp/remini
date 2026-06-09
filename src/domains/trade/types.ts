export type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunding' | 'refunded' | 'disputed'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  shipped: '待收货',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
  disputed: '争议中'
}

export interface ReviewTag {
  id: string
  label: string
}

export interface ReviewData {
  rating: number
  tags: string[]
  content: string
  images: string[]
}

export interface AppendReviewData {
  content: string
  images: string[]
}

export const REVIEW_TAGS: ReviewTag[] = [
  { id: 't1', label: '成色好' },
  { id: 't2', label: '发货快' },
  { id: 't3', label: '包装好' },
  { id: 't4', label: '描述准确' },
  { id: 't5', label: '性价比高' },
  { id: 't6', label: '卖家靠谱' },
]

export const RATING_LABELS: Record<number, string> = {
  1: '非常不满意',
  2: '不满意',
  3: '一般',
  4: '满意',
  5: '非常满意',
}
