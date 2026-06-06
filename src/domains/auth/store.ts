import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { http } from '@/shared/api/request'

export interface User {
  id: string
  username: string
  avatar: string
  phone: string
  trustScore: number
  currentKycTier: 'L0' | 'L1' | 'L2' | 'L3'
  isVerified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean

  setAuth: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,

      setAuth: (user, token, refreshToken) => {
        set({ user, token, refreshToken, isLoggedIn: true })
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isLoggedIn: false })
        Taro.removeStorageSync('auth-storage')
        Taro.reLaunch({ url: '/pages/auth/login/index' })
      },

      updateUser: (data) => {
        const user = get().user
        if (user) set({ user: { ...user, ...data } })
      },

      checkAuth: async () => {
        const token = get().token
        if (!token) return false
        try {
          const res = await http.get('/auth/verify')
          return res.code === 0
        } catch {
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => Taro.getStorageSync(name) || null,
        setItem: (name, value) => Taro.setStorageSync(name, value),
        removeItem: (name) => Taro.removeStorageSync(name)
      }))
    }
  )
)
