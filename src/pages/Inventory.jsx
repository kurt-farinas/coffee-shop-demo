import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiCheckCircle, PiWarning, PiX } from 'react-icons/pi'
import { canSee } from '../auth/roles.js'
import { useRole } from '../auth/RoleProvider.jsx'
import { useDemoStore } from '../data/DemoStore.jsx'
import { formatPeso } from '../lib/money.js'
import { costLabel, formatAmount, parseRestock, restockLabel, sortForDisplay, stockState, stockValue } from './inventoryView.js'

const BADGE = {
  low: { label: 'Low', className: 'bg-warn-bg text-warn-ink' },
  out: { label: 'Out', className: 'bg-danger text-surface' },
}

// below md each row is a card; the small labels stand in for the hidden table header
function Cell({ label, children, className = '' }) {
  return (
    <td className={`lg:table-cell lg:px-4 lg:py-3 ${className}`}>
      <span className="block text-xs text-muted lg:hidden">{label}</span>
      {children}
    </td>
  )
}

export function Inventory() {
  const { state, restock } = useDemoStore()
  const { role } = useRole()
  const showCost = canSee(role, 'cost')
  const sheet = useRef(null)
  const [editing, setEditing] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const rows = sortForDisplay(state.ingredients)
  const lowCount = rows.filter((i) => stockState(i) !== 'ok').length
  const total = rows.reduce((sum, i) => sum + stockValue(i), 0)
  const target = state.ingredients.find((i) => i.id === editing)

  const open = (id) => {
    setEditing(id)
    setAmount('')
    setError('')
    sheet.current.showModal()
  }
  const save = (e) => {
    e.preventDefault()
    const parsed = parseRestock(amount)
    if (parsed.error) return setError(parsed.error)
    restock(target.id, parsed.qty)
    toast.success(`Added ${restockLabel(parsed.qty, target.unit)} ${target.name}`)
    sheet.current.close()
  }

  const th = 'px-4 py-3 text-left label'
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-3xl font-medium">Inventory</h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${lowCount ? 'bg-warn-bg text-warn-ink' : 'bg-success-bg text-success'}`}>
          {lowCount ? <PiWarning aria-hidden="true" className="size-5" /> : <PiCheckCircle aria-hidden="true" className="size-5" />}
          {lowCount ? `${lowCount} ${lowCount === 1 ? 'item' : 'items'} low on stock` : 'All stock is healthy'}
        </p>
        {showCost && (
          <p className="text-sm text-muted">
            Total stock value <span className="ml-1 font-heading text-xl font-medium text-ink">{formatPeso(total)}</span>
          </p>
        )}
      </div>

      <table className="mt-4 block w-full lg:table lg:overflow-hidden lg:rounded-md lg:border lg:border-line lg:bg-surface">
        <thead className="hidden border-b-2 border-rule lg:table-header-group">
          <tr>
            <th scope="col" className={th}>Ingredient</th>
            <th scope="col" className={th}>Stock</th>
            <th scope="col" className={th}>Reorder at</th>
            {showCost && <th scope="col" className={th}>Cost per unit</th>}
            {showCost && <th scope="col" className={th}>Stock value</th>}
            <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="grid gap-3 lg:table-row-group">
          {rows.map((ing) => {
            const badge = BADGE[stockState(ing)]
            return (
              <tr key={ing.id} className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line bg-surface p-4 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:p-0 lg:last:border-b-0">
                <th scope="row" className="col-span-2 text-left font-heading text-xl font-medium break-words lg:table-cell lg:px-4 lg:py-3 lg:font-body lg:text-base">
                  {ing.name}
                </th>
                <Cell label="Stock">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{formatAmount(ing.stock, ing.unit)}</span>
                    {badge && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
                        <PiWarning aria-hidden="true" className="size-3.5" />
                        {badge.label}
                      </span>
                    )}
                  </span>
                </Cell>
                <Cell label="Reorder at"><span>{formatAmount(ing.lowAt, ing.unit)}</span></Cell>
                {showCost && <Cell label="Cost per unit" className="whitespace-nowrap"><span>{costLabel(ing)}</span></Cell>}
                {showCost && <Cell label="Stock value"><span>{formatPeso(stockValue(ing))}</span></Cell>}
                <td className="col-span-2 lg:table-cell lg:px-4 lg:py-3 lg:text-right">
                  <button
                    type="button"
                    aria-label={`Restock ${ing.name}`}
                    onClick={() => open(ing.id)}
                    className="btn-ghost w-full px-4 lg:w-auto"
                  >
                    Restock
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <dialog
        ref={sheet}
        aria-label={target ? `Restock ${target.name}` : 'Restock'}
        // close fires as a queued task; ignore it if a fast tap has already reopened the sheet
        onClose={() => !sheet.current.open && setEditing(null)}
        onClick={(e) => e.target === sheet.current && sheet.current.close()}
        className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-md rounded-t-lg bg-surface p-0 text-ink backdrop:bg-rail-active/60 md:mb-auto md:rounded-lg"
      >
        {target && (
          <form onSubmit={save} noValidate className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-medium">Restock {target.name}</h2>
                <p className="mt-1 text-sm text-muted">In stock: {formatAmount(target.stock, target.unit)}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => sheet.current.close()} className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-soft">
                <PiX aria-hidden="true" className="size-5" />
              </button>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Amount ({target.unit})
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'restock-error' : undefined}
                className="min-h-11 rounded-md border border-line bg-surface px-3 text-base font-normal"
              />
            </label>
            {error && <p id="restock-error" role="alert" className="-mt-2 text-sm font-semibold text-danger">{error}</p>}
            <button type="submit" className="btn-primary min-h-12 px-6 text-base">
              Save
            </button>
          </form>
        )}
      </dialog>
    </div>
  )
}
