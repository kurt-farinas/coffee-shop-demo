import { describe, it, expect } from 'vitest'
import { formatAmount, stockState, sortForDisplay, stockValue, parseRestock, costLabel, restockLabel } from './inventoryView.js'

const ing = (over) => ({ id: 'x', name: 'X', unit: 'ml', stock: 500, lowAt: 100, costPerUnit: 1, ...over })

describe('formatAmount', () => {
  it('reads like a person would say it', () => {
    expect(formatAmount(1200, 'g')).toBe('1.2 kg')
    expect(formatAmount(900, 'ml')).toBe('900 ml')
    expect(formatAmount(1500, 'ml')).toBe('1.5 L')
    expect(formatAmount(1, 'pc')).toBe('1 pc')
    expect(formatAmount(90, 'pc')).toBe('90 pcs')
    expect(formatAmount(999, 'g')).toBe('999 g')
    expect(formatAmount(50000, 'ml')).toBe('50 L')
  })
})

describe('stockState', () => {
  it('is low at lowAt, out at 0, ok above', () => {
    expect(stockState(ing({ stock: 100 }))).toBe('low')
    expect(stockState(ing({ stock: 0 }))).toBe('out')
    expect(stockState(ing({ stock: 101 }))).toBe('ok')
  })
})

describe('sortForDisplay', () => {
  it('puts low and out before ok, then by name, without mutating', () => {
    const list = [ing({ name: 'Apple' }), ing({ name: 'Zest', stock: 50 }), ing({ name: 'Milk', stock: 0 }), ing({ name: 'Beans' })]
    expect(sortForDisplay(list).map((i) => i.name)).toEqual(['Milk', 'Zest', 'Apple', 'Beans'])
    expect(list[0].name).toBe('Apple')
  })
})

describe('stockValue', () => {
  it('is stock times cost in whole pesos', () => {
    expect(stockValue(ing({ stock: 12000, costPerUnit: 0.1 }))).toBe(1200)
    expect(stockValue(ing({ stock: 3, costPerUnit: 0.25 }))).toBe(1)
  })
})

describe('costLabel and restockLabel', () => {
  it('shows centavos only when the cost has them', () => {
    expect(costLabel(ing({ unit: 'g', costPerUnit: 1.2 }))).toMatch(/^₱1\.20 \/ g$/)
    expect(costLabel(ing({ unit: 'pc', costPerUnit: 45 }))).toMatch(/^₱45 \/ pc$/)
  })
  it('keeps the exact amount for the toast', () => {
    expect(restockLabel(1000, 'ml')).toBe('1,000 ml')
    expect(restockLabel(6, 'pc')).toBe('6 pcs')
  })
})

describe('parseRestock', () => {
  it('accepts only whole numbers above 0', () => {
    for (const bad of ['', '  ', '0', '-5', '2.5', 'abc', '1e3']) expect(parseRestock(bad)).toHaveProperty('error')
    expect(parseRestock('250')).toEqual({ qty: 250 })
    expect(parseRestock(' 40 ')).toEqual({ qty: 40 })
  })
  it('rejects more than 1,000,000', () => {
    expect(parseRestock('1000000')).toEqual({ qty: 1000000 })
    expect(parseRestock('1000001')).toEqual({ error: 'Enter at most 1,000,000' })
  })
})
