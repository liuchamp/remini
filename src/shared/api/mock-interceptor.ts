import type { ApiResponse } from './request'

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  urlPattern: RegExp
  handler: (url: string, data?: any) => ApiResponse<any>
}

const mockRoutes: MockRoute[] = []

export function registerMocks(routes: MockRoute[]) {
  mockRoutes.push(...routes)
}

export function findMock(method: string, url: string, data?: any): ApiResponse<any> | null {
  const route = mockRoutes.find(
    (r) => r.method === method.toUpperCase() && r.urlPattern.test(url)
  )
  if (!route) return null
  return route.handler(url, data)
}

export function clearMocks() {
  mockRoutes.length = 0
}
