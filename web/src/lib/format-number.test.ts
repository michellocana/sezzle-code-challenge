import { describe, expect, it } from 'vitest'
import { formatNumber } from './format-number'

describe('formatNumber', () => {
  it('formats whole numbers without decimals', () => {
    expect(formatNumber(5)).toBe('5')
  })

  it('formats clean decimals as-is', () => {
    expect(formatNumber(0.3)).toBe('0.3')
  })

  it('trims float64 noise from non-terminating division', () => {
    expect(formatNumber(3.3333333333333335)).toBe('3.33333333333')
  })

  it('preserves negative numbers', () => {
    expect(formatNumber(-2.5)).toBe('-2.5')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})
