import { http } from '@/shared/api/request'

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RegisterRequest {
  username: string
  password: string
  phone: string
  code: string
  referralCode?: string
}

export const authApi = {
  code2session(platform: 'weapp' | 'alipay', code: string) {
    return http.post<LoginResponse>('/auth/code2session', { platform, code })
  },
  loginByPhone(phone: string, code: string, deviceFingerprint?: string) {
    return http.post<LoginResponse>('/auth/login-by-phone', { phone, code, deviceFingerprint })
  },
  sendCode(phone: string) {
    return http.post<{ cooldown: number }>('/auth/send-code', { phone })
  },
  register(data: RegisterRequest) {
    return http.post<LoginResponse>('/auth/register', data)
  },
  logout() {
    return http.post('/auth/logout')
  },
  verify() {
    return http.get<User>('/auth/verify')
  },
  refresh(refreshToken: string) {
    return http.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken })
  }
}
