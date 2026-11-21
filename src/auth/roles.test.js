import { describe, it, expect } from 'vitest'
import { PAGES, canSee, homeFor } from './roles.js'

describe('canSee', () => {
  it('follows the pages-to-roles table', () => {
    expect(canSee('barista', 'pos')).toBe(true)
    expect(canSee('barista', 'queue')).toBe(true)
    expect(canSee('barista', 'cost')).toBe(false)
    expect(canSee('barista', 'profit')).toBe(false)
    expect(canSee('barista', 'menu')).toBe(false)
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
    expect(visible('barista')).toEqual(['dashboard', 'pos', 'queue', 'inventory'])
  })
})

describe('homeFor', () => {
  it('sends both roles to the dashboard', () => {
    expect(homeFor('barista')).toBe('/')
    expect(homeFor('owner')).toBe('/')
  })

  it('is a page the role can see, so a redirect never loops', () => {
    for (const role of ['owner', 'barista']) {
      expect(canSee(role, PAGES.find((p) => p.path === homeFor(role)).key)).toBe(true)
    }
  })
})
