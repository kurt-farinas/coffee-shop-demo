import { PiHourglassMedium } from 'react-icons/pi'

const PHASE = { pos: 2, queue: 2, menu: 3, inventory: 3, dashboard: 4, 'sales-report': 4, staff: 4 }

export function ComingSoon({ page }) {
  return (
    <section className="rounded-md border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span aria-hidden="true" className="mx-auto grid size-12 place-items-center rounded-full bg-soft text-accent-ink">
        <PiHourglassMedium className="size-6" />
      </span>
      <h1 className="mt-4 font-heading text-3xl font-medium">{page.label}</h1>
      <p className="mt-2 text-sm text-muted">This page is still brewing. Coming in Phase {PHASE[page.key]}.</p>
    </section>
  )
}
