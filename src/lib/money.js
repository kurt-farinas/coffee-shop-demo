import { shopConfig } from '../config/shop.config.js'

const peso = new Intl.NumberFormat(shopConfig.locale, { style: 'currency', currency: shopConfig.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const formatPeso = (n) => peso.format(n)

// chart axis ticks: 2000 → "₱2k", 1500 → "₱1.5k", 500 → "₱500"
export const kilo = (v) => {
  const n = Math.abs(v)
  return `${v < 0 ? '-' : ''}₱${n >= 1000 ? `${Math.round(n / 100) / 10}k` : n}`
}
