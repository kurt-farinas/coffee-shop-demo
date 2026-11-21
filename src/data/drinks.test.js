import { describe, it, expect } from 'vitest'
import { shopConfig } from '../config/shop.config.js'
import { DEFAULT_OPTIONS, linePrice, lineUsage, optionsLabel } from './drinks.js'

const item = (id) => shopConfig.menu.find((m) => m.id === id)
const latte = item('item-latte')
const icedLatte = item('item-iced-latte')
const croissant = item('item-croissant')
const big = { size: 'L', milk: 'oat', extraShot: true, sugar: 100 }

describe('linePrice', () => {
  it('adds size, milk and shot', () => {
    expect(linePrice(latte, big)).toBe(250)
  })

  it('is the base price with defaults, less for small', () => {
    expect(linePrice(latte, DEFAULT_OPTIONS)).toBe(150)
    expect(linePrice(latte, { ...DEFAULT_OPTIONS, size: 'S' })).toBe(130)
  })

  it('ignores size and milk for pastries', () => {
    expect(linePrice(croissant, { ...DEFAULT_OPTIONS, size: 'L', milk: 'oat' })).toBe(croissant.price)
  })
})

describe('lineUsage', () => {
  it('uses the recipe as is with defaults', () => {
    expect(lineUsage(latte, DEFAULT_OPTIONS)).toEqual({ 'ing-beans': 18, 'ing-whole-milk': 200, 'ing-cup': 1 })
  })

  it('scales milk, swaps the milk and adds a shot', () => {
    expect(lineUsage(icedLatte, big)).toEqual({ 'ing-beans': 36, 'ing-oat-milk': 250, 'ing-cup': 1 })
  })

  it('ignores size and milk for pastries', () => {
    expect(lineUsage(croissant, { ...DEFAULT_OPTIONS, size: 'L', milk: 'oat' })).toEqual({ 'ing-croissant': 1 })
  })
})

describe('optionsLabel', () => {
  it('is empty for defaults', () => {
    expect(optionsLabel(latte, DEFAULT_OPTIONS)).toBe('')
  })

  it('lists every non-default choice', () => {
    expect(optionsLabel(latte, { size: 'L', milk: 'oat', extraShot: true, sugar: 50 })).toBe('L · Oat · +shot · 50% sugar')
  })
})
