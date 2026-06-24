import Taro from '@tarojs/taro'

import { findMock } from '../api/mock-interceptor'
import type { ApiResponse } from '../api/request'

const DEFAULT_API_BASE_URL = process.env.TARO_ENV === 'h5'
  ? '/api'
  : 'https://api.remx.com'

const DEFAULT_MOCK_ENABLED = process.env.MOCK_ENABLED !== 'false'

export interface Api2Request {
  path: string
  method: string
  body: string | null
}

export interface Api2RequestMeta {
  service: string
  method: string
}

export type Api2RequestHandler = (
  request: Api2Request,
  meta: Api2RequestMeta,
) => Promise<unknown>

export interface Api2RuntimeOptions {
  baseUrl?: string
  mockEnabled?: boolean
  timeout?: number
}

let pendingRequest: {
  request: Api2Request
  meta: Api2RequestMeta
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
} | null = null

export const getPendingApi2Request = () => pendingRequest
export const clearPendingApi2Request = () => { pendingRequest = null }
export const resolvePendingApi2Request = (res: unknown) => {
  if (pendingRequest) {
    pendingRequest.resolve(res)
    clearPendingApi2Request()
  }
}
export const rejectPendingApi2Request = (err: unknown) => {
  if (pendingRequest) {
    pendingRequest.reject(err)
    clearPendingApi2Request()
  }
}

export function normalizeApi2Path(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function parseBody(body: string | null): Record<string, unknown> | undefined {
  if (!body) return undefined

  try {
    return JSON.parse(body) as Record<string, unknown>
  } catch {
    return undefined
  }
}

function unwrapResponse<T>(response: T | ApiResponse<T>): T {
  if (
    response
    && typeof response === 'object'
    && 'code' in response
    && 'data' in response
  ) {
    const wrapped = response as ApiResponse<T>
    return wrapped.data
  }

  return response as T
}

function isApiResponse(response: unknown): response is ApiResponse<unknown> {
  return Boolean(response && typeof response === 'object' && 'code' in response)
}

function isRefreshTokenData(data: unknown): data is { token: string; refreshToken: string } {
  return Boolean(
    data
    && typeof data === 'object'
    && 'token' in data
    && 'refreshToken' in data
    && typeof (data as { token: unknown }).token === 'string'
    && typeof (data as { refreshToken: unknown }).refreshToken === 'string',
  )
}

export function createApi2RequestHandler(options: Api2RuntimeOptions = {}): Api2RequestHandler {
  const baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL
  const mockEnabled = options.mockEnabled ?? DEFAULT_MOCK_ENABLED
  const timeout = options.timeout ?? 15000
  let refreshPromise: Promise<boolean> | null = null

  const refreshToken = () => {
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = (async () => {
      try {
        const storedRefreshToken = Taro.getStorageSync('refreshToken')
        if (!storedRefreshToken) {
          return false
        }

        const res = await Taro.request({
          url: `${baseUrl}/api/v1/auth/refresh`,
          method: 'POST',
          data: { refreshToken: storedRefreshToken },
          header: {
            'X-Client-Type': 'miniapp',
            'X-Platform': process.env.TARO_ENV || 'weapp',
            'Content-Type': 'application/json',
          },
          timeout,
        })

        const response = res.data
        if (!isApiResponse(response) || (response.code !== 0 && response.code !== 200)) {
          return false
        }

        if (!isRefreshTokenData(response.data)) {
          return false
        }

        Taro.setStorageSync('token', response.data.token)
        Taro.setStorageSync('refreshToken', response.data.refreshToken)
        return true
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  const send = async (
    request: Api2Request,
    meta: Api2RequestMeta,
    allowRefresh: boolean,
  ): Promise<unknown> => {
    const path = normalizeApi2Path(request.path)
    const url = `${baseUrl}${path}`
    const method = request.method.toUpperCase()
    const data = parseBody(request.body)

    if (mockEnabled) {
      const mockResult = findMock(method, url, data)
      if (mockResult) {
        return unwrapResponse(mockResult)
      }
    }

    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url,
        method: method as keyof Taro.request.Method,
        data: method === 'GET' ? undefined : data,
        header: {
          Authorization: token ? `Bearer ${token}` : '',
          'X-Client-Type': 'miniapp',
          'X-Platform': process.env.TARO_ENV || 'weapp',
          'Content-Type': 'application/json',
        },
        timeout,
      })

      const response = res.data

      if (isApiResponse(response)) {
        if (response.code === 401) {
          if (allowRefresh && await refreshToken()) {
            return send(request, meta, false)
          }

          Taro.reLaunch({ url: '/pages/auth/login/index' })
          throw new Error('Token expired')
        }

        if (response.code === 412) {
          Taro.showToast({ title: '安全验证', icon: 'none' })
          return new Promise((resolve, reject) => {
            pendingRequest = { request, meta, resolve, reject }
            Taro.navigateTo({ url: '/pages/auth/challenge/index' })
          })
        }

        if (response.code === 403) {
          Taro.showModal({
            title: '交易被拦截',
            content: response.message || '由于账户或操作风险，交易已被风控系统拦截。',
            showCancel: false,
          })
          throw new Error(response.message || 'Blocked by risk engine')
        }

        if (response.code !== 0 && response.code !== 200) {
          Taro.showToast({ title: response.message || '请求失败', icon: 'none' })
        }
      }

      return unwrapResponse(response)
    } catch (err) {
      const taroError = err as { errMsg?: string }
      if (taroError.errMsg?.includes('timeout')) {
        Taro.showToast({ title: '请求超时', icon: 'none' })
      } else if (taroError.errMsg?.includes('fail')) {
        Taro.showToast({ title: '网络异常', icon: 'none' })
      }

      throw err
    }
  }

  const handler: Api2RequestHandler = (request, meta) => send(request, meta, true)

  return handler
}
