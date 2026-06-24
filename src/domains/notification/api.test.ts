import { beforeEach, describe, expect, it, vi } from 'vitest'

import { notificationApi } from './api'

const {
  listNotificationsMock,
  getUnreadCountMock,
  getPreferencesMock,
  updatePreferencesMock,
} = vi.hoisted(() => ({
  listNotificationsMock: vi.fn(),
  getUnreadCountMock: vi.fn(),
  getPreferencesMock: vi.fn(),
  updatePreferencesMock: vi.fn(),
}))

vi.mock('@/shared/api/request', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

vi.mock('@/shared/api2', () => ({
  notificationService: {
    ListNotifications: listNotificationsMock,
    GetUnreadCount: getUnreadCountMock,
    GetPreferences: getPreferencesMock,
    UpdatePreferences: updatePreferencesMock,
  },
}))

describe('notificationApi', () => {
  beforeEach(() => {
    listNotificationsMock.mockReset()
    getUnreadCountMock.mockReset()
    getPreferencesMock.mockReset()
    updatePreferencesMock.mockReset()
  })

  it('keeps the legacy ApiResponse notification list shape while using api2', async () => {
    listNotificationsMock.mockResolvedValue({
      notifications: [
        {
          id: 7,
          type: 'transaction',
          title: 'Paid',
          content: 'Order paid',
          isRead: false,
          createdAt: '2026-06-24T00:00:00Z',
          targetType: 'order',
          targetId: 42,
        },
      ],
      total: 1,
    })

    const result = await notificationApi.getNotifications({ type: 'transaction', page: 2 })

    expect(listNotificationsMock).toHaveBeenCalledWith({
      userId: undefined,
      page: 2,
      pageSize: 20,
      unreadOnly: undefined,
    })
    expect(result).toEqual({
      code: 0,
      message: 'ok',
      data: [
        {
          id: '7',
          type: 'transaction',
          title: 'Paid',
          content: 'Order paid',
          isRead: false,
          createdAt: '2026-06-24T00:00:00Z',
          link: '/pages/order/detail/index?id=42',
        },
      ],
    })
  })

  it('maps unread count and boolean preferences to legacy response shapes', async () => {
    getUnreadCountMock.mockResolvedValue({ count: 3 })
    getPreferencesMock.mockResolvedValue({
      preferences: [
        { type: 'system', enabled: true },
        { type: 'transaction', enabled: false },
        { type: 'marketing', enabled: true },
        { type: 'interaction', enabled: false },
      ],
    })
    updatePreferencesMock.mockResolvedValue({ success: true })

    await expect(notificationApi.getUnreadCount()).resolves.toEqual({
      code: 0,
      message: 'ok',
      data: 3,
    })
    await expect(notificationApi.getPreferences()).resolves.toEqual({
      code: 0,
      message: 'ok',
      data: {
        system: true,
        transaction: false,
        marketing: true,
        interaction: false,
      },
    })
    await expect(notificationApi.updatePreferences({
      system: true,
      transaction: true,
      marketing: false,
      interaction: true,
    })).resolves.toEqual({
      code: 0,
      message: 'ok',
      data: undefined,
    })
    expect(updatePreferencesMock).toHaveBeenCalledWith({
      userId: undefined,
      preferences: [
        { type: 'system', channel: 'in_app', enabled: true },
        { type: 'transaction', channel: 'in_app', enabled: true },
        { type: 'marketing', channel: 'in_app', enabled: false },
        { type: 'interaction', channel: 'in_app', enabled: true },
      ],
    })
  })
})
