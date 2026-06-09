import type { MockRoute } from '../mock-interceptor'

export const tradeMocks: MockRoute[] = [
  {
    method: 'POST',
    urlPattern: /\/orders\/\w+\/review$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/orders\/\w+\/review\/append$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
