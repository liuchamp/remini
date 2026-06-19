export interface Address {
  id: string
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  tag?: string
  isDefault: boolean
}