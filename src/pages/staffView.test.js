import { describe, it, expect } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { initials, tenureLabel, onShift, weekRoster } from './staffView.js'

const TODAY = new Date(2026, 10, 21) // Sat 21 Nov 2026, local

describe('initials', () => {
  it('takes the first letter of each name part', () => {
    expect(initials('Paolo Ramos')).toBe('PR')
    expect(initials('Bea')).toBe('B')
  })
})

describe('tenureLabel', () => {
  it('rounds down to whole years, then months, then says new', () => {
    expect(tenureLabel('2021-06-01', TODAY)).toBe('With us since Jun 2021 (5 years)')
    expect(tenureLabel('2026-05-10', TODAY)).toContain('6 months')
    expect(tenureLabel('2026-11-05', TODAY)).toContain('New this month')
    expect(tenureLabel('2025-11-22', TODAY)).toContain('(11 months)')
    expect(tenureLabel('2025-11-21', TODAY)).toContain('(1 year)')
    expect(tenureLabel('2026-10-21', TODAY)).toContain('(1 month)')
  })
})

describe('onShift', () => {
  it('uses the local weekday of today', () => {
    const person = { schedule: ['Sun'] }
    // just after midnight local Sunday: east of UTC this is still Saturday in UTC
    expect(onShift(person, new Date(2026, 10, 22, 0, 30))).toBe(true)
    expect(onShift(person, new Date(2026, 10, 21, 23, 30))).toBe(false)
  })
})

describe('weekRoster', () => {
  const roster = weekRoster(buildSeed(42, TODAY).staff)
  it('runs Mon to Sun with first names by role', () => {
    expect(roster.map((r) => r.day)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    const sun = roster.find((r) => r.day === 'Sun')
    expect(sun.cashiers).toEqual(['Trina'])
    expect(sun.baristas).toEqual(['Kat', 'Paolo'])
  })
  it('leaves no day without a cashier or a barista in the seed', () => {
    for (const r of roster) {
      expect(r.cashiers.length, r.day).toBeGreaterThan(0)
      expect(r.baristas.length, r.day).toBeGreaterThan(0)
    }
  })
  it('lists nobody when a role is missing that day', () => {
    const r = weekRoster([{ name: 'Ana Cruz', role: 'cashier', schedule: ['Mon'] }])
    expect(r[0]).toEqual({ day: 'Mon', cashiers: ['Ana'], baristas: [] })
    expect(r[1].cashiers).toEqual([])
  })
})
