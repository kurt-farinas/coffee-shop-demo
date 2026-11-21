import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiClock, PiWarning } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { columns, isLate, waitLabel } from './queueView.js'

const COLUMNS = [
  { key: 'new', label: 'New', action: 'Start brewing', empty: 'No new orders. Time for a quick wipe-down.' },
  { key: 'brewing', label: 'Brewing', action: 'Mark ready', empty: 'Nothing on the bar right now.' },
  { key: 'ready', label: 'Ready', action: 'Picked up', empty: 'No drinks waiting for pickup.' },
]

function OrderCard({ order, action, now, onAdvance }) {
  const late = isLate(order.createdAt, now)
  return (
    <article className={`rounded-2xl border p-4 ${late ? 'border-warn-ink/30 bg-warn-bg text-warn-ink' : 'border-line bg-surface'}`}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold">{order.id}</span>
        <span className="inline-flex items-center gap-1 font-medium">
          {late ? <PiWarning aria-hidden="true" className="size-4" /> : <PiClock aria-hidden="true" className="size-4" />}
          {late ? `Late · ${waitLabel(order.createdAt, now)}` : waitLabel(order.createdAt, now)}
        </span>
      </div>
      <h3 className="mt-1 font-heading text-2xl font-semibold break-words">{order.customerName}</h3>
      <ul className="mt-3 space-y-2">
        {order.lines.map((l, i) => {
          const opts = l.label
          return (
            <li key={i}>
              <span className="font-medium">{l.qty}× {l.name}</span>
              {opts && <span className={`block text-sm ${late ? '' : 'text-muted'}`}>{opts}</span>}
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={() => onAdvance(order)}
        className="mt-4 min-h-11 w-full rounded-full bg-accent px-4 text-sm font-semibold text-ink transition hover:brightness-95"
      >
        {action}
      </button>
    </article>
  )
}

export function Queue() {
  const { state, advanceOrder } = useDemoStore()
  const [now, setNow] = useState(() => new Date())
  const [tab, setTab] = useState('new')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const cols = columns(state.orders)
  const lockedUntil = useRef({}) // per column: a second tap within 400 ms is ignored
  const advance = (order) => {
    if (Date.now() < (lockedUntil.current[order.status] ?? 0)) return
    lockedUntil.current[order.status] = Date.now() + 400
    if (order.status === 'brewing') toast.success(`${order.id} ready for ${order.customerName}`)
    advanceOrder(order.id)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold">Order queue</h1>

      <div role="tablist" aria-label="Queue columns" className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-soft p-1 md:hidden">
        {COLUMNS.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            id={`tab-${c.key}`}
            aria-selected={tab === c.key}
            aria-controls={`col-${c.key}`}
            onClick={() => setTab(c.key)}
            className={`min-h-11 rounded-full text-sm font-semibold ${tab === c.key ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}
          >
            {c.label} {cols[c.key].length}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-3">
        {COLUMNS.map((c) => (
          <section key={c.key} id={`col-${c.key}`} role="tabpanel" aria-labelledby={`tab-${c.key}`} className={tab === c.key ? '' : 'hidden md:block'}>
            <h2 id={`head-${c.key}`} className="flex items-center gap-2 max-md:sr-only text-sm font-semibold tracking-[0.15em] text-muted uppercase">
              {c.label}
              <span className="rounded-full bg-soft px-2 py-0.5 text-xs tracking-normal text-ink">{cols[c.key].length}</span>
            </h2>
            <div className="mt-3 space-y-3">
              {cols[c.key].length === 0 && <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{c.empty}</p>}
              {cols[c.key].map((o) => (
                <OrderCard key={o.id} order={o} action={c.action} now={now} onAdvance={advance} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
