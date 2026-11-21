import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { shopConfig } from '../config/shop.config.js'
import { formatPeso, kilo } from '../lib/money.js'

const SALES = 'var(--color-accent)'
const PROFIT = 'var(--color-rail)'
const tick = { fontSize: 12, fill: 'var(--color-muted)' }
const cursor = { fill: 'var(--color-soft)', fillOpacity: 0.6 }
const grid = <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-line)" />
const yAxis = <YAxis width={44} tickCount={4} tickLine={false} axisLine={false} tick={{ ...tick, fontSize: 11 }} tickFormatter={kilo} />
const shortDay = new Intl.DateTimeFormat(shopConfig.locale, { month: 'short', day: 'numeric' })

export const hourLabel = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`
// 'YYYY-MM-DD' read as a local day
export const dayLabel = (day) => shortDay.format(new Date(`${day}T00:00`))

// rows: [{ label, ...values }]; series: [[key, name]] shown in that order
function PesoTooltip({ active, payload, series }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="text-muted">{d.label}</div>
      {series.map(([key, name]) => (
        <div key={key} className="mt-0.5 flex justify-between gap-4 text-ink">
          <span>{name}</span>
          <span className="font-semibold tabular-nums">{formatPeso(d[key])}</span>
        </div>
      ))}
    </div>
  )
}

function Swatch({ color, line }) {
  return <span aria-hidden="true" className={`inline-block ${line ? 'h-0.5 w-4' : 'size-2.5 rounded-sm'}`} style={{ background: color }} />
}

// rows: salesByHour; the wrapper's aria-label carries what the bars show
export function HourlySalesChart({ rows }) {
  const data = rows.map((r) => ({ ...r, label: hourLabel(r.hour) }))
  const busiest = data.reduce((best, r) => (r.sales > best.sales ? r : best), data[0])
  const total = data.reduce((s, r) => s + r.sales, 0)
  const summary = total
    ? `Sales by hour today: ${formatPeso(total)} in all, busiest at ${busiest.label} with ${formatPeso(busiest.sales)}.`
    : 'Sales by hour today: no sales yet.'
  return (
    <div role="img" aria-label={summary} className="mt-4 h-[220px] min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="18%">
          {grid}
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--color-line)' }} tick={tick} minTickGap={8} />
          {yAxis}
          <Tooltip cursor={cursor} content={<PesoTooltip series={[['sales', 'Sales']]} />} />
          <Bar dataKey="sales" fill={SALES} maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// rows: dailySales, oldest first; bars are sales, the line is profit
export function DailySalesChart({ rows }) {
  const data = rows.map((r) => ({ ...r, label: dayLabel(r.day) }))
  const best = data.reduce((b, r) => (r.sales > b.sales ? r : b), data[0])
  const sales = data.reduce((s, r) => s + r.sales, 0)
  const profit = data.reduce((s, r) => s + r.profit, 0)
  const summary = `Daily sales and profit, last ${data.length} days: ${formatPeso(sales)} sales and ${formatPeso(profit)} profit, best day ${best.label} with ${formatPeso(best.sales)}.`
  return (
    <>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="inline-flex items-center gap-1.5"><Swatch color={SALES} />Sales</li>
        <li className="inline-flex items-center gap-1.5"><Swatch color={PROFIT} line />Profit</li>
      </ul>
      <div role="img" aria-label={summary} className="mt-3 h-[260px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="18%">
            {grid}
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--color-line)' }} tick={tick} minTickGap={16} />
            {yAxis}
            <Tooltip cursor={cursor} content={<PesoTooltip series={[['sales', 'Sales'], ['profit', 'Profit']]} />} />
            <Bar dataKey="sales" fill={SALES} maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line dataKey="profit" stroke={PROFIT} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: PROFIT }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
