import { shopConfig } from '../config/shop.config.js'
import { createRandom, int, pick } from './random.js'
import { SUGAR_LEVELS } from './drinks.js'
import { buildOrder } from './store.js'

const { ownerName, baristaName } = shopConfig.staff
const STAFF = [
  { id: 'st-1', name: ownerName, role: 'owner', phone: '0917 555 0201', hiredOn: '2021-06-01', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: 'st-2', name: baristaName, role: 'barista', phone: '0918 555 0202', hiredOn: '2022-02-14', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'st-3', name: 'Trina Lopez', role: 'barista', phone: '0919 555 0203', hiredOn: '2023-07-03', schedule: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'st-4', name: 'Jun Cruz', role: 'barista', phone: '0920 555 0204', hiredOn: '2021-06-01', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'st-5', name: 'Kat Dizon', role: 'barista', phone: '0921 555 0205', hiredOn: '2022-10-10', schedule: ['Tue', 'Wed', 'Thu', 'Sat', 'Sun'] },
  { id: 'st-6', name: 'Paolo Ramos', role: 'barista', phone: '0922 555 0206', hiredOn: '2024-03-18', schedule: ['Mon', 'Fri', 'Sat', 'Sun'] },
]

const NAMES = ['Ana', 'Bea', 'Carlo', 'Dani', 'Ella', 'Gab', 'Iya', 'Jo', 'Kim', 'Lia', 'Mae', 'Migs', 'Nico', 'Pat', 'Rina', 'Sam', 'Tin', 'Vince', 'Yna', 'Zed']
// how often each hour is busy from opening at 7 to closing at 20: peaks 7–10 AM and 3–5 PM
const HOUR_WEIGHT = { 7: 3, 8: 4, 9: 3, 10: 1, 11: 1, 12: 2, 13: 1, 14: 1, 15: 3, 16: 3, 17: 1, 18: 1, 19: 1 }
const HOURS = Object.entries(HOUR_WEIGHT).flatMap(([h, w]) => Array(w).fill(Number(h)))
// today's open orders, oldest first, as minutes before now
const OPEN = [[15, 'ready'], [12, 'brewing'], [9, 'brewing'], [6, 'new'], [4, 'new'], [2, 'new']]
// oat milk and cups start just under their low mark so the dashboard warning shows
const LOW_START = ['ing-oat-milk', 'ing-cup']

function randomOrder(rand, menu, date, status) {
  const lines = Array.from({ length: pick(rand, [1, 1, 1, 2, 2, 3]) }, () => ({
    itemId: pick(rand, menu).id,
    options: {
      size: pick(rand, ['S', 'M', 'M', 'L']),
      milk: pick(rand, ['whole', 'whole', 'whole', 'oat']),
      extraShot: rand() < 0.15,
      sugar: pick(rand, [...SUGAR_LEVELS, 100, 100]),
    },
    qty: pick(rand, [1, 1, 1, 2]),
  }))
  const order = buildOrder({ menu, ingredients: shopConfig.ingredients, orders: [] }, { customerName: pick(rand, NAMES), lines, payment: pick(rand, ['cash', 'cash', 'gcash']) }, date)
  return { ...order, status }
}

// History orders are already paid and made; they don't take stock.
export function buildSeed(seed = 42, now = new Date()) {
  const rand = createRandom(seed)
  const menu = structuredClone(shopConfig.menu)
  const ingredients = shopConfig.ingredients.map((i) => ({ ...i, stock: LOW_START.includes(i.id) ? Math.round(i.lowAt * 0.9) : i.stock }))
  const staff = structuredClone(STAFF)
  // done orders today stop short of the open ones
  const doneBefore = new Date(now.getTime() - 20 * 60000)

  const orders = []
  for (let d = 29; d >= 0; d--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d)
    const weekend = day.getDay() === 0 || day.getDay() === 6
    const count = weekend ? int(rand, 65, 90) : int(rand, 40, 70)
    for (let n = 0; n < count; n++) {
      const date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), pick(rand, HOURS), int(rand, 0, 59))
      if (date < doneBefore) orders.push(randomOrder(rand, menu, date, 'done'))
    }
  }
  for (const [minutesAgo, status] of OPEN) orders.push(randomOrder(rand, menu, new Date(now.getTime() - minutesAgo * 60000), status))

  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  orders.forEach((o, i) => (o.id = `O-${1001 + i}`))
  return { ingredients, menu, staff, orders }
}
