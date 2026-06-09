import { http } from '@/shared/api/request'
import type { ReviewData, AppendReviewData } from './types'

export interface CreateOrderRequest {
  productId: string
  addressId: string
  offerId?: string
  couponId?: string
  pointsUsed?: number
  note?: string
}

export interface PaymentParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

export const tradeApi = {
  createOrder(data: CreateOrderRequest) {
    return http.post('/orders', data)
  },
  getOrderList(status?: string, page: number = 1) {
    return http.get<{ orders: any[]; total: number; hasMore: boolean }>('/orders', { status, page })
  },
  getOrderDetail(id: string) {
    return http.get(`/orders/${id}`)
  },
  getPaymentParams(orderId: string) {
    return http.post<PaymentParams>(`/orders/${orderId}/pay`)
  },
  confirmOrder(orderId: string) {
    return http.post(`/orders/${orderId}/confirm`)
  },
  cancelOrder(orderId: string, reason?: string) {
    return http.post(`/orders/${orderId}/cancel`, { reason })
  },
  requestRefund(orderId: string, reason: string) {
    return http.post(`/orders/${orderId}/refund`, { reason })
  },
  submitReview(orderId: string, data: ReviewData) {
    return http.post<void>(`/orders/${orderId}/review`, data)
  },
  appendReview(orderId: string, data: AppendReviewData) {
    return http.post<void>(`/orders/${orderId}/review/append`, data)
  }
}
