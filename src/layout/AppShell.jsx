import { useRef } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { PiCoffeeBean, PiList, PiSignOut, PiX } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { PAGES, ROLES, canSee } from '../auth/roles.js'
import { shopConfig } from '../config/shop.config.js'

function Brand() {
  return (
    <span className="flex min-w-0 items-center gap-2 font-heading text-xl font-semibold text-rail-ink">
      <PiCoffeeBean aria-hidden="true" className="size-6 shrink-0 text-highlight" />
      <span className="truncate">{shopConfig.name}</span>
    </span>
  )
}

function NavItems({ role, onNavigate }) {
  return PAGES.filter((p) => canSee(role, p.key)).map((p) => (
    <NavLink
      key={p.key}
      to={p.path}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex min-h-11 items-center gap-3 rounded-full px-4 text-sm transition-colors ${
          isActive ? 'bg-highlight font-semibold text-ink' : 'font-medium text-rail-ink hover:bg-rail-active'
        }`
      }
    >
      <p.icon aria-hidden="true" className="size-5 shrink-0" />
      {p.label}
    </NavLink>
  ))
}

export function AppShell() {
  const { role, logout } = useRole()
  const navigate = useNavigate()
  const menu = useRef(null)
  if (!role) return <Navigate to="/login" replace />

  const signOut = () => {
    logout()
    navigate('/login')
  }
  const closeMenu = () => menu.current?.close()
  const who = ROLES[role]

  return (
    <div className="flex min-h-dvh">
      <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 overflow-y-auto bg-rail px-4 py-6 md:flex">
        <div className="px-2 pb-8">
          <Brand />
        </div>
        <NavItems role={role} />
        <p className="mt-auto px-2 text-xs text-rail-ink">Demo · sample data, resets on reload</p>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 bg-rail px-1 md:h-16 md:border-b md:border-line md:bg-surface md:px-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => menu.current?.showModal()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-rail-ink md:hidden"
          >
            <PiList aria-hidden="true" className="size-6" />
          </button>
          <span className="min-w-0 md:hidden">
            <Brand />
          </span>
          <span className="ml-auto flex min-w-0 items-center gap-2 text-sm">
            <span className="rounded-full bg-highlight px-3 py-1 font-semibold text-ink">{who.label}</span>
            <span className="hidden truncate text-muted md:inline">{who.person}</span>
          </span>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium text-rail-ink md:border md:border-line md:px-4 md:text-ink md:hover:bg-soft"
          >
            <PiSignOut aria-hidden="true" className="size-5" />
            <span className="sr-only md:not-sr-only">Log out</span>
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      <dialog
        ref={menu}
        aria-label="Menu"
        onClick={(e) => e.target === menu.current && closeMenu()}
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-rail p-0 text-rail-ink backdrop:bg-rail-active/60"
      >
        <div className="flex h-full flex-col gap-1 px-4 py-5">
          <div className="flex items-center justify-between pb-6 pl-2">
            <Brand />
            <button type="button" aria-label="Close menu" onClick={closeMenu} className="inline-flex size-11 items-center justify-center rounded-full text-rail-ink">
              <PiX aria-hidden="true" className="size-5" />
            </button>
          </div>
          <NavItems role={role} onNavigate={closeMenu} />
        </div>
      </dialog>
    </div>
  )
}
