import { describe, it, expect } from 'vitest'
import { shopConfig } from '../config/shop.config.js'
import { DEFAULT_OPTIONS } from './drinks.js'
import { orderUsage, validateOrder, buildOrder, demoReducer, nextStatus } from './store.js'

// stock overrides by ingredient id, e.g. { 'ing-oat-milk': 100 }
const fixture = (stock = {}) => ({
  ingredients: shopConfig.ingredients.map((i) => (i.id in stock ? { ...i, stock: stock[i.id] } : { ...i })),
  menu: shopConfig.menu,
  staff: [],
  orders: [],
})
const stockOf = (state, id) => state.ingredients.find((i) => i.id === id).stock
const line = (itemId, options = DEFAULT_OPTIONS, qty = 1) => ({ itemId, options, qty })
const latte = line('item-latte')
const bigIced = line('item-iced-latte', { size: 'L', milk: 'oat', extraShot: true, sugar: 100 })
const now = new Date('2026-11-21T09:30:00Z')

describe('validateOrder', () => {
  it('needs at least one line', () => {
    expect(validateOrder(fixture(), { customerName: 'Ana', lines: [] })).toBe('Add at least one item')
  })

  it("needs the customer's name", () => {
    expect(validateOrder(fixture(), { customerName: '  ', lines: [latte] })).toBe("Add the customer's name")
  })

  it('needs a whole quantity of at least 1', () => {
    expect(validateOrder(fixture(), { customerName: 'Ana', lines: [line('item-latte', DEFAULT_OPTIONS, 0)] })).toBe('Quantity must be at least 1')
    expect(validateOrder(fixture(), { customerName: 'Ana', lines: [line('item-latte', DEFAULT_OPTIONS, 1.5)] })).toBe('Quantity must be at least 1')
  })

  it('needs a known item', () => {
    expect(validateOrder(fixture(), { customerName: 'Ana', lines: [line('item-nope')] })).toBe('Item not found')
  })

  it('names the ingredient that runs out', () => {
    const s = fixture({ 'ing-oat-milk': 100 })
    expect(validateOrder(s, { customerName: 'Ana', lines: [line('item-latte', { ...DEFAULT_OPTIONS, milk: 'oat' })] })).toBe('Not enough Oat milk (100 ml left)')
  })

  it('sums usage across lines', () => {
    const s = fixture({ 'ing-whole-milk': 300 })
    expect(validateOrder(s, { customerName: 'Ana', lines: [latte, latte] })).toBe('Not enough Whole milk (300 ml left)')
  })

  it('passes an order that fits', () => {
    expect(validateOrder(fixture(), { customerName: 'Ana', lines: [latte, bigIced] })).toBe(null)
  })
})

describe('orderUsage', () => {
  it('multiplies by qty and sums lines', () => {
    expect(orderUsage(fixture(), [line('item-latte', DEFAULT_OPTIONS, 2), bigIced])).toEqual({
      'ing-beans': 72, 'ing-whole-milk': 400, 'ing-oat-milk': 250, 'ing-cup': 3,
    })
  })
})

describe('buildOrder', () => {
  it('prices the lines and numbers the order', () => {
    const order = buildOrder(fixture(), { customerName: 'Ana', lines: [line('item-latte', DEFAULT_OPTIONS, 2), bigIced], payment: 'gcash' }, now)
    expect(order).toEqual({
      id: 'O-1001',
      customerName: 'Ana',
      lines: [
        { itemId: 'item-latte', name: 'Latte', options: DEFAULT_OPTIONS, qty: 2, unitPrice: 150 },
        { itemId: 'item-iced-latte', name: 'Iced latte', options: bigIced.options, qty: 1, unitPrice: 260 },
      ],
      total: 560,
      payment: 'gcash',
      createdAt: '2026-11-21T09:30:00.000Z',
      status: 'new',
    })
  })
})

describe('demoReducer', () => {
  it('placeOrder takes the stock and adds the order as new', () => {
    const s = fixture()
    const order = buildOrder(s, { customerName: 'Ana', lines: [bigIced], payment: 'cash' }, now)
    const next = demoReducer(s, { type: 'placeOrder', order })
    expect(stockOf(next, 'ing-beans')).toBe(stockOf(s, 'ing-beans') - 36)
    expect(stockOf(next, 'ing-oat-milk')).toBe(stockOf(s, 'ing-oat-milk') - 250)
    expect(stockOf(next, 'ing-cup')).toBe(stockOf(s, 'ing-cup') - 1)
    expect(stockOf(next, 'ing-whole-milk')).toBe(stockOf(s, 'ing-whole-milk'))
    expect(next.orders).toEqual([order])
    expect(next.orders[0].status).toBe('new')
  })

  it('placeOrder returns identical state when the order no longer fits stock', () => {
    const order = buildOrder(fixture(), { customerName: 'Ana', lines: [bigIced], payment: 'cash' }, now)
    const stale = fixture({ 'ing-oat-milk': 100 })
    expect(demoReducer(stale, { type: 'placeOrder', order })).toBe(stale)
  })

  it('advanceOrder moves only that order on', () => {
    const s = { ...fixture(), orders: [{ id: 'O-1001', status: 'new' }, { id: 'O-1002', status: 'ready' }] }
    const next = demoReducer(s, { type: 'advanceOrder', id: 'O-1002' })
    expect(next.orders.map((o) => o.status)).toEqual(['new', 'done'])
  })

  it('restock adds a whole positive quantity', () => {
    const s = fixture()
    expect(stockOf(demoReducer(s, { type: 'restock', ingredientId: 'ing-cup', qty: 50 }), 'ing-cup')).toBe(stockOf(s, 'ing-cup') + 50)
  })

  it('restock ignores zero, negative and fractional quantities', () => {
    const s = fixture()
    for (const qty of [0, -5, 2.5]) expect(demoReducer(s, { type: 'restock', ingredientId: 'ing-cup', qty })).toBe(s)
  })
})

describe('nextStatus', () => {
  it('walks new, brewing, ready, done and stays done', () => {
    expect(nextStatus('new')).toBe('brewing')
    expect(nextStatus('brewing')).toBe('ready')
    expect(nextStatus('ready')).toBe('done')
    expect(nextStatus('done')).toBe('done')
  })
})
