import { DEFAULT_OPTIONS, MILKS, choicesFor, linePrice } from '../data/drinks.js'
import { orderUsage } from '../data/store.js'

// cart lines are { key, itemId, options, qty }; the key makes the same item with the same options one line
const keyOf = (itemId, o) => [itemId, o.size, o.milk, o.extraShot, o.sugar].join('|')

export function addLine(cart, { itemId, options, qty }) {
  const key = keyOf(itemId, options)
  if (cart.some((l) => l.key === key)) return cart.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
  return [...cart, { key, itemId, options, qty }]
}

export const setQty = (cart, key, qty) =>
  qty < 1 ? cart.filter((l) => l.key !== key) : cart.map((l) => (l.key === key ? { ...l, qty } : l))

export const cartTotal = (state, cart) =>
  cart.reduce((sum, l) => sum + l.qty * linePrice(state.menu.find((m) => m.id === l.itemId), l.options), 0)

// one more of this item with these options, on top of what is already in the cart, fits the stock on hand
export const canAdd = (state, cart, itemId, options) =>
  Object.entries(orderUsage(state, [...cart, { itemId, options, qty: 1 }])).every(
    ([id, qty]) => qty <= state.ingredients.find((i) => i.id === id).stock,
  )

// at least one allowed option set (smallest size, any milk the item takes) can be made once
export const canMake = (state, item) =>
  (choicesFor(item).milk ? Object.keys(MILKS) : [DEFAULT_OPTIONS.milk]).some((milk) =>
    canAdd(state, [], item.id, { ...DEFAULT_OPTIONS, size: 'S', milk }),
  )
