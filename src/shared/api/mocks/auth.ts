import type { MockRoute } from '../mock-interceptor'

export const authMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/auth\/devices$/,
    handler: () => ({
      code: 0,
      data: [
        { id: 'd1', deviceModel: 'iPhone 15 Pro', osVersion: 'iOS 18', appVersion: '1.2.0', networkType: 'WiFi', lastActiveAt: '2026-06-10T08:30:00Z', isCurrent: true },
        { id: 'd2', deviceModel: 'Huawei Mate 60', osVersion: 'HarmonyOS 4', appVersion: '1.2.0', networkType: '4G', lastActiveAt: '2026-06-09T22:00:00Z', isCurrent: false },
      ],
      message: 'ok',
    }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/auth\/devices\/\w+$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
