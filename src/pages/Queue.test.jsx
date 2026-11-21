// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { Queue } from './Queue.jsx'

afterEach(cleanup)

const column = (name) => screen.getByRole('region', { name: new RegExp(`^${name}`) })
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
})
