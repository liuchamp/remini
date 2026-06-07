import { http } from '@/shared/api/request'

export interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  time: string
}

export interface TrackingInfo {
  orderId: string
  shippingId: string
  company: string
  trackingNumber: string
  status: string
  events: TrackingEvent[]
}

export interface CreateShippingParams {
  orderId: string
  trackingNumber: string
  company: string
}

export const shippingApi = {
  getTracking(orderId: string) {
    return http.get<TrackingInfo>(`/shipping/${orderId}`)
  },
  createShipping(data: CreateShippingParams) {
    return http.post<{ id: string }>('/shipping', data)
  }
}
