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
