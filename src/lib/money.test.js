import { describe, it, expect } from 'vitest'
import { formatPeso, kilo } from './money.js'

describe('formatPeso', () => {
  it('formats whole pesos with a thousands separator', () => {
    expect(formatPeso(1250)).toBe('₱1,250')
  })

  it('formats zero', () => {
    expect(formatPeso(0)).toBe('₱0')
  })
})

describe('kilo', () => {
  it('shortens thousands for chart ticks', () => {
    expect(kilo(2000)).toBe('₱2k')
    expect(kilo(1500)).toBe('₱1.5k')
    expect(kilo(500)).toBe('₱500')
    expect(kilo(0)).toBe('₱0')
    expect(kilo(-2000)).toBe('-₱2k')
  })
})
