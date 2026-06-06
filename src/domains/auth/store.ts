import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { http } from '@/shared/api/request'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean

  login: (code: string) => Promise<void>
  loginByPhone: (phone: string, code: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,

      login: async (code: string) => {
        const res = await http.post<{ user: User; token: string; refreshToken: string }>('/auth/wechat-login', { code })
        if (res.code === 0) {
          const { user, token, refreshToken } = res.data
          set({ user, token, refreshToken, isLoggedIn: true })
        }
      },

      loginByPhone: async (phone: string, code: string) => {
        const res = await http.post<{ user: User; token: string; refreshToken: string }>('/auth/phone-login', { phone, code })
        if (res.code === 0) {
          const { user, token, refreshToken } = res.data
          set({ user, token, refreshToken, isLoggedIn: true })
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isLoggedIn: false })
        Taro.removeStorageSync('auth-storage')
        Taro.reLaunch({ url: '/pages/auth/login/index' })
      },

      updateProfile: (data: Partial<User>) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },

      checkAuth: async () => {
        const { token } = get()
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
        getItem: (name) => {
          const value = Taro.getStorageSync(name)
          return value || null
        },
        setItem: (name, value) => {
          Taro.setStorageSync(name, value)
        },
        removeItem: (name) => {
          Taro.removeStorageSync(name)
        }
      }))
    }
  )
)
