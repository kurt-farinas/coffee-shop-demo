import { linePrice, lineUsage } from './drinks.js'

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
