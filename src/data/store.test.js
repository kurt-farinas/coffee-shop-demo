import { describe, it, expect } from 'vitest'
import { shopConfig } from '../config/shop.config.js'
import { DEFAULT_OPTIONS } from './drinks.js'
import { orderUsage, validateOrder, buildOrder, demoReducer, nextStatus, validateItem, buildItem } from './store.js'

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

const latteItem = shopConfig.menu.find((m) => m.id === 'item-latte')
const draft = (change = {}) => ({
  name: 'Flat white', category: 'Espresso', price: 160, allowsShot: true,
  recipe: [{ ingredientId: 'ing-beans', qty: 18 }, { ingredientId: 'ing-whole-milk', qty: 150, scales: true, milk: true }],
  ...change,
})
const recipeWith = (...lines) => draft({ recipe: lines })

describe('validateItem', () => {
  it('passes a complete new item and an unchanged existing one', () => {
    expect(validateItem(fixture(), draft())).toBe(null)
    expect(validateItem(fixture(), latteItem)).toBe(null)
  })

  it('needs a name of at most 40 characters', () => {
    expect(validateItem(fixture(), draft({ name: '   ' }))).toBe('Add a name')
    expect(validateItem(fixture(), draft({ name: undefined }))).toBe('Add a name')
    expect(validateItem(fixture(), draft({ name: 'x'.repeat(41) }))).toBe('Name must be 40 characters or fewer')
    expect(validateItem(fixture(), draft({ name: `  ${'x'.repeat(40)}  ` }))).toBe(null)
  })

  it('needs a name no other item has, ignoring case and spaces', () => {
    expect(validateItem(fixture(), draft({ name: ' latte ' }))).toBe('There is already a Latte')
    expect(validateItem(fixture(), { ...latteItem, name: 'LATTE' })).toBe(null) // its own name
    expect(validateItem(fixture(), { ...latteItem, name: 'Americano' })).toBe('There is already a Americano')
  })

  it('needs a whole price of at least 1', () => {
    for (const price of [0, -5, 1.5, NaN, '150']) expect(validateItem(fixture(), draft({ price }))).toBe('Price must be at least ₱1')
    expect(validateItem(fixture(), draft({ price: 1 }))).toBe(null)
  })

  it('needs one of the three categories', () => {
    expect(validateItem(fixture(), draft({ category: 'Tea' }))).toBe('Pick a category')
  })

  it('needs at least one ingredient', () => {
    expect(validateItem(fixture(), recipeWith())).toBe('Add at least one ingredient')
    expect(validateItem(fixture(), draft({ recipe: undefined }))).toBe('Add at least one ingredient')
  })

  it('needs each ingredient to exist', () => {
    expect(validateItem(fixture(), recipeWith({ ingredientId: 'ing-nope', qty: 1 }))).toBe('Ingredient not found')
  })

  it('needs whole amounts of at least 1', () => {
    for (const qty of [0, -1, 2.5, NaN]) expect(validateItem(fixture(), recipeWith({ ingredientId: 'ing-cup', qty }))).toBe('Amounts must be at least 1')
  })

  it('does not take the same ingredient twice', () => {
    expect(validateItem(fixture(), recipeWith({ ingredientId: 'ing-cup', qty: 1 }, { ingredientId: 'ing-cup', qty: 2 }))).toBe('Cups is listed twice')
  })
})

describe('buildItem', () => {
  it('makes a visible item with a slug id and a trimmed name', () => {
    expect(buildItem(fixture(), draft({ name: '  Flat White! ' }))).toEqual({ ...draft(), id: 'item-flat-white', name: 'Flat White!', hidden: false })
  })

  it('numbers the id when the slug is taken', () => {
    const s = fixture()
    expect(buildItem(s, draft({ name: 'Latte?' })).id).toBe('item-latte-2')
    const taken = { ...s, menu: [...s.menu, { ...latteItem, id: 'item-latte-2' }] }
    expect(buildItem(taken, draft({ name: 'Latte?' })).id).toBe('item-latte-3')
  })
})

describe('demoReducer menu actions', () => {
  it('saveItem adds a new item at the end', () => {
    const s = fixture()
    const item = buildItem(s, draft())
    const next = demoReducer(s, { type: 'saveItem', item })
    expect(next.menu).toEqual([...s.menu, item])
  })

  it('saveItem replaces an existing item in place', () => {
    const s = fixture()
    const next = demoReducer(s, { type: 'saveItem', item: { ...latteItem, price: 165 } })
    expect(next.menu.findIndex((m) => m.id === 'item-latte')).toBe(s.menu.findIndex((m) => m.id === 'item-latte'))
    expect(next.menu.find((m) => m.id === 'item-latte').price).toBe(165)
    expect(next.menu).toHaveLength(s.menu.length)
  })

  it('saveItem returns identical state for an invalid item', () => {
    const s = fixture()
    expect(demoReducer(s, { type: 'saveItem', item: { ...latteItem, price: 0 } })).toBe(s)
    expect(demoReducer(s, { type: 'saveItem', item: buildItem(s, draft({ name: 'Americano ' })) })).toBe(s)
  })

  it('toggleHidden hides and shows only that item', () => {
    const s = fixture()
    const hidden = demoReducer(s, { type: 'toggleHidden', id: 'item-croissant' })
    expect(hidden.menu.filter((m) => m.hidden).map((m) => m.id)).toEqual(['item-croissant'])
    expect(demoReducer(hidden, { type: 'toggleHidden', id: 'item-croissant' }).menu.some((m) => m.hidden)).toBe(false)
  })
})
