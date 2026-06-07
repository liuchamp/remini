import { http } from '@/shared/api/request'

export interface Offer {
  id: string
  productId: string
  productTitle: string
  productImage: string
  amount: number
  note?: string
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'expired'
  counterAmount?: number
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  createdAt: string
  expiresAt: string
}

export interface CreateOfferRequest {
  productId: string
  amount: number
  note?: string
}

export const offerApi = {
  create(data: CreateOfferRequest) {
    return http.post<Offer>('/offers', data)
  },
  getList(params?: { type?: 'sent' | 'received'; status?: string; page?: number }) {
    return http.get<{ list: Offer[]; total: number }>('/offers', params)
  },
  getDetail(id: string) {
    return http.get<Offer>(`/offers/${id}`)
  },
  accept(id: string) {
    return http.post(`/offers/${id}/accept`)
  },
  reject(id: string) {
    return http.post(`/offers/${id}/reject`)
  },
  counter(id: string, amount: number) {
    return http.post(`/offers/${id}/counter`, { amount })
  },
  withdraw(id: string) {
    return http.post(`/offers/${id}/withdraw`)
  }
}
