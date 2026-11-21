import { describe, it, expect } from 'vitest'
import { contrastRatio } from './contrast.js'

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for the same colour', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1)
  })
})
