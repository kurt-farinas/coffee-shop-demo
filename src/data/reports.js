import { CATEGORIES } from './drinks.js'

// Report numbers from the orders. Days are the shop's LOCAL calendar days, never the UTC date in createdAt.
const pad = (n) => String(n).padStart(2, '0')
export const dayKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const keyOf = (order) => dayKey(new Date(order.createdAt))
const addDays = (day, n) => new Date(day.getFullYear(), day.getMonth(), day.getDate() + n)
const cents = (n) => Math.round(n * 100) / 100

// cost is the unitCost frozen on the ticket at sale time, so a later recipe or price change can't rewrite it
const lineSales = (l) => l.qty * l.unitPrice
const lineCost = (l) => l.qty * l.unitCost
const orderCost = (o) => o.lines.reduce((s, l) => s + lineCost(l), 0)
const categoryOf = (menu, itemId) => menu.find((m) => m.id === itemId)?.category

export const ordersOn = (orders, day) => orders.filter((o) => keyOf(o) === dayKey(day))

// the `days` local days ending with endDay, endDay included
export function ordersBetween(orders, endDay, days) {
  const from = dayKey(addDays(endDay, 1 - days))
  const to = dayKey(endDay)
  return orders.filter((o) => keyOf(o) >= from && keyOf(o) <= to)
}

export function summary(orders, menu) {
  const sales = orders.reduce((s, o) => s + o.total, 0)
  const cost = cents(orders.reduce((s, o) => s + orderCost(o), 0))
  const cups = orders.flatMap((o) => o.lines).filter((l) => categoryOf(menu, l.itemId) !== 'Pastry').reduce((s, l) => s + l.qty, 0)
  return { sales, orders: orders.length, cups, avgOrder: orders.length ? Math.round(sales / orders.length) : 0, cost, profit: cents(sales - cost) }
}

// every item sold, by sales; the name is the one on the ticket
export function itemSales(orders) {
  const rows = {}
  for (const l of orders.flatMap((o) => o.lines)) {
    const r = (rows[l.itemId] ??= { itemId: l.itemId, name: l.name, qty: 0, sales: 0, profit: 0 })
    r.qty += l.qty
    r.sales += lineSales(l)
    r.profit = cents(r.profit + lineSales(l) - lineCost(l))
  }
  return Object.values(rows).sort((a, b) => b.sales - a.sales || a.name.localeCompare(b.name))
}

export const bestSellers = (orders, n) =>
  itemSales(orders)
    .sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name))
    .slice(0, n)
    .map(({ itemId, name, qty, sales }) => ({ itemId, name, qty, sales }))

// opening hours 7 to 20, widened if an order falls outside them
export function salesByHour(orders) {
  const hourOf = (o) => new Date(o.createdAt).getHours()
  const hours = orders.map(hourOf)
  const rows = []
  for (let h = Math.min(7, ...hours); h <= Math.max(20, ...hours); h++) rows.push({ hour: h, sales: 0 })
  for (const o of orders) rows.find((r) => r.hour === hourOf(o)).sales += o.total
  return rows
}

export function dailySales(orders, endDay, days) {
  const rows = Array.from({ length: days }, (_, i) => ({ day: dayKey(addDays(endDay, i + 1 - days)), sales: 0, profit: 0, orders: 0 }))
  for (const o of orders) {
    const r = rows.find((row) => row.day === keyOf(o))
    if (!r) continue
    r.sales += o.total
    r.profit = cents(r.profit + o.total - orderCost(o))
    r.orders += 1
  }
  return rows
}

export function salesByCategory(orders, menu) {
  const rows = CATEGORIES.map((category) => ({ category, qty: 0, sales: 0, profit: 0 }))
  for (const l of orders.flatMap((o) => o.lines)) {
    const r = rows.find((row) => row.category === categoryOf(menu, l.itemId))
    if (!r) continue
    r.qty += l.qty
    r.sales += lineSales(l)
    r.profit = cents(r.profit + lineSales(l) - lineCost(l))
  }
  return rows
}

export const paymentSplit = (orders) => ({
  cash: orders.filter((o) => o.payment === 'cash').reduce((s, o) => s + o.total, 0),
  gcash: orders.filter((o) => o.payment === 'gcash').reduce((s, o) => s + o.total, 0),
})

// same local clock time on the local date 7 days back (not now − 168 h, which DST would shift)
export function salesSameTimeLastWeek(orders, now) {
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
  return ordersOn(orders, at).filter((o) => new Date(o.createdAt) <= at).reduce((sum, o) => sum + o.total, 0)
}

// whole-percent shares that always add up to 100
export function paymentShares({ cash, gcash }) {
  const total = cash + gcash
  if (!total) return { cash: 0, gcash: 0 }
  const c = Math.round((cash / total) * 100)
  return { cash: c, gcash: 100 - c }
}
