import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createApi2RequestHandler, normalizeApi2Path } from './runtime'

const { requestMock, getStorageSyncMock, setStorageSyncMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
  getStorageSyncMock: vi.fn(),
  setStorageSyncMock: vi.fn(),
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    request: requestMock,
    getStorageSync: getStorageSyncMock,
    showToast: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    showModal: vi.fn(),
    reLaunch: vi.fn(),
    navigateTo: vi.fn(),
    setStorageSync: setStorageSyncMock,
  },
}))

describe('api2 runtime', () => {
  beforeEach(() => {
    requestMock.mockReset()
    getStorageSyncMock.mockReset()
    setStorageSyncMock.mockReset()
  })

  it('normalizes generated api paths with a single leading slash', () => {
    expect(normalizeApi2Path('api/v1/products')).toBe('/api/v1/products')
    expect(normalizeApi2Path('/api/v1/products')).toBe('/api/v1/products')
  })

  it('sends generated requests through Taro and unwraps ApiResponse data', async () => {
    getStorageSyncMock.mockReturnValue('token-1')
    requestMock.mockResolvedValue({
      data: {
        code: 0,
        data: { products: [{ id: 1, title: 'Camera' }] },
        message: 'ok',
      },
    })

    const handler = createApi2RequestHandler({ baseUrl: 'https://example.test', mockEnabled: false })
    const result = await handler(
      { path: 'api/v1/products?page=1', method: 'GET', body: null },
      { service: 'ProductService', method: 'ListProducts' },
    )

    expect(result).toEqual({ products: [{ id: 1, title: 'Camera' }] })
    expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.test/api/v1/products?page=1',
      method: 'GET',
      data: undefined,
      header: expect.objectContaining({
        Authorization: 'Bearer token-1',
        'X-Client-Type': 'miniapp',
        'Content-Type': 'application/json',
      }),
    }))
  })

  it('refreshes an expired token and replays the original generated request', async () => {
    getStorageSyncMock.mockImplementation((key: string) => {
      if (key === 'token') return 'expired-token'
      if (key === 'refreshToken') return 'refresh-token'
      return ''
    })
    requestMock
      .mockResolvedValueOnce({ data: { code: 401, data: null, message: 'expired' } })
      .mockResolvedValueOnce({
        data: {
          code: 0,
          data: { token: 'token-2', refreshToken: 'refresh-token-2' },
          message: 'ok',
        },
      })
      .mockResolvedValueOnce({
        data: {
          code: 0,
          data: { id: 1, title: 'Camera' },
          message: 'ok',
        },
      })

    const handler = createApi2RequestHandler({ baseUrl: 'https://example.test', mockEnabled: false })
    const result = await handler(
      { path: 'api/v1/products/1', method: 'GET', body: null },
      { service: 'ProductService', method: 'GetProduct' },
    )

    expect(result).toEqual({ id: 1, title: 'Camera' })
    expect(requestMock).toHaveBeenCalledTimes(3)
    expect(requestMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
      url: 'https://example.test/api/v1/auth/refresh',
      method: 'POST',
      data: { refreshToken: 'refresh-token' },
    }))
    expect(setStorageSyncMock).toHaveBeenCalledWith('token', 'token-2')
    expect(setStorageSyncMock).toHaveBeenCalledWith('refreshToken', 'refresh-token-2')
  })
})
