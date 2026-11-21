import { describe, it, expect } from 'vitest'
import { shopConfig } from '../config/shop.config.js'
import { DEFAULT_OPTIONS, choicesFor, linePrice, lineUsage, optionsLabel } from './drinks.js'

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

describe('choices an item ignores', () => {
  const matcha = item('item-matcha-latte')
  const americano = item('item-americano')
  const croissant = item('item-croissant')

  it('gives no extra shot to an item that does not allow one', () => {
    const withShot = { ...DEFAULT_OPTIONS, extraShot: true }
    expect(linePrice(matcha, withShot)).toBe(linePrice(matcha, DEFAULT_OPTIONS))
    expect(lineUsage(matcha, withShot)).toEqual(lineUsage(matcha, DEFAULT_OPTIONS))
    expect(optionsLabel(matcha, withShot)).toBe('')
  })

  it('ignores oat milk on a drink with no milk', () => {
    const oat = { ...DEFAULT_OPTIONS, milk: 'oat' }
    expect(linePrice(americano, oat)).toBe(120)
    expect(lineUsage(americano, oat)).not.toHaveProperty('ing-oat-milk')
    expect(optionsLabel(americano, oat)).toBe('')
  })

  it('labels a pastry with nothing, whatever was picked', () => {
    expect(optionsLabel(croissant, { size: 'L', milk: 'oat', extraShot: true, sugar: 50 })).toBe('')
  })

  it('treats a line with no options as the defaults', () => {
    expect(linePrice(latte, undefined)).toBe(150)
    expect(lineUsage(latte, undefined)).toEqual({ 'ing-beans': 18, 'ing-whole-milk': 200, 'ing-cup': 1 })
  })
})

describe('choicesFor', () => {
  it('says which choices each item takes', () => {
    expect(choicesFor(item('item-matcha-latte'))).toMatchObject({ shot: false, milk: true })
    expect(choicesFor(item('item-americano'))).toMatchObject({ milk: false, shot: true })
    expect(choicesFor(croissant)).toEqual({ size: false, milk: false, shot: false, sugar: false })
  })
})
