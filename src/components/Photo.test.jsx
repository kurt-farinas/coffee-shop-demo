// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Photo } from './Photo.jsx'

afterEach(cleanup)

describe('Photo', () => {
  it('shows the first letter when there is no photo', () => {
    const { container } = render(<Photo label="Spanish latte" />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('S')).toBeTruthy()
  })

  it('shows the photo when it has a src', () => {
    const { container } = render(<Photo src="https://example.com/latte.jpg" label="Latte" />)
    expect(container.querySelector('img').getAttribute('src')).toBe('https://example.com/latte.jpg')
  })

  it('falls back to the letter when the photo fails to load', () => {
    const { container } = render(<Photo src="https://example.com/broken.jpg" label="Latte" />)
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('L')).toBeTruthy()
  })
})
