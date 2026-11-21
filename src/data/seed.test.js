import { describe, it, expect } from 'vitest'
import { buildSeed } from './seed.js'
import { shopConfig } from '../config/shop.config.js'

const now = new Date(2026, 10, 21, 12, 0) // local noon, a Saturday
const seed = buildSeed(42, now)
const localDay = (iso) => new Date(iso).toDateString()

describe('buildSeed', () => {
  it('is the same for the same seed and now', () => {
    expect(buildSeed(42, now)).toEqual(seed)
  })

  it('has six staff: owner and five baristas', () => {
    expect(seed.staff.map((s) => s.role).sort()).toEqual(['barista', 'barista', 'barista', 'barista', 'barista', 'owner'])
  })

  it('totals every order from its lines', () => {
    for (const o of seed.orders) expect(o.total, o.id).toBe(o.lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0))
  })

  it('uses only menu items', () => {
    const ids = new Set(seed.menu.map((m) => m.id))
    for (const o of seed.orders) for (const l of o.lines) expect(ids.has(l.itemId), `${o.id} ${l.itemId}`).toBe(true)
  })

  it('numbers orders in time order from O-1001', () => {
    seed.orders.forEach((o, i) => expect(o.id).toBe(`O-${1001 + i}`))
    const times = seed.orders.map((o) => o.createdAt)
    expect(times).toEqual([...times].sort())
    expect(times.at(-1) <= now.toISOString()).toBe(true)
  })

  it('has 40 to 90 done orders on each of the 29 full past days', () => {
    const perDay = {}
    for (const o of seed.orders) if (localDay(o.createdAt) !== now.toDateString()) perDay[localDay(o.createdAt)] = (perDay[localDay(o.createdAt)] ?? 0) + 1
    expect(Object.keys(perDay)).toHaveLength(29)
    for (const [day, n] of Object.entries(perDay)) expect(n >= 40 && n <= 90, `${day}: ${n}`).toBe(true)
  })

  it('has exactly 6 open orders, all today: 3 new, 2 brewing, 1 ready', () => {
    const open = seed.orders.filter((o) => o.status !== 'done')
    expect(open).toHaveLength(6)
    for (const o of open) expect(localDay(o.createdAt)).toBe(now.toDateString())
    expect(open.map((o) => o.status).sort()).toEqual(['brewing', 'brewing', 'new', 'new', 'new', 'ready'])
  })

  it('starts with at least one ingredient at or below its low mark', () => {
    expect(seed.ingredients.some((i) => i.stock <= i.lowAt)).toBe(true)
  })

  it('does not change the shop config', () => {
    expect(seed.ingredients).not.toBe(shopConfig.ingredients)
    expect(shopConfig.ingredients.find((i) => i.id === 'ing-cup').stock).toBe(400)
  })
})
