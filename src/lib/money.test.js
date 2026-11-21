import { describe, it, expect } from 'vitest'
import { formatPeso } from './money.js'

describe('formatPeso', () => {
  it('formats whole pesos with a thousands separator', () => {
    expect(formatPeso(1250)).toBe('₱1,250')
  })

  it('formats zero', () => {
    expect(formatPeso(0)).toBe('₱0')
  })
})
