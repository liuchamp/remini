import { create } from 'zustand'
import { kycApi, type KycStatus } from './api'

interface KycState {
  status: KycStatus | null
  loading: boolean
  loadStatus: () => Promise<void>
  verifyPhone: (phone: string, code: string) => Promise<boolean>
  submitIdentity: (params: { frontImageUrl: string; backImageUrl: string; name: string; idNumber: string }) => Promise<boolean>
}

export const useKycStore = create<KycState>()((set) => ({
  status: null,
  loading: false,

  loadStatus: async () => {
    set({ loading: true })
    try {
      const res = await kycApi.getStatus()
      if (res.code === 0) set({ status: res.data })
    } finally {
      set({ loading: false })
    }
  },

  verifyPhone: async (phone, code) => {
    const res = await kycApi.verifyPhone(phone, code)
    if (res.code === 0) {
      set((state) => ({
        status: state.status ? { ...state.status, phoneVerified: true, currentTier: 'L1' } : null
      }))
      return true
    }
    return false
  },

  submitIdentity: async (params) => {
    const res = await kycApi.submitIdentity(params)
    if (res.code === 0) {
      set((state) => ({
        status: state.status ? { ...state.status, identityVerified: true, currentTier: 'L2' } : null
      }))
      return true
    }
    return false
  }
}))
