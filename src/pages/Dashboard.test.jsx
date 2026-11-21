// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { buildSeed } from '../data/seed.js'
import { ordersOn, summary } from '../data/reports.js'
import { formatPeso } from '../lib/money.js'
import { Dashboard, deltaText } from './Dashboard.jsx'

// jsdom has no ResizeObserver, which the chart's ResponsiveContainer needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }

afterEach(cleanup)

const today = new Date()
const state = buildSeed(42, today)
const todays = summary(ordersOn(state.orders, today), state.menu)
const show = (role) =>
  render(
    <MemoryRouter>
      <RoleProvider initialRole={role}>
        <DemoStoreProvider initialState={state}>
          <Dashboard />
        </DemoStoreProvider>
      </RoleProvider>
    </MemoryRouter>,
  )
const card = (label) => screen.getByText(label).closest('div')

describe('Dashboard', () => {
  it('as barista shows no profit, in words or figures', () => {
    show('barista')
    expect(screen.queryByText(/profit/i)).toBeNull()
    expect(screen.queryByText(formatPeso(todays.profit))).toBeNull()
    expect(screen.getByText('Sales today')).toBeTruthy()
  })

  it('as owner shows Profit today with its figure', () => {
    show('owner')
    expect(within(card('Profit today')).getByText(formatPeso(todays.profit))).toBeTruthy()
  })

  it("shows today's sales, orders, cups and average from the orders", () => {
    show('barista')
    expect(within(card('Sales today')).getByText(formatPeso(todays.sales))).toBeTruthy()
    expect(within(card('Orders')).getByText(String(todays.orders))).toBeTruthy()
    expect(within(card('Cups sold')).getByText(String(todays.cups))).toBeTruthy()
    expect(within(card('Average order')).getByText(formatPeso(todays.avgOrder))).toBeTruthy()
  })

  it('counts open orders and links to the queue and inventory', () => {
    show('barista')
    const open = state.orders.filter((o) => o.status !== 'done').length
    expect(within(card('Open orders')).getByText(String(open))).toBeTruthy()
    expect(screen.getByRole('link', { name: /queue/i }).getAttribute('href')).toBe('/queue')
    expect(screen.getByRole('link', { name: /inventory/i }).getAttribute('href')).toBe('/inventory')
    expect(screen.getByText('Oat milk')).toBeTruthy()
  })
})

describe('deltaText', () => {
  it('says up, down or the same, in words', () => {
    expect(deltaText(1200, 1000, 'Saturday')).toBe('Up ₱200 vs last Saturday at this time')
    expect(deltaText(800, 1000, 'Saturday')).toBe('Down ₱200 vs last Saturday at this time')
    expect(deltaText(1000, 1000, 'Saturday')).toBe('Same as last Saturday at this time')
  })
})
