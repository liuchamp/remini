import { useAuthStore } from '@/domains/auth/store'
import Taro from '@tarojs/taro'

export function useAuth() {
  const { user, isLoggedIn, logout } = useAuthStore()

  const requireAuth = (): boolean => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/auth/login/index' })
      return false
    }
    return true
  }

  const requireKycTier = (tier: 'L1' | 'L2' | 'L3'): boolean => {
    if (!requireAuth()) return false
    const userTier = user?.currentKycTier || 'L0'
    const tierOrder = ['L0', 'L1', 'L2', 'L3'] as const
    const idx = tierOrder.indexOf(userTier)
    const requiredIdx = tierOrder.indexOf(tier)
    if (idx < requiredIdx) {
      Taro.navigateTo({ url: '/pages/kyc/index/index' })
      return false
    }
    return true
  }

  return { user, isLoggedIn, logout, requireAuth, requireKycTier }
}
