import Taro from '@tarojs/taro'
import { findMock } from './mock-interceptor'

const API_BASE_URL = process.env.TARO_ENV === 'h5'
  ? '/api'
  : 'https://api.remx.com'

const MOCK_ENABLED = process.env.MOCK_ENABLED !== 'false'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  params?: Record<string, any>
  showLoading?: boolean
  retry?: number
  timeout?: number
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>

// 2FA 风控请求暂存与重放机制
let pendingRequest: {
  config: RequestConfig
  resolve: (value: any) => void
  reject: (reason: any) => void
} | null = null

export const getPendingRequest = () => pendingRequest
export const clearPendingRequest = () => { pendingRequest = null }
export const resolvePendingRequest = (res: any) => {
  if (pendingRequest) {
    pendingRequest.resolve(res)
    clearPendingRequest()
  }
}
export const rejectPendingRequest = (err: any) => {
  if (pendingRequest) {
    pendingRequest.reject(err)
    clearPendingRequest()
  }
}

class HttpClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private refreshPromise: Promise<boolean> | null = null

  constructor() {
    // Default request interceptors
    this.requestInterceptors.push(this.tokenInjector.bind(this))
    this.requestInterceptors.push(this.platformSigner.bind(this))

    // Default response interceptors
    this.responseInterceptors.push(this.tokenRefresher.bind(this))
    this.responseInterceptors.push(this.errorNormalizer.bind(this))
    this.responseInterceptors.push(this.riskInterceptor.bind(this))
  }

  private tokenInjector(config: RequestConfig): RequestConfig {
    const token = Taro.getStorageSync('token')
    if (token) {
      config.data = {
        ...config.data,
        _token: token
      }
    }
    return config
  }

  private platformSigner(config: RequestConfig): RequestConfig {
    config.data = {
      ...config.data,
      _platform: process.env.TARO_ENV || 'weapp',
      _clientType: 'miniapp'
    }
    return config
  }

  private async tokenRefresher(response: ApiResponse): Promise<ApiResponse> {
    if (response.code === 401) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Token refreshed, retry original request
        return response
      } else {
        Taro.reLaunch({ url: '/pages/auth/login/index' })
        throw new Error('Token expired')
      }
    }
    return response
  }

  private errorNormalizer(response: ApiResponse): ApiResponse {
    if (response.code !== 0 && response.code !== 200) {
      Taro.showToast({ title: response.message || '请求失败', icon: 'none' })
    }
    return response
  }

  private async riskInterceptor(response: ApiResponse): Promise<ApiResponse> {
    if (response.code === 412) {
      // 412: 需要进行 2FA 挑战验证
      Taro.showToast({ title: '安全验证', icon: 'none' })

      // 返回一个未决的 Promise，在 2FA 成功后再 resolve
      return new Promise((resolve, reject) => {
        pendingRequest = {
          config: (response as any).config || {},
          resolve,
          reject
        }
        Taro.navigateTo({ url: '/pages/auth/challenge/index' })
      })
    }
    if (response.code === 403) {
      // 403: 风控阻断
      Taro.showModal({
        title: '交易被拦截',
        content: response.message || '由于账户或操作风险，交易已被风控系统拦截。',
        showCancel: false
      })
      throw new Error(response.message || 'Blocked by risk engine')
    }
    return response
  }

  private async refreshToken(): Promise<boolean> {
    // Prevent concurrent refreshes
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = new Promise(async (resolve) => {
      try {
        const refreshToken = Taro.getStorageSync('refreshToken')
        if (!refreshToken) {
          resolve(false)
          return
        }

        const res = await Taro.request({
          url: `${API_BASE_URL}/auth/refresh`,
          method: 'POST',
          data: { refreshToken },
          header: { 'Content-Type': 'application/json' }
        })

        if (res.data.code === 0) {
          Taro.setStorageSync('token', res.data.data.token)
          Taro.setStorageSync('refreshToken', res.data.data.refreshToken)
          resolve(true)
        } else {
          resolve(false)
        }
      } catch {
        resolve(false)
      } finally {
        this.refreshPromise = null
      }
    })

    return this.refreshPromise
  }

  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    // Process request interceptors
    let processedConfig = { ...config }
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    if (processedConfig.showLoading) {
      Taro.showLoading({ title: '加载中...' })
    }

    try {
      const url = `${API_BASE_URL}${processedConfig.url}`
      const method = processedConfig.method || 'GET'

      if (MOCK_ENABLED) {
        const mockResult = findMock(method, url, processedConfig.data || processedConfig.params)
        if (mockResult) {
          if (processedConfig.showLoading) {
            Taro.hideLoading()
          }
          return Promise.resolve(mockResult as ApiResponse<T>)
        }
      }

      const token = Taro.getStorageSync('token')

      const res = await Taro.request({
        url,
        method,
        data: processedConfig.method === 'GET' ? undefined : processedConfig.data,
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Client-Type': 'miniapp',
          'Content-Type': 'application/json'
        },
        timeout: processedConfig.timeout || 15000
      })

      if (processedConfig.showLoading) {
        Taro.hideLoading()
      }

      let response = res.data as ApiResponse<T>
      // 注入请求配置，供 riskInterceptor 重放用
      ;(response as any).config = processedConfig

      // Process response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response)
      }

      return response
    } catch (err: any) {
      if (processedConfig.showLoading) {
        Taro.hideLoading()
      }

      if (err.errMsg?.includes('timeout')) {
        Taro.showToast({ title: '请求超时', icon: 'none' })
      } else if (err.errMsg?.includes('fail')) {
        Taro.showToast({ title: '网络异常', icon: 'none' })
      }

      throw err
    }
  }

  get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: 'GET', params })
  }

  post<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  put<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  delete<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: 'DELETE', data })
  }
}

export const http = new HttpClient()
export type { RequestConfig, ApiResponse }
