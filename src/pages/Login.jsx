import { useNavigate } from 'react-router-dom'
import { PiArrowRight, PiCoffee, PiCoffeeBean, PiCrown } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { ROLES, homeFor } from '../auth/roles.js'
import { shopConfig } from '../config/shop.config.js'

const CHOICES = [
  { role: 'owner', icon: PiCrown, line: 'Full access' },
  { role: 'barista', icon: PiCoffee, line: 'Takes orders, makes drinks, checks stock. No costs or profit.' },
]

export function Login() {
  const { login } = useRole()
  const navigate = useNavigate()
  const enter = (role) => {
    login(role)
    navigate(homeFor(role))
  }
  return (
    <main className="min-h-dvh bg-page">
      <header className="bg-rail px-5 pt-10 pb-28 text-center text-rail-ink md:pt-16 md:pb-36">
        <PiCoffeeBean aria-hidden="true" className="mx-auto size-10 text-highlight" />
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight md:text-6xl">{shopConfig.name}</h1>
        <div aria-hidden="true" className="mx-auto mt-5 flex w-40 items-center gap-2 text-highlight">
          <span className="h-px flex-1 bg-highlight" />
          <PiCoffeeBean className="size-3" />
          <span className="h-px flex-1 bg-highlight" />
        </div>
        <p className="mx-auto mt-5 max-w-md text-base md:text-lg">{shopConfig.tagline}</p>
      </header>

      <section aria-labelledby="pick-role" className="mx-auto -mt-20 max-w-3xl px-5 pb-12 md:-mt-24">
        <h2 id="pick-role" className="text-center text-sm font-semibold tracking-[0.2em] text-rail-ink uppercase">
          Who is on shift?
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {CHOICES.map(({ role, icon: Icon, line }) => (
            <button
              key={role}
              type="button"
              onClick={() => enter(role)}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-6 text-left text-ink shadow-[0_12px_30px_-18px_rgb(43_25_15/0.6)] transition hover:-translate-y-0.5 hover:border-accent focus-visible:border-accent"
            >
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-soft text-accent-ink">
                <Icon className="size-6" />
              </span>
              <span className="mt-4 font-heading text-2xl font-semibold">{ROLES[role].label}</span>
              <span className="text-sm text-muted">{ROLES[role].person}</span>
              <span className="mt-3 text-[15px]">{line}</span>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
                Log in as {ROLES[role].label}
                <PiArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-muted">A demo with sample data. No password needed, and it resets when you reload.</p>
      </section>
    </main>
  )
}
