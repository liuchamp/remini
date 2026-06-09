import type { MockRoute } from '../mock-interceptor'

export const chatMocks: MockRoute[] = [
  {
    method: 'POST',
    urlPattern: /\/threads\/\w+\/read-receipt$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/threads\/\w+$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/threads\/\w+\/pin$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
