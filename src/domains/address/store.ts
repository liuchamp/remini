import { create } from 'zustand'
import { addressApi, type AddressItem } from './api'

interface AddressState {
  addresses: AddressItem[]
  loading: boolean
  loadList: () => Promise<void>
  remove: (id: string) => Promise<boolean>
  setDefault: (id: string) => Promise<void>
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  loading: false,
  loadList: async () => {
    set({ loading: true })
    try {
      const res = await addressApi.getList()
      if (res.code === 0) set({ addresses: res.data.addresses, loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  remove: async (id) => {
    const res = await addressApi.delete(id)
    if (res.code === 0) {
      set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }))
      return true
    }
    return false
  },
  setDefault: async (id) => {
    await addressApi.setDefault(id)
    get().loadList()
  }
}))
