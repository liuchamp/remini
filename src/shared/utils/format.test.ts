import { describe, it, expect } from 'vitest'

function formatCurrency(amount: number) {
  return `¥${amount.toFixed(2)}`
}

describe('format utils', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(100)).toBe('¥100.00')
    expect(formatCurrency(10.5)).toBe('¥10.50')
  })
})
