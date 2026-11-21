import { Link } from 'react-router-dom'
import { PiArrowDown, PiArrowRight, PiArrowUp, PiCheckCircle, PiEquals, PiWarning } from 'react-icons/pi'
import { ROLES, canSee } from '../auth/roles.js'
import { useRole } from '../auth/RoleProvider.jsx'
import { shopConfig } from '../config/shop.config.js'
import { useDemoStore } from '../data/DemoStore.jsx'
import { bestSellers, ordersOn, salesByHour, summary } from '../data/reports.js'
import { HourlySalesChart } from '../components/SalesCharts.jsx'
import { formatPeso } from '../lib/money.js'
import { formatAmount, sortForDisplay, stockState } from './inventoryView.js'

const longDate = new Intl.DateTimeFormat(shopConfig.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const weekdayName = new Intl.DateTimeFormat(shopConfig.locale, { weekday: 'long' })
const WEEK = 7 * 24 * 60 * 60000

export function deltaText(now, before, weekday) {
  const diff = now - before
  if (!diff) return `Same as last ${weekday} at this time`
  return `${diff > 0 ? 'Up' : 'Down'} ${formatPeso(Math.abs(diff))} vs last ${weekday} at this time`
}

const greeting = (hour) => (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')

export function Stat({ label, value, children }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-heading text-2xl font-semibold tabular-nums">{value}</dd>
      {children}
    </div>
  )
}

export const card = 'rounded-2xl border border-line bg-surface p-4 md:p-5'
const linkClass = 'mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition hover:bg-soft'

export function Dashboard() {
  const { state } = useDemoStore()
  const { role } = useRole()
  const now = new Date()
  const todays = ordersOn(state.orders, now)
  const s = summary(todays, state.menu)
  // last week's same day only up to this time of day, so a morning isn't compared with a whole day
  const weekAgo = new Date(now.getTime() - WEEK)
  const before = ordersOn(state.orders, weekAgo).filter((o) => new Date(o.createdAt) <= weekAgo)
  const beforeSales = before.reduce((sum, o) => sum + o.total, 0)
  const diff = s.sales - beforeSales
  const DeltaIcon = diff > 0 ? PiArrowUp : diff < 0 ? PiArrowDown : PiEquals
  const top = bestSellers(todays, 5)
  const low = sortForDisplay(state.ingredients).filter((i) => stockState(i) !== 'ok')
  const open = state.orders.filter((o) => o.status !== 'done').length

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold">
        {greeting(now.getHours())}, {ROLES[role].person.split(' ')[0]}
      </h1>
      <p className="mt-1 text-muted">{longDate.format(now)}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Sales today" value={formatPeso(s.sales)}>
          <p className={`mt-1 inline-flex items-start gap-1 text-xs font-semibold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted'}`}>
            <DeltaIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            {deltaText(s.sales, beforeSales, weekdayName.format(weekAgo))}
          </p>
        </Stat>
        <Stat label="Orders" value={s.orders} />
        <Stat label="Cups sold" value={s.cups} />
        <Stat label="Average order" value={formatPeso(s.avgOrder)} />
        {canSee(role, 'profit') && <Stat label="Profit today" value={formatPeso(s.profit)} />}
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="hourly" className={`${card} min-w-0 lg:col-span-2`}>
          <h2 id="hourly" className="font-heading text-xl font-semibold">Sales by hour</h2>
          <HourlySalesChart rows={salesByHour(todays)} />
        </section>

        <section aria-labelledby="best" className={card}>
          <h2 id="best" className="font-heading text-xl font-semibold">Best sellers today</h2>
          {top.length ? (
            <ol className="mt-3 divide-y divide-line">
              {top.map((item, i) => (
                <li key={item.itemId} className="flex items-baseline gap-3 py-2.5">
                  <span className="w-4 text-sm text-muted tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 font-semibold break-words">{item.name}</span>
                  <span className="text-sm text-muted tabular-nums">{item.qty} sold</span>
                  <span className="text-sm font-semibold tabular-nums">{formatPeso(item.sales)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted">No sales yet today.</p>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="low" className={card}>
          <h2 id="low" className="font-heading text-xl font-semibold">Low stock</h2>
          {low.length ? (
            <ul className="mt-3 divide-y divide-line">
              {low.map((ing) => (
                <li key={ing.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="font-semibold">{ing.name}</span>
                  <span className="inline-flex items-center gap-2 text-sm">
                    {formatAmount(ing.stock, ing.unit)} left
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${stockState(ing) === 'out' ? 'bg-danger text-surface' : 'bg-warn-bg text-warn-ink'}`}>
                      <PiWarning aria-hidden="true" className="size-3.5" />
                      {stockState(ing) === 'out' ? 'Out' : 'Low'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-success">
              <PiCheckCircle aria-hidden="true" className="size-5" />
              All stock is healthy
            </p>
          )}
          <Link to="/inventory" className={linkClass}>
            Go to inventory <PiArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </section>

        <section aria-labelledby="open" className={card}>
          <h2 id="open" className="font-heading text-xl font-semibold">Order queue</h2>
          <dl className="mt-3">
            <div>
              <dt className="text-sm text-muted">Open orders</dt>
              <dd className="mt-1 font-heading text-4xl font-semibold tabular-nums">{open}</dd>
            </div>
          </dl>
          <Link to="/queue" className={linkClass}>
            Open the queue <PiArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
