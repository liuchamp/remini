import { http } from '@/shared/api/request'

export interface SellerProduct {
  id: string
  title: string
  price: number
  images: string[]
  status: 'on_sale' | 'sold' | 'archived'
  viewCount: number
  likeCount: number
  createdAt: string
}

export interface SellerStats {
  totalProducts: number
  onSaleCount: number
  soldCount: number
  totalEarnings: number
  pendingOffers: number
  pendingShipOrders: number
}

export const sellerApi = {
  getStats() {
    return http.get<SellerStats>('/seller/stats')
  },
  getProducts(params?: { status?: string; page?: number; pageSize?: number }) {
    return http.get<{ list: SellerProduct[]; total: number }>('/seller/products', params)
  },
  updateProductStatus(id: string, status: string) {
    return http.post(`/seller/products/${id}/status`, { status })
  },
  deleteProduct(id: string) {
    return http.delete(`/seller/products/${id}`)
  }
}
