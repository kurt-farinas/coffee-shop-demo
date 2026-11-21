import { shopConfig } from '../config/shop.config.js'

const peso = new Intl.NumberFormat(shopConfig.locale, { style: 'currency', currency: shopConfig.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const formatPeso = (n) => peso.format(n)
