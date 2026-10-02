import { describe, it, expect } from 'vitest'

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

describe('utils', () => {
  it('formats currency', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00')
  })

  it('formats currency in PEN', () => {
    expect(formatCurrency(1500, 'PEN')).toBe('PEN 1,500.00')
  })
})
