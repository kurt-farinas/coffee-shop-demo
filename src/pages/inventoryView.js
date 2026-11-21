import { shopConfig } from '../config/shop.config.js'

const num = new Intl.NumberFormat(shopConfig.locale, { maximumFractionDigits: 2 })
const cents = new Intl.NumberFormat(shopConfig.locale, { style: 'currency', currency: shopConfig.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
const whole = new Intl.NumberFormat(shopConfig.locale, { style: 'currency', currency: shopConfig.currency, maximumFractionDigits: 0 })
const BIG = { g: 'kg', ml: 'L' }

const unitFor = (qty, unit) => (unit === 'pc' ? (qty === 1 ? 'pc' : 'pcs') : unit)

// 1200 g → "1.2 kg", 1500 ml → "1.5 L", 90 pc → "90 pcs"
export function formatAmount(qty, unit) {
  if (BIG[unit] && qty >= 1000) return `${num.format(qty / 1000)} ${BIG[unit]}`
  return `${num.format(qty)} ${unitFor(qty, unit)}`
}

// the exact amount, no kg/L, for the restock toast: "1,000 ml"
export const restockLabel = (qty, unit) => `${num.format(qty)} ${unitFor(qty, unit)}`

export const stockState = (ing) => (ing.stock <= 0 ? 'out' : ing.stock <= ing.lowAt ? 'low' : 'ok')

const needsStock = (ing) => stockState(ing) !== 'ok'
export const sortForDisplay = (ingredients) =>
  [...ingredients].sort((a, b) => needsStock(b) - needsStock(a) || a.name.localeCompare(b.name))

export const stockValue = (ing) => Math.round(ing.stock * ing.costPerUnit)

export const costLabel = (ing) => `${(Number.isInteger(ing.costPerUnit) ? whole : cents).format(ing.costPerUnit)} / ${ing.unit}`

export function parseRestock(text) {
  const t = text.trim()
  if (!t) return { error: 'Enter an amount.' }
  if (!/^\d+$/.test(t) || Number(t) === 0) return { error: 'Enter a whole number above 0.' }
  return { qty: Number(t) }
}
