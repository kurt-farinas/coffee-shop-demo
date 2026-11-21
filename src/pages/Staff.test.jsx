// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { buildSeed } from '../data/seed.js'
import { Staff } from './Staff.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let el, root
function mount() {
  el = document.createElement('div')
  document.body.append(el)
  root = createRoot(el)
  act(() =>
    root.render(
      <DemoStoreProvider initialState={buildSeed(42, new Date())}>
        <Staff />
      </DemoStoreProvider>,
    ),
  )
}
afterEach(() => {
  act(() => root.unmount())
  el.remove()
})

const cards = () => el.querySelectorAll('[data-testid="staff-card"]')
const chip = (text) => [...el.querySelectorAll('button')].find((b) => b.textContent === text)

describe('Staff', () => {
  it('shows a card per person and the head count', () => {
    mount()
    expect(cards()).toHaveLength(6)
    expect(el.textContent).toContain('6 people')
  })

  it('filters by role with the chips', () => {
    mount()
    act(() => chip('Barista').click())
    expect(cards()).toHaveLength(3)
    expect(chip('Barista').getAttribute('aria-pressed')).toBe('true')
    act(() => chip('All').click())
    expect(cards()).toHaveLength(6)
  })

  it('links the phone with digits only', () => {
    mount()
    const link = el.querySelector('a[href^="tel:"]')
    expect(link.getAttribute('href')).toBe('tel:09175550201')
    expect(link.textContent).toBe('0917 555 0201')
  })

  it('shows the week table with one row per day', () => {
    mount()
    const rows = el.querySelectorAll('table tbody tr')
    expect([...rows].map((r) => r.querySelector('th').textContent)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(rows[6].textContent).toContain('Trina')
    expect(el.textContent).not.toContain('Nobody scheduled')
  })
})
