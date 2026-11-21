import { useState } from 'react'
import { shopConfig } from '../config/shop.config.js'
import { useDemoStore } from '../data/DemoStore.jsx'
import { dailySales, itemSales, ordersBetween, paymentShares, paymentSplit, salesByCategory, summary } from '../data/reports.js'
import { DailySalesChart } from '../components/SalesCharts.jsx'
import { formatPeso } from '../lib/money.js'
import { Stat, card } from './Dashboard.jsx'

const RANGES = [7, 30]
const count = new Intl.NumberFormat(shopConfig.locale)
const th = 'px-2 py-2 text-xs font-semibold tracking-[0.1em] text-muted uppercase md:px-3'
const td = 'px-2 py-2.5 tabular-nums md:px-3'

// rows: [{ key, name, qty, sales, profit }]
function SalesTable({ caption, first, rows }) {
  return (
    <table className="mt-3 w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="border-b border-line">
        <tr>
          <th scope="col" className={`${th} text-left`}>{first}</th>
          <th scope="col" className={`${th} text-right`}>Qty</th>
          <th scope="col" className={`${th} text-right`}>Sales</th>
          <th scope="col" className={`${th} text-right`}>Profit</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((r) => (
          <tr key={r.key}>
            <th scope="row" className="px-2 py-2.5 text-left font-semibold break-words md:px-3">{r.name}</th>
            <td className={`${td} text-right`}>{count.format(r.qty)}</td>
            <td className={`${td} text-right`}>{formatPeso(r.sales)}</td>
            <td className={`${td} text-right`}>{formatPeso(r.profit)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function SalesReport() {
  const { state } = useDemoStore()
  const [days, setDays] = useState(30)
  const now = new Date()
  const orders = ordersBetween(state.orders, now, days)
  const s = summary(orders, state.menu)
  const pay = paymentSplit(orders)
  const shares = paymentShares(pay)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold">Sales report</h1>
        <div role="group" aria-label="Date range" className="inline-flex rounded-full border border-line bg-surface p-1">
          {RANGES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={days === n}
              onClick={() => setDays(n)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${days === n ? 'bg-highlight text-ink' : 'text-muted hover:bg-soft'}`}
            >
              {n} days
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-muted">Last {days} days, today included</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sales" value={formatPeso(s.sales)} />
        <Stat label="Profit" value={formatPeso(s.profit)} />
        <Stat label="Orders" value={count.format(s.orders)} />
        <Stat label="Average order" value={formatPeso(s.avgOrder)} />
      </dl>

      <section aria-labelledby="daily" className={`${card} mt-4 min-w-0`}>
        <h2 id="daily" className="font-heading text-xl font-semibold">Daily sales</h2>
        <DailySalesChart rows={dailySales(orders, now, days)} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="by-item" className={`${card} min-w-0`}>
          <h2 id="by-item" className="font-heading text-xl font-semibold">By item</h2>
          <SalesTable caption="Sales by item" first="Item" rows={itemSales(orders).map((r) => ({ ...r, key: r.itemId }))} />
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="by-category" className={card}>
            <h2 id="by-category" className="font-heading text-xl font-semibold">By category</h2>
            <SalesTable caption="Sales by category" first="Category" rows={salesByCategory(orders, state.menu).map((r) => ({ ...r, key: r.category, name: r.category }))} />
          </section>

          <section aria-labelledby="payment" className={card}>
            <h2 id="payment" className="font-heading text-xl font-semibold">Cash vs GCash</h2>
            <div aria-hidden="true" className="mt-4 flex h-3 overflow-hidden rounded-full bg-soft">
              <div className="bg-accent" style={{ width: `${shares.cash}%` }} />
              <div className="bg-rail" style={{ width: `${shares.gcash}%` }} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <dt className="inline-flex items-center gap-1.5 text-sm text-muted"><span aria-hidden="true" className="size-2.5 rounded-sm bg-accent" />Cash</dt>
                <dd className="mt-1 font-heading text-xl font-semibold tabular-nums">{formatPeso(pay.cash)}</dd>
                <dd className="text-sm text-muted">{shares.cash}% of sales</dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1.5 text-sm text-muted"><span aria-hidden="true" className="size-2.5 rounded-sm bg-rail" />GCash</dt>
                <dd className="mt-1 font-heading text-xl font-semibold tabular-nums">{formatPeso(pay.gcash)}</dd>
                <dd className="text-sm text-muted">{shares.gcash}% of sales</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}
