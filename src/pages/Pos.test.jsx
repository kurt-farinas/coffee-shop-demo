// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import toast from 'react-hot-toast'
import { DemoStoreProvider, useDemoStore } from '../data/DemoStore.jsx'
import { buildSeed } from '../data/seed.js'
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

let el, root, store
function mount(initialState = buildSeed(42, new Date())) {
  const Probe = () => {
    store = useDemoStore()
    return null
  }
  el = document.createElement('div')
  document.body.append(el)
  root = createRoot(el)
  act(() => root.render(<DemoStoreProvider initialState={initialState}><Probe /><Pos /></DemoStoreProvider>))
}
afterEach(() => {
  act(() => root.unmount())
  el.remove()
})
beforeEach(() => vi.clearAllMocks())

const button = (text) => [...el.querySelectorAll('button')].find((b) => b.textContent.includes(text))
const tap = (text) => act(() => button(text).click())
function type(label, value) {
  const input = [...el.querySelectorAll('label')].find((l) => l.textContent === label).control
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
  act(() => input.dispatchEvent(new Event('input', { bubbles: true })))
}
function ringUpLatte() {
  tap('Latte')
  tap('Add to order')
  type('Customer name', 'Ana')
}

describe('Pos', () => {
  it('pays for a latte: one new order, cart and name cleared', () => {
    mount()
    const before = store.state.orders.length
    ringUpLatte()
    tap('Pay')
    expect(store.state.orders).toHaveLength(before + 1)
    const order = store.state.orders.at(-1)
    expect(order).toMatchObject({ customerName: 'Ana', status: 'new', total: 150 })
    expect(toast.success).toHaveBeenCalledWith(`Order ${order.id} sent to the bar`)
    expect(button('Pay').disabled).toBe(true)
    expect(button('Remove')).toBeUndefined()
    expect(el.querySelector('#customer-name').value).toBe('')
  })

  it('two fast taps on Pay place one order', () => {
    mount()
    const before = store.state.orders.length
    ringUpLatte()
    const pay = button('Pay')
    // both taps land before React re-renders
    act(() => {
      pay.click()
      pay.click()
    })
    expect(store.state.orders).toHaveLength(before + 1)
  })

  it('an item that is out of stock shows Out and cannot be added', () => {
    const seed = buildSeed(42, new Date())
    mount({ ...seed, ingredients: seed.ingredients.map((i) => (i.id === 'ing-croissant' ? { ...i, stock: 0 } : i)) })
    const croissant = button('Croissant')
    expect(croissant.textContent).toContain('Out')
    expect(croissant.disabled).toBe(true)
    act(() => croissant.click())
    expect(button('Remove')).toBeUndefined()
    expect(button('Pay').disabled).toBe(true)
  })

  it('shows a store error as a toast', () => {
    mount()
    tap('Croissant')
    tap('Pay')
    expect(toast.error).toHaveBeenCalledWith("Add the customer's name")
  })
})

describe('Pos options sheet', () => {
  const withStock = (id, stock) => {
    const seed = buildSeed(42, new Date())
    return { ...seed, ingredients: seed.ingredients.map((i) => (i.id === id ? { ...i, stock } : i)) }
  }

  it('disables a milk that cannot be made for one more drink and says Out', () => {
    mount(withStock('ing-oat-milk', 150)) // a medium latte takes 200 ml
    tap('Latte')
    const oat = button('Oat')
    expect(oat.disabled).toBe(true)
    expect(oat.textContent).toContain('Out')
    expect(button('Whole').disabled).toBe(false)
  })

  it('the Matcha sheet has no Extra shot control', () => {
    mount()
    tap('Matcha')
    const legends = [...el.querySelectorAll('dialog legend')].map((l) => l.textContent)
    expect(legends).toContain('Milk')
    expect(legends).not.toContain('Extra shot')
  })
})
