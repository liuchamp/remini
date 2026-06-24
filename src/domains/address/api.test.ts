import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addressApi } from './api'

const { listAddressesMock } = vi.hoisted(() => ({
  listAddressesMock: vi.fn(),
}))

vi.mock('@/shared/api/request', () => ({
  http: {
    get: vi.fn().mockResolvedValue({ code: 0, data: { addresses: [], total: 0 }, message: 'legacy' }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/shared/api2', () => ({
  logisticsService: {
    ListAddresses: listAddressesMock,
  },
}))

describe('addressApi', () => {
  beforeEach(() => {
    listAddressesMock.mockReset()
  })

  it('keeps the legacy ApiResponse address list shape while using api2 logistics service', async () => {
    listAddressesMock.mockResolvedValue({
      addresses: [
        {
          id: 1,
          recipient: 'Ada',
          phone: '13800000000',
          province: 'Shanghai',
          city: 'Shanghai',
          district: 'Pudong',
          detail: 'No. 1',
          isDefault: true,
          label: 'home',
          createdAt: '2026-06-24T00:00:00Z',
          updatedAt: '2026-06-24T00:00:00Z',
        },
      ],
    })

    const result = await addressApi.getList()

    expect(listAddressesMock).toHaveBeenCalledWith({})
    expect(result).toEqual({
      code: 0,
      message: 'ok',
      data: {
        addresses: [
          {
            id: '1',
            recipient: 'Ada',
            phone: '13800000000',
            province: 'Shanghai',
            city: 'Shanghai',
            district: 'Pudong',
            detail: 'No. 1',
            isDefault: true,
            label: 'home',
            createdAt: '2026-06-24T00:00:00Z',
            updatedAt: '2026-06-24T00:00:00Z',
          },
        ],
        total: 1,
      },
    })
  })
})
