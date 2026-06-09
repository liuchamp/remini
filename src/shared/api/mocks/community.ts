import type { MockRoute } from '../mock-interceptor'

const mockCircles = [
  {
    id: 'c1',
    name: '\u6570\u7801\u7231\u597d\u8005',
    avatar: '/static/avatars/digital.jpg',
    description: '\u5206\u4eab\u6570\u7801\u4ea7\u54c1\u8bc4\u6d4b\u4e0e\u4f7f\u7528\u5fc3\u5f97',
    memberCount: 1280,
    todayPostCount: 15,
    isJoined: false,
  },
  {
    id: 'c2',
    name: '\u4e8c\u624b\u597d\u7269',
    avatar: '/static/avatars/secondhand.jpg',
    description: '\u53d1\u73b0\u503c\u5f97\u8d2d\u4e70\u7684\u4e8c\u624b\u597d\u7269',
    memberCount: 856,
    todayPostCount: 8,
    isJoined: true,
  },
]

export const communityMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/community\/circles$/,
    handler: () => ({ code: 0, data: mockCircles, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/community\/circles\/\w+$/,
    handler: () => ({
      code: 0,
      data: { circle: mockCircles[0], posts: [] },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/community\/circles\/\w+\/join$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/community\/circles\/\w+\/join$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/community\/comments\/\w+$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/community\/creator\/certification$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
