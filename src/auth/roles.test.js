import { describe, it, expect } from 'vitest'
import { PAGES, canSee, homeFor } from './roles.js'

describe('canSee', () => {
  it('follows the pages-to-roles table', () => {
    expect(canSee('barista', 'pos')).toBe(false)
    expect(canSee('barista', 'queue')).toBe(true)
    expect(canSee('cashier', 'cost')).toBe(false)
    expect(canSee('cashier', 'menu')).toBe(false)
    expect(canSee('owner', 'profit')).toBe(true)
  })

  it('says no to an unknown page or role', () => {
    expect(canSee('owner', 'nope')).toBe(false)
    expect(canSee(null, 'queue')).toBe(false)
    expect(canSee('manager', 'queue')).toBe(false)
  })

  it('lets each role see exactly its pages', () => {
    const visible = (role) => PAGES.filter((p) => canSee(role, p.key)).map((p) => p.key)
    expect(visible('owner')).toEqual(['dashboard', 'pos', 'queue', 'inventory', 'menu', 'staff', 'sales-report'])
    expect(visible('cashier')).toEqual(['dashboard', 'pos', 'queue', 'inventory'])
    expect(visible('barista')).toEqual(['queue', 'inventory'])
  })
})

describe('homeFor', () => {
  it('sends the barista to the queue and the others to the dashboard', () => {
    expect(homeFor('barista')).toBe('/queue')
    expect(homeFor('cashier')).toBe('/')
    expect(homeFor('owner')).toBe('/')
  })

  it('is a page the role can see, so a redirect never loops', () => {
    for (const role of ['owner', 'cashier', 'barista']) {
      expect(canSee(role, PAGES.find((p) => p.path === homeFor(role)).key)).toBe(true)
    }
  })
})
