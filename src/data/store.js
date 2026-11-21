import { CATEGORIES, linePrice, lineUsage } from './drinks.js'

const FLOW = { new: 'brewing', brewing: 'ready', ready: 'done', done: 'done' }

export const nextStatus = (status) => FLOW[status]

const findItem = (state, itemId) => state.menu.find((m) => m.id === itemId)

// Every change to the demo data goes through here. placeOrder re-checks the order,
// the others ignore input they can't apply.
export function demoReducer(state, action) {
  switch (action.type) {
    case 'placeOrder': {
      if (validateOrder(state, action.order)) return state // stale callers can't oversell
      const used = orderUsage(state, action.order.lines)
      return {
        ...state,
        orders: [...state.orders, action.order],
        ingredients: state.ingredients.map((i) => (used[i.id] ? { ...i, stock: i.stock - used[i.id] } : i)),
      }
    }
    case 'advanceOrder':
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, status: nextStatus(o.status) } : o)) }
    case 'restock': {
      if (!Number.isInteger(action.qty) || action.qty <= 0) return state
      return {
        ...state,
        ingredients: state.ingredients.map((i) => (i.id === action.ingredientId ? { ...i, stock: i.stock + action.qty } : i)),
      }
    }
    case 'saveItem': {
      if (validateItem(state, action.item)) return state
      const exists = state.menu.some((m) => m.id === action.item.id)
      return { ...state, menu: exists ? state.menu.map((m) => (m.id === action.item.id ? action.item : m)) : [...state.menu, action.item] }
    }
    case 'toggleHidden':
      return { ...state, menu: state.menu.map((m) => (m.id === action.id ? { ...m, hidden: !m.hidden } : m)) }
    default:
      return state
  }
}

// ingredient amounts for the whole order; lines must already be valid
export function orderUsage(state, lines) {
  const total = {}
  for (const l of lines) {
    for (const [id, qty] of Object.entries(lineUsage(findItem(state, l.itemId), l.options))) total[id] = (total[id] ?? 0) + qty * l.qty
  }
  return total
}

export function validateOrder(state, { customerName, lines }) {
  if (!lines?.length) return 'Add at least one item'
  if (!customerName?.trim()) return "Add the customer's name"
  for (const l of lines) {
    if (!findItem(state, l.itemId)) return 'Item not found'
    if (!Number.isInteger(l.qty) || l.qty < 1) return 'Quantity must be at least 1'
  }
  for (const [id, qty] of Object.entries(orderUsage(state, lines))) {
    const ing = state.ingredients.find((i) => i.id === id)
    if (qty > ing.stock) return `Not enough ${ing.name} (${ing.stock} ${ing.unit} left)`
  }
  return null
}

export function buildOrder(state, { customerName, lines, payment }, now) {
  const full = lines.map(({ itemId, options, qty }) => {
    const item = findItem(state, itemId)
    return { itemId, name: item.name, options, qty, unitPrice: linePrice(item, options) }
  })
  return {
    id: `O-${1001 + state.orders.length}`,
    customerName: customerName.trim(),
    lines: full,
    total: full.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
    payment,
    createdAt: now.toISOString(),
    status: 'new',
  }
}

const isCount = (n) => Number.isInteger(n) && n >= 1

// item may be new (no id yet) or an edit of an existing one (its own name doesn't count as taken)
export function validateItem(state, { id, name, category, price, recipe }) {
  const trimmed = name?.trim()
  if (!trimmed) return 'Add a name'
  if (trimmed.length > 40) return 'Name must be 40 characters or fewer'
  const twin = state.menu.find((m) => m.id !== id && m.name.trim().toLowerCase() === trimmed.toLowerCase())
  if (twin) return `There is already a ${twin.name}`
  if (!isCount(price)) return 'Price must be at least ₱1'
  if (!CATEGORIES.includes(category)) return 'Pick a category'
  if (!recipe?.length) return 'Add at least one ingredient'
  const seen = new Set()
  for (const line of recipe) {
    const ing = state.ingredients.find((i) => i.id === line.ingredientId)
    if (!ing) return 'Ingredient not found'
    if (!isCount(line.qty)) return 'Amounts must be at least 1'
    if (seen.has(ing.id)) return `${ing.name} is listed twice`
    seen.add(ing.id)
  }
  return null
}

// a new menu item; input must already be valid
export function buildItem(state, input) {
  const name = input.name.trim()
  const base = `item-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new'}`
  let id = base
  for (let n = 2; findItem(state, id); n++) id = `${base}-${n}`
  return { ...input, id, name, hidden: false }
}
