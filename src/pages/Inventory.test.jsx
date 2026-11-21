// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { Inventory } from './Inventory.jsx'

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))

// jsdom has no modal dialog
HTMLDialogElement.prototype.showModal ??= function () {
  this.open = true
}
HTMLDialogElement.prototype.close ??= function () {
  this.open = false
  this.dispatchEvent(new Event('close'))
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const show = (role) => render(<RoleProvider initialRole={role}><DemoStoreProvider><Inventory /></DemoStoreProvider></RoleProvider>)
const row = (name) => screen.getAllByRole('row').find((r) => within(r).queryByRole('rowheader', { name }))

async function restockOat(amount) {
  await userEvent.click(within(row('Oat milk')).getByRole('button', { name: /Restock/ }))
  await userEvent.type(screen.getByLabelText('Amount (ml)'), amount)
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
}

describe('Inventory', () => {
  it('as barista shows no cost column or values', () => {
    show('barista')
    expect(screen.queryByRole('columnheader', { name: /Cost/ })).toBeNull()
    expect(screen.queryByText(/₱/)).toBeNull()
    expect(screen.queryByText(/Total stock value/)).toBeNull()
  })

  it('as owner shows cost per unit, stock value and the total', () => {
    show('owner')
    expect(screen.getByRole('columnheader', { name: /Cost/ })).toBeTruthy()
    expect(within(row('Oat milk')).getByText(/₱0\.25 \/ ml/)).toBeTruthy()
    expect(within(row('Oat milk')).getByText(/₱225/)).toBeTruthy()
    expect(screen.getByText(/Total stock value/)).toBeTruthy()
  })

  it('sums the low items on top and lists them first', () => {
    show('barista')
    expect(screen.getByText('2 items low on stock')).toBeTruthy()
    const names = screen.getAllByRole('rowheader').map((h) => h.textContent)
    expect(names.slice(0, 2)).toEqual(['Cups', 'Oat milk'])
  })

  it('restocking oat milk by 1000 raises its stock and clears its Low badge', async () => {
    show('barista')
    expect(within(row('Oat milk')).getByText('900 ml')).toBeTruthy()
    expect(within(row('Oat milk')).getByText('Low')).toBeTruthy()
    await restockOat('1000')
    expect(within(row('Oat milk')).getByText('1.9 L')).toBeTruthy()
    expect(within(row('Oat milk')).queryByText('Low')).toBeNull()
    expect(toast.success).toHaveBeenCalledWith('Added 1,000 ml Oat milk')
    expect(screen.getByText('1 item low on stock')).toBeTruthy()
  })

  it('rejects 2.5 with an inline error and leaves stock alone', async () => {
    show('barista')
    await restockOat('2.5')
    expect(screen.getByRole('alert').textContent).toMatch(/whole number/)
    expect(within(row('Oat milk')).getByText('900 ml')).toBeTruthy()
    expect(toast.success).not.toHaveBeenCalled()
  })
})
