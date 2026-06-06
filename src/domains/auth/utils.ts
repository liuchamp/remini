import Taro from '@tarojs/taro'
import { http } from '@/shared/api/request'

const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH: 'refreshToken',
  USER: 'user'
}

let refreshPromise: Promise<boolean> | null = null

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = new Promise(async (resolve) => {
    try {
      const refreshToken = Taro.getStorageSync(STORAGE_KEYS.REFRESH)
      if (!refreshToken) { resolve(false); return }

      const res = await http.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken })
      if (res.code === 0) {
        Taro.setStorageSync(STORAGE_KEYS.TOKEN, res.data.token)
        Taro.setStorageSync(STORAGE_KEYS.REFRESH, res.data.refreshToken)
        resolve(true)
      } else {
        resolve(false)
      }
    } catch {
      resolve(false)
    } finally {
      refreshPromise = null
    }
  })

  return refreshPromise
}
