// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import toast from 'react-hot-toast'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { buildSeed } from '../data/seed.js'
import { Menu } from './Menu.jsx'
import { Pos } from './Pos.jsx'

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no modal dialog
HTMLDialogElement.prototype.showModal ??= function () {
  this.open = true
}
HTMLDialogElement.prototype.close ??= function () {
  this.open = false
  this.dispatchEvent(new Event('close'))
}

let el, root
function mount() {
  el = document.createElement('div')
  document.body.append(el)
  root = createRoot(el)
  act(() =>
    root.render(
      <DemoStoreProvider initialState={buildSeed(42, new Date())}>
        <div id="menu"><Menu /></div>
        <div id="pos"><Pos /></div>
      </DemoStoreProvider>,
    ),
  )
}
afterEach(() => {
  act(() => root.unmount())
  el.remove()
})
beforeEach(() => vi.clearAllMocks())

const menu = () => el.querySelector('#menu')
const row = (name) => [...menu().querySelectorAll('li')].find((li) => li.querySelector('h3')?.textContent === name)
const buttonIn = (scope, text) => [...scope.querySelectorAll('button')].find((b) => b.textContent.includes(text))
const tap = (scope, text) => act(() => buttonIn(scope, text).click())
const dialog = () => menu().querySelector('dialog')
function type(label, value) {
  const input = [...dialog().querySelectorAll('label')].find((l) => l.textContent.startsWith(label)).control
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
  act(() => input.dispatchEvent(new Event('input', { bubbles: true })))
}

describe('Menu', () => {
  it('lists each item with its price, recipe and cost of a medium', () => {
    mount()
    const latte = row('Latte')
    expect(latte.textContent).toContain('₱150')
    expect(latte.textContent).toContain('18 g Espresso beans · 200 ml Whole milk · 1 pc Cups')
    expect(latte.textContent).toContain('Cost ₱49 · 67% margin') // 18×1.4 + 200×0.1 + 1×4 = 49.2
    expect([...menu().querySelectorAll('h2')].map((h) => h.textContent)).toEqual(['Espresso', 'Non-coffee', 'Pastry'])
  })

  it('editing the latte price to 165 shows ₱165 in the list', () => {
    mount()
    tap(row('Latte'), 'Edit')
    type('Price', '165')
    tap(dialog(), 'Save')
    expect(row('Latte').textContent).toContain('₱165')
    expect(toast.success).toHaveBeenCalledWith('Saved Latte')
    expect(dialog().open).toBe(false)
  })

  it('saving with an empty name shows Add a name and keeps the form open', () => {
    mount()
    tap(menu(), 'Add item')
    tap(dialog(), 'Save')
    expect(dialog().querySelector('[role="alert"]').textContent).toBe('Add a name')
    expect(dialog().open).toBe(true)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('numbers the recipe row labels and links the error to the form', () => {
    mount()
    tap(menu(), 'Add item')
    tap(dialog(), 'Add ingredient')
    const labels = [...dialog().querySelectorAll('label')].map((l) => l.textContent)
    expect(labels.some((t) => t.startsWith('Ingredient 2'))).toBe(true)
    expect(labels.some((t) => t.startsWith('Amount 2 (g)'))).toBe(true)
    tap(dialog(), 'Save')
    expect(dialog().querySelector('form').getAttribute('aria-describedby')).toBe(dialog().querySelector('[role="alert"]').id)
  })

  it('adds a new item from the form', () => {
    mount()
    tap(menu(), 'Add item')
    type('Name', 'Flat white')
    type('Price', '160')
    type('Amount', '18')
    tap(dialog(), 'Save')
    expect(row('Flat white').textContent).toContain('18 g Espresso beans')
    expect(toast.success).toHaveBeenCalledWith('Saved Flat white')
  })

  it('hiding the croissant shows the Hidden badge and the POS no longer lists it', () => {
    mount()
    const pos = el.querySelector('#pos')
    expect(buttonIn(pos, 'Croissant')).toBeDefined()
    tap(row('Croissant'), 'Hide')
    expect(row('Croissant').textContent).toContain('Hidden')
    expect(buttonIn(row('Croissant'), 'Show')).toBeDefined()
    expect(buttonIn(pos, 'Croissant')).toBeUndefined()
  })
})
