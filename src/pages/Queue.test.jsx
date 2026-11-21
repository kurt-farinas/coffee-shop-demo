// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within, cleanup, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { buildSeed } from '../data/seed.js'
import { buildOrder } from '../data/store.js'
import { Queue } from './Queue.jsx'

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

const column = (name) => screen.getByRole('tabpanel', { name: new RegExp(`^${name}`) })
const cards = (name) => within(column(name)).queryAllByRole('article')
const show = () => render(<DemoStoreProvider><Queue /></DemoStoreProvider>)

describe('Queue', () => {
  it('shows the seed: 3 new, 2 brewing, 1 ready', () => {
    show()
    expect(cards('New')).toHaveLength(3)
    expect(cards('Brewing')).toHaveLength(2)
    expect(cards('Ready')).toHaveLength(1)
  })

  it('Start brewing moves a card from New to Brewing', async () => {
    show()
    const first = cards('New')[0]
    const name = within(first).getByRole('heading').textContent
    await userEvent.click(within(first).getByRole('button', { name: 'Start brewing' }))
    expect(cards('New')).toHaveLength(2)
    expect(cards('Brewing')).toHaveLength(3)
    expect(cards('Brewing').map((c) => within(c).getByRole('heading').textContent)).toContain(name)
  })

  it('Picked up takes the order off the board', async () => {
    show()
    await userEvent.click(within(cards('Ready')[0]).getByRole('button', { name: 'Picked up' }))
    expect(cards('Ready')).toHaveLength(0)
    expect(screen.getAllByRole('article')).toHaveLength(5)
  })

  it('Mark ready toasts the order id and customer', async () => {
    show()
    const card = cards('Brewing')[0]
    const id = within(card).getByText(/^O-/).textContent
    const name = within(card).getByRole('heading').textContent
    await userEvent.click(within(card).getByRole('button', { name: 'Mark ready' }))
    expect(toast.success).toHaveBeenCalledWith(`${id} ready for ${name}`)
  })

  it('two taps within 100 ms move one order', () => {
    vi.useFakeTimers()
    show()
    const start = () => screen.getAllByRole('button', { name: 'Start brewing' })[0]
    fireEvent.click(start())
    act(() => vi.advanceTimersByTime(100))
    fireEvent.click(start())
    expect(cards('New')).toHaveLength(2)
    act(() => vi.advanceTimersByTime(400))
    fireEvent.click(start())
    expect(cards('New')).toHaveLength(1)
  })

  it('late cards read "Late · 12 min"', () => {
    const state = buildSeed(42, new Date())
    const orders = state.orders.map((o) => (o.status === 'new' ? { ...o, createdAt: new Date(Date.now() - 12 * 60000).toISOString() } : o))
    render(<DemoStoreProvider initialState={{ ...state, orders }}><Queue /></DemoStoreProvider>)
    expect(within(cards('New')[0]).getByText('Late · 12 min')).toBeTruthy()
  })

  it('a paid ticket keeps its options after the menu is edited', () => {
    const state = buildSeed(42, new Date())
    const order = buildOrder(state, { customerName: 'Zed', lines: [{ itemId: 'item-latte', options: { size: 'L', milk: 'oat', extraShot: true, sugar: 100 }, qty: 1 }], payment: 'cash' }, new Date())
    const menu = state.menu.map((m) => (m.id === 'item-latte' ? { ...m, allowsShot: false } : m))
    render(<DemoStoreProvider initialState={{ ...state, menu, orders: [...state.orders, order] }}><Queue /></DemoStoreProvider>)
    const card = cards('New').find((c) => within(c).getByRole('heading').textContent === 'Zed')
    expect(within(card).getByText('L · Oat · +shot')).toBeTruthy()
  })

  it('each column is a tabpanel labelled by its tab', () => {
    show()
    const tab = screen.getByRole('tab', { name: /^Brewing/ })
    expect(tab.getAttribute('aria-controls')).toBe(column('Brewing').id)
    expect(column('Brewing').getAttribute('aria-labelledby')).toBe(tab.id)
  })
})
