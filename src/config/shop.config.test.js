import { describe, it, expect } from 'vitest'
import { shopConfig } from './shop.config.js'

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
})
