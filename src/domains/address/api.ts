import { logisticsService, type Address as Api2Address } from '@/shared/api2'
import type { ApiResponse } from '@/shared/api/request'

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

function ok<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    data,
    message: 'ok',
  }
}

function toAddressItem(address: Api2Address): AddressItem {
  return {
    id: String(address.id ?? ''),
    recipient: address.recipient ?? '',
    phone: address.phone ?? '',
    province: address.province ?? '',
    city: address.city ?? '',
    district: address.district ?? '',
    detail: address.detail ?? '',
    isDefault: address.isDefault ?? false,
    label: address.label,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  }
}

function toAddressId(id: string) {
  return Number(id)
}

export const addressApi = {
  async getList() {
    const res = await logisticsService.ListAddresses({})
    const addresses = (res.addresses ?? []).map(toAddressItem)
    return ok<AddressListResult>({
      addresses,
      total: addresses.length,
    })
  },
  async getDetail(id: string) {
    const res = await logisticsService.GetAddress({ id: toAddressId(id) })
    return ok(toAddressItem(res.address!))
  },
  async create(data: AddressInput) {
    const res = await logisticsService.CreateAddress({
      label: data.label,
      recipient: data.recipient,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      detail: data.detail,
      isDefault: data.isDefault,
    })
    return ok(toAddressItem(res.address!))
  },
  async update(id: string, data: Partial<AddressInput>) {
    const res = await logisticsService.UpdateAddress({
      id: toAddressId(id),
      label: data.label,
      recipient: data.recipient,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      detail: data.detail,
      isDefault: data.isDefault,
    })
    return ok(toAddressItem(res.address!))
  },
  async delete(id: string) {
    const res = await logisticsService.DeleteAddress({ id: toAddressId(id) })
    return ok({ success: res.success ?? false })
  },
  async setDefault(id: string) {
    const res = await logisticsService.SetDefaultAddress({ id: toAddressId(id) })
    return ok(res.address ? toAddressItem(res.address) : undefined)
  }
}
