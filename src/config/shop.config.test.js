import { describe, it, expect } from 'vitest'
import { shopConfig } from './shop.config.js'
import { contrastRatio } from '../lib/contrast.js'

const ingredientIds = shopConfig.ingredients.map((i) => i.id)

describe('shopConfig', () => {
  it('has unique ingredient and menu ids', () => {
    const ids = [...ingredientIds, ...shopConfig.menu.map((m) => m.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses known ingredients in recipes', () => {
    for (const item of shopConfig.menu) {
      for (const line of item.recipe) {
        expect(ingredientIds, `${item.id} uses ${line.ingredientId}`).toContain(line.ingredientId)
      }
    }
  })

  it('uses https image urls when an item or the hero has one', () => {
    for (const url of [shopConfig.heroImage, ...shopConfig.menu.map((m) => m.image)].filter(Boolean)) {
      expect(url).toMatch(/^https:\/\//)
    }
  })
})

describe('shopConfig.theme', () => {
  const t = shopConfig.theme
  const pairs = [
    ...['text', 'muted', 'accentInk', 'warnText', 'success', 'danger'].flatMap((fg) => ['page', 'surface', 'soft'].map((bg) => [fg, bg])),
    ['onAccent', 'accent'], ['text', 'highlight'], ['surface', 'danger'], ['highlight', 'rail'], ['muted', 'warnBg'], ['railInk', 'rail'], ['warnText', 'warnBg'], ['success', 'successBg'],
  ]
  it.each(pairs)('keeps %s readable on %s (4.5:1)', (fg, bg) => {
    expect(t[fg], fg).toBeDefined()
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })
})
