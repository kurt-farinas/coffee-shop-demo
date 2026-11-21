import { useNavigate } from 'react-router-dom'
import { PiArrowRight } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { ROLES, homeFor } from '../auth/roles.js'
import { shopConfig } from '../config/shop.config.js'
import { Photo } from '../components/Photo.jsx'

const CHOICES = [
  { role: 'owner', line: 'Full access: sales, costs, profit, menu and staff.' },
  { role: 'barista', line: 'Takes orders, makes drinks, checks stock. No costs or profit.' },
]

export function Login() {
  const { login } = useRole()
  const navigate = useNavigate()
  const enter = (role) => {
    login(role)
    navigate(homeFor(role))
  }
  return (
    <main className="grid min-h-dvh bg-page md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative h-[38vh] overflow-hidden bg-rail md:order-2 md:h-auto">
        <Photo src={shopConfig.heroImage} label={shopConfig.name} className="size-full text-8xl" />
      </div>

      <div className="flex flex-col px-5 py-10 md:px-14 md:py-14 lg:px-20">
        <h1 className="font-heading text-5xl leading-[0.95] font-medium tracking-tight text-balance md:text-7xl">{shopConfig.name}</h1>
        <p className="mt-5 mb-10 max-w-md text-lg text-muted">{shopConfig.tagline}</p>

        <section aria-labelledby="pick-role" className="rule pt-6 md:mt-auto">
          <h2 id="pick-role" className="font-heading text-2xl font-medium">
            Who is on shift?
          </h2>
          <ul className="mt-4 divide-y divide-line border-b border-line">
            {CHOICES.map(({ role, line }) => (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => enter(role)}
                  className="group flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-soft/60 md:-mx-3 md:w-[calc(100%+1.5rem)] md:px-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-heading text-3xl font-medium">{ROLES[role].label}</span>
                      <span className="text-sm text-muted">{ROLES[role].person}</span>
                    </span>
                    <span className="mt-1 block text-[15px] text-muted">{line}</span>
                  </span>
                  <span className={`${role === 'owner' ? 'btn-primary' : 'btn-ghost'} shrink-0`}>
                    <span className="sr-only md:not-sr-only">Log in as {ROLES[role].label}</span>
                    <PiArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-muted">A demo with sample data. No password needed, and it resets when you reload.</p>
        </section>
      </div>
    </main>
  )
}
