import { PiGauge, PiCashRegister, PiListChecks, PiPackage, PiBookOpenText, PiUsers, PiChartLineUp } from 'react-icons/pi'
import { shopConfig } from '../config/shop.config.js'

const page = (key, label, icon) => ({ key, label, path: `/${key}`, icon })

export const PAGES = [
  { ...page('dashboard', 'Dashboard', PiGauge), path: '/' },
  page('pos', 'Point of sale', PiCashRegister),
  page('queue', 'Order queue', PiListChecks),
  page('inventory', 'Inventory', PiPackage),
  page('menu', 'Menu', PiBookOpenText),
  page('staff', 'Staff', PiUsers),
  page('sales-report', 'Sales report', PiChartLineUp),
]

export const ROLES = {
  owner: { label: 'Owner', person: shopConfig.staff.ownerName },
  barista: { label: 'Barista', person: shopConfig.staff.baristaName },
}

// pseudo-keys cost and profit gate parts of a page; the owner sees every key
const ACCESS = {
  owner: new Set([...PAGES.map((p) => p.key), 'cost', 'profit']),
  barista: new Set(['dashboard', 'pos', 'queue', 'inventory']),
}

export const canSee = (role, key) => ACCESS[role]?.has(key) ?? false

export const homeFor = () => '/'
