// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { RequireRole } from './RequireRole.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function textAt(role, path, page) {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/" element={<p>dashboard</p>} />
            <Route path="/queue" element={<p>queue</p>} />
            <Route path="/login" element={<p>login</p>} />
            <Route path={path} element={<RequireRole page={page}><p>allowed</p></RequireRole>} />
          </Routes>
        </MemoryRouter>
      </RoleProvider>,
    ),
  )
  const text = el.textContent
  act(() => root.unmount())
  return text
}

describe('RequireRole', () => {
  it('sends a barista on the POS to the queue', () => {
    expect(textAt('barista', '/pos', 'pos')).toBe('queue')
  })

  it('sends a cashier on the menu manager to the dashboard', () => {
    expect(textAt('cashier', '/menu', 'menu')).toBe('dashboard')
  })

  it('sends a visitor with no role to /login', () => {
    expect(textAt(null, '/pos', 'pos')).toBe('login')
  })

  it('shows the page to a role that can see it', () => {
    expect(textAt('owner', '/menu', 'menu')).toBe('allowed')
  })
})
