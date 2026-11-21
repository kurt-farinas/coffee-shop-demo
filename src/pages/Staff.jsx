import { useState } from 'react'
import { PiCheckCircle, PiPhone, PiWarning } from 'react-icons/pi'
import { ROLES } from '../auth/roles.js'
import { useDemoStore } from '../data/DemoStore.jsx'
import { WEEK, dayOf, initials, onShift, tenureLabel, weekRoster } from './staffView.js'

const FILTERS = [{ key: 'all', label: 'All' }, ...Object.entries(ROLES).map(([key, r]) => ({ key, label: r.label }))]
const th = 'px-3 py-3 text-left text-xs font-semibold tracking-[0.15em] text-muted uppercase sm:px-4'
const td = 'px-3 py-3 align-top sm:px-4'

function WeekStrip({ schedule, today }) {
  return (
    <ol aria-label="Work days" className="mt-4 grid grid-cols-7 gap-1">
      {WEEK.map((day) => {
        const works = schedule.includes(day)
        return (
          <li
            key={day}
            className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold ${works ? 'bg-rail text-rail-ink' : 'bg-soft text-muted'} ${day === today ? 'outline-2 outline-offset-2 outline-ink' : ''}`}
          >
            <span aria-hidden="true">{day[0]}</span>
            <span className="sr-only">
              {day}: {works ? 'works' : 'off'}
              {day === today && ', today'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function PersonCard({ person, now }) {
  const on = onShift(person, now)
  return (
    <li data-testid="staff-card" className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-lg font-semibold text-ink">
          {initials(person.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold [overflow-wrap:anywhere]">{person.name}</h3>
          <p className="text-sm text-muted">{ROLES[person.role].label}</p>
          {on && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success">
              <PiCheckCircle aria-hidden="true" className="size-4" />
              On shift today
            </span>
          )}
        </div>
      </div>
      <a href={`tel:${person.phone.replace(/\D/g, '')}`} className="mt-3 inline-flex min-h-11 items-center gap-2 font-medium underline-offset-4 hover:underline">
        <PiPhone aria-hidden="true" className="size-4" />
        {person.phone}
      </a>
      <p className="text-sm text-muted">{tenureLabel(person.hiredOn, now)}</p>
      <WeekStrip schedule={person.schedule} today={dayOf(now)} />
    </li>
  )
}

function Names({ names }) {
  if (names.length) return names.join(', ')
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warn-bg px-2 py-0.5 text-sm font-semibold text-warn-ink">
      <PiWarning aria-hidden="true" className="size-4" />
      Nobody scheduled
    </span>
  )
}

export function Staff() {
  const { state } = useDemoStore()
  const [filter, setFilter] = useState('all')
  const now = new Date()
  const { staff } = state
  const shown = filter === 'all' ? staff : staff.filter((p) => p.role === filter)
  const onToday = staff.filter((p) => onShift(p, now)).length

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold">Staff</h1>
      <p className="mt-1 text-muted">
        {staff.length} {staff.length === 1 ? 'person' : 'people'} · {onToday} on shift today
      </p>

      <div role="group" aria-label="Filter by role" className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${filter === f.key ? 'border-rail bg-rail text-rail-ink' : 'border-line bg-surface hover:bg-soft'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => (
          <PersonCard key={p.id} person={p} now={now} />
        ))}
      </ul>

      <section aria-labelledby="week-title" className="mt-8">
        <h2 id="week-title" className="font-heading text-xl font-semibold">This week</h2>
        <table className="mt-3 w-full overflow-hidden rounded-2xl border border-line bg-surface">
          <thead className="border-b border-line bg-soft">
            <tr>
              <th scope="col" className={th}>Day</th>
              <th scope="col" className={th}>Baristas on shift</th>
            </tr>
          </thead>
          <tbody>
            {weekRoster(staff).map((r) => (
              <tr key={r.day} className="border-b border-line last:border-0">
                <th scope="row" className={`${td} text-left font-semibold`}>{r.day}</th>
                <td className={td}><Names names={r.baristas} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
