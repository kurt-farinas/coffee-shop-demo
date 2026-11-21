// pinned so the early-morning case below crosses a UTC date line on every machine
process.env.TZ = 'Asia/Manila'
import { describe, it, expect } from 'vitest'
import { ordersOn, ordersBetween, summary, bestSellers, itemSales, salesByHour, dailySales, salesByCategory, paymentSplit, salesSameTimeLastWeek, paymentShares } from './reports.js'

const menu = [
  { id: 'latte', name: 'Latte', category: 'Espresso' },
  { id: 'matcha', name: 'Matcha latte', category: 'Non-coffee' },
  { id: 'croissant', name: 'Croissant', category: 'Pastry' },
]
const NAMES = { latte: 'Latte', matcha: 'Matcha latte', croissant: 'Croissant' }
const line = (itemId, qty, unitPrice, unitCost) => ({ itemId, name: NAMES[itemId], options: {}, label: '', qty, unitPrice, unitCost })
let n = 0
const order = (date, lines, payment = 'cash') => ({
  id: `O-${++n}`,
  customerName: 'Ana',
  lines,
  total: lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
  payment,
  createdAt: date.toISOString(),
  status: 'done',
})
const at = (d, h, min = 0) => new Date(2026, 10, d, h, min)

describe('ordersOn', () => {
  it('counts a 23:30 local order on that local day', () => {
    const late = order(at(20, 23, 30), [line('latte', 1, 150, 40)])
    expect(ordersOn([late], at(20, 12))).toEqual([late])
    expect(ordersOn([late], at(21, 12))).toEqual([])
  })

  it('counts a 00:30 local order on that local day, not the UTC day before', () => {
    const early = order(at(21, 0, 30), [line('latte', 1, 150, 40)])
    expect(ordersOn([early], at(21, 12))).toEqual([early])
    expect(ordersOn([early], at(20, 12))).toEqual([])
  })
})

describe('ordersBetween', () => {
  it('keeps the last 2 local days up to and including the end day', () => {
    const os = [order(at(18, 9), []), order(at(19, 0, 10), []), order(at(20, 23, 50), []), order(at(21, 8), [])]
    expect(ordersBetween(os, at(20, 12), 2).map((o) => o.id)).toEqual([os[1].id, os[2].id])
  })
})

describe('summary', () => {
  it('two orders of 150 and 260 make 410 sales and a 205 average', () => {
    const os = [
      order(at(21, 8), [line('latte', 1, 150, 40.5)]),
      order(at(21, 9), [line('matcha', 1, 170, 50), line('croissant', 2, 45, 30)]),
    ]
    expect(summary(os, menu)).toEqual({ sales: 410, orders: 2, cups: 2, avgOrder: 205, cost: 150.5, profit: 259.5 })
  })

  it('rounds the average order to whole pesos', () => {
    const os = [order(at(21, 8), [line('latte', 1, 100, 0)]), order(at(21, 9), [line('latte', 1, 101, 0)])]
    expect(summary(os, menu).avgOrder).toBe(101)
  })

  it('is all zeros with no orders', () => {
    expect(summary([], menu)).toEqual({ sales: 0, orders: 0, cups: 0, avgOrder: 0, cost: 0, profit: 0 })
  })
})

describe('bestSellers and itemSales', () => {
  const os = [
    order(at(21, 8), [line('latte', 2, 150, 40), line('croissant', 3, 95, 45)]),
    order(at(21, 9), [line('matcha', 3, 170, 50), line('latte', 1, 180, 40)]),
  ]

  it('ranks by quantity, then name, and keeps the top n', () => {
    expect(bestSellers(os, 2)).toEqual([
      { itemId: 'croissant', name: 'Croissant', qty: 3, sales: 285 },
      { itemId: 'latte', name: 'Latte', qty: 3, sales: 480 },
    ])
  })

  it('lists every item by sales with its profit', () => {
    expect(itemSales(os)).toEqual([
      { itemId: 'matcha', name: 'Matcha latte', qty: 3, sales: 510, profit: 360 },
      { itemId: 'latte', name: 'Latte', qty: 3, sales: 480, profit: 360 },
      { itemId: 'croissant', name: 'Croissant', qty: 3, sales: 285, profit: 150 },
    ])
  })
})

describe('salesByHour', () => {
  it('has every hour from 7 to 20, zero when empty', () => {
    const rows = salesByHour([order(at(21, 8, 15), [line('latte', 1, 150, 0)]), order(at(21, 8, 50), [line('latte', 1, 120, 0)])])
    expect(rows.map((r) => r.hour)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(rows.find((r) => r.hour === 8).sales).toBe(270)
    expect(rows.find((r) => r.hour === 7).sales).toBe(0)
  })

  it('widens the range for an order outside opening hours', () => {
    const rows = salesByHour([order(at(21, 22, 5), [line('latte', 1, 150, 0)])])
    expect(rows.at(-1)).toEqual({ hour: 22, sales: 150 })
  })
})

describe('dailySales', () => {
  it('has every day, oldest first, with sales, profit and orders', () => {
    const os = [order(at(19, 23, 30), [line('latte', 2, 150, 40)]), order(at(21, 0, 30), [line('croissant', 1, 95, 45)]), order(at(21, 9), [line('latte', 1, 150, 40)])]
    expect(dailySales(os, at(21, 12), 3)).toEqual([
      { day: '2026-11-19', sales: 300, profit: 220, orders: 1 },
      { day: '2026-11-20', sales: 0, profit: 0, orders: 0 },
      { day: '2026-11-21', sales: 245, profit: 160, orders: 2 },
    ])
  })
})

describe('salesByCategory', () => {
  it('sums qty, sales and profit per menu category, every category present', () => {
    const os = [order(at(21, 8), [line('latte', 2, 150, 40), line('croissant', 1, 95, 45)])]
    expect(salesByCategory(os, menu)).toEqual([
      { category: 'Espresso', qty: 2, sales: 300, profit: 220 },
      { category: 'Non-coffee', qty: 0, sales: 0, profit: 0 },
      { category: 'Pastry', qty: 1, sales: 95, profit: 50 },
    ])
  })
})

describe('paymentSplit', () => {
  it('sums order totals by payment', () => {
    const os = [order(at(21, 8), [line('latte', 1, 150, 0)], 'cash'), order(at(21, 9), [line('latte', 1, 260, 0)], 'gcash'), order(at(21, 9), [line('latte', 1, 100, 0)], 'cash')]
    expect(paymentSplit(os)).toEqual({ cash: 250, gcash: 260 })
  })
})

describe('salesSameTimeLastWeek', () => {
  it('counts the same local day a week ago, only up to this time of day', () => {
    const orders = [
      order(at(14, 9, 59), [line('latte', 1, 150, 40)]), // same weekday, just before 10:00
      order(at(14, 10, 1), [line('latte', 1, 260, 40)]), // same weekday, just after
      order(at(20, 9, 0), [line('latte', 1, 999, 40)]), // yesterday, not last week
    ]
    expect(salesSameTimeLastWeek(orders, at(21, 10))).toBe(150)
  })
})

describe('paymentShares', () => {
  it('always adds up to 100%', () => {
    expect(paymentShares({ cash: 665, gcash: 335 })).toEqual({ cash: 67, gcash: 33 })
    expect(paymentShares({ cash: 0, gcash: 0 })).toEqual({ cash: 0, gcash: 0 })
  })
})
