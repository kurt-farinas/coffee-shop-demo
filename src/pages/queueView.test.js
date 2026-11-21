import { describe, it, expect } from 'vitest'
import { columns, waitLabel, isLate } from './queueView.js'

const at = (min) => new Date(Date.UTC(2026, 0, 1, 9, min)).toISOString()
const order = (id, status, min) => ({ id, status, createdAt: at(min) })
const start = new Date('2026-01-01T09:00:00Z')
const after = (ms) => new Date(start.getTime() + ms)

describe('columns', () => {
  it('leaves out done orders and puts the oldest first', () => {
    const cols = columns([order('a', 'new', 5), order('b', 'done', 1), order('c', 'new', 2), order('d', 'brewing', 3), order('e', 'ready', 4)])
    expect(cols).toEqual({
      new: [order('c', 'new', 2), order('a', 'new', 5)],
      brewing: [order('d', 'brewing', 3)],
      ready: [order('e', 'ready', 4)],
    })
  })
})

describe('waitLabel', () => {
  it('says Just now under a minute', () => expect(waitLabel(start.toISOString(), after(30_000))).toBe('Just now'))
  it('counts whole minutes', () => expect(waitLabel(start.toISOString(), after(5 * 60_000 + 10_000))).toBe('5 min'))
})

describe('isLate', () => {
  it('is not late at 9:59', () => expect(isLate(start.toISOString(), after(9 * 60_000 + 59_000))).toBe(false))
  it('is late at 10:00', () => expect(isLate(start.toISOString(), after(10 * 60_000))).toBe(true))
})
