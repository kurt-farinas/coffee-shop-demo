// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { buildSeed } from '../data/seed.js'
import { ordersBetween, summary } from '../data/reports.js'
import { formatPeso } from '../lib/money.js'
import { SalesReport } from './SalesReport.jsx'

// jsdom has no ResizeObserver, which the chart's ResponsiveContainer needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }

afterEach(cleanup)

const today = new Date()
const state = buildSeed(42, today)
const totals = (days) => summary(ordersBetween(state.orders, today, days), state.menu)
const card = (label) => screen.getByText(label, { selector: 'dt' }).closest('div')
const num = (n) => n.toLocaleString('en-PH')

describe('SalesReport', () => {
  it('the range toggle switches the totals between 30 and 7 days', async () => {
    render(<DemoStoreProvider initialState={state}><SalesReport /></DemoStoreProvider>)
    expect(within(card('Orders')).getByText(num(totals(30).orders))).toBeTruthy()
    expect(within(card('Sales')).getByText(formatPeso(totals(30).sales))).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: '7 days' }))
    expect(screen.getByRole('button', { name: '7 days' }).getAttribute('aria-pressed')).toBe('true')
    expect(totals(7).orders).toBeLessThan(totals(30).orders)
    expect(within(card('Orders')).getByText(num(totals(7).orders))).toBeTruthy()
    expect(within(card('Profit')).getByText(formatPeso(totals(7).profit))).toBeTruthy()
  })
})
