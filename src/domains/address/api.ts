import { http } from '@/shared/api/request'

export interface AddressItem {
  id: string
  recipient: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  label?: string
  createdAt?: string
  updatedAt?: string
}

export interface AddressListResult {
  addresses: AddressItem[]
  total: number
}

export interface AddressInput {
  recipient: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  label?: string
}

export const addressApi = {
  getList() {
    return http.get<AddressListResult>('/addresses')
  },
  getDetail(id: string) {
    return http.get<AddressItem>(`/addresses/${id}`)
  },
  create(data: AddressInput) {
    return http.post<AddressItem>('/addresses', data)
  },
  update(id: string, data: Partial<AddressInput>) {
    return http.put<AddressItem>(`/addresses/${id}`, data)
  },
  delete(id: string) {
    return http.delete(`/addresses/${id}`)
  },
  setDefault(id: string) {
    return http.put(`/addresses/${id}`, { isDefault: true })
  }
}
