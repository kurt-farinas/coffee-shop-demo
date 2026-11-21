import { describe, it, expect } from 'vitest'
import { shopConfig } from '../config/shop.config.js'
import { DEFAULT_OPTIONS } from '../data/drinks.js'
import { addLine, setQty, cartTotal, canMake } from './posCart.js'

const state = { menu: shopConfig.menu, ingredients: shopConfig.ingredients }
const item = (id) => shopConfig.menu.find((m) => m.id === id)
const latte = { itemId: 'item-latte', options: DEFAULT_OPTIONS, qty: 1 }
const bigOat = { size: 'L', milk: 'oat', extraShot: true, sugar: 100 }

describe('addLine', () => {
  it('merges the same item with the same options', () => {
    const cart = addLine(addLine([], latte), { ...latte, options: { ...DEFAULT_OPTIONS } })
    expect(cart).toHaveLength(1)
    expect(cart[0].qty).toBe(2)
  })

  it('keeps different options on separate lines', () => {
    const cart = addLine(addLine([], latte), { ...latte, options: bigOat })
    expect(cart).toHaveLength(2)
  })
})

describe('setQty', () => {
  it('changes the quantity, and 0 removes the line', () => {
    const cart = addLine(addLine([], latte), { ...latte, options: bigOat })
    expect(setQty(cart, cart[0].key, 3)[0].qty).toBe(3)
    expect(setQty(cart, cart[0].key, 0)).toEqual([cart[1]])
  })
})

describe('cartTotal', () => {
  it('prices each line with its options', () => {
    // Latte 150 + L 30 + oat 30 + shot 40 = 250, twice
    expect(cartTotal(state, addLine([], { itemId: 'item-latte', options: bigOat, qty: 2 }))).toBe(500)
  })
})

describe('canMake', () => {
  it('is false when an ingredient of the default recipe is out', () => {
    const out = { ...state, ingredients: state.ingredients.map((i) => (i.id === 'ing-matcha' ? { ...i, stock: 0 } : i)) }
    expect(canMake(state, item('item-matcha-latte'))).toBe(true)
    expect(canMake(out, item('item-matcha-latte'))).toBe(false)
    expect(canMake(out, item('item-latte'))).toBe(true)
  })

  it('is true while any milk the item takes can be made, false when none can', () => {
    const stock = (whole, oat) => ({
      ...state,
      ingredients: state.ingredients.map((i) => (i.id === 'ing-whole-milk' ? { ...i, stock: whole } : i.id === 'ing-oat-milk' ? { ...i, stock: oat } : i)),
    })
    expect(canMake(stock(0, 1000), item('item-latte'))).toBe(true)
    expect(canMake(stock(0, 0), item('item-latte'))).toBe(false)
  })
})
