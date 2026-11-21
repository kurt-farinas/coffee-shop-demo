import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DemoStoreProvider, useDemoStore } from './DemoStore.jsx'
import { DEFAULT_OPTIONS } from './drinks.js'

// server render in the node test environment: enough to reach the store's functions
function render() {
  let store
  const Probe = () => {
    store = useDemoStore()
    return null
  }
  renderToString(<DemoStoreProvider><Probe /></DemoStoreProvider>)
  return store
}

describe('DemoStoreProvider', () => {
  it('starts from the seed', () => {
    expect(render().state.orders.length).toBeGreaterThan(0)
  })

  it('placeOrder returns the error or the new order', () => {
    const store = render()
    expect(store.placeOrder({ customerName: 'Ana', lines: [], payment: 'cash' })).toEqual({ ok: false, error: 'Add at least one item' })
    const result = store.placeOrder({ customerName: 'Ana', lines: [{ itemId: 'item-latte', options: DEFAULT_OPTIONS, qty: 1 }], payment: 'cash' })
    expect(result.ok).toBe(true)
    expect(result.order.id).toBe(`O-${1001 + store.state.orders.length}`)
  })

  it('useDemoStore outside the provider throws', () => {
    const Bare = () => useDemoStore()
    expect(() => renderToString(<Bare />)).toThrow('useDemoStore must be used inside DemoStoreProvider')
  })
})
