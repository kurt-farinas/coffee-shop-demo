import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiCaretUp, PiMinus, PiPlus, PiReceipt, PiTrash, PiX } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { DEFAULT_OPTIONS, MILKS, SHOT, SIZES, SUGAR_LEVELS, choicesFor, linePrice, optionsLabel } from '../data/drinks.js'
import { Photo } from '../components/Photo.jsx'
import { formatPeso } from '../lib/money.js'
import { addLine, canAdd, canMake, cartTotal, setQty } from './posCart.js'

const extra = (add) => (add ? `${add > 0 ? '+' : '−'}${formatPeso(Math.abs(add))}` : '')

const pill = (on) =>
  `inline-flex min-h-11 items-center gap-1.5 rounded-md border px-4 text-sm font-medium transition-colors ${
    on ? 'border-rail bg-rail text-rail-ink' : 'border-line bg-surface text-ink hover:bg-soft'
  } disabled:cursor-not-allowed disabled:opacity-60`

function Choice({ legend, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.value} type="button" disabled={o.out} aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={pill(value === o.value)}>
            {o.label}
            {o.extra && <span className={value === o.value ? 'text-highlight' : 'text-muted'}>{o.extra}</span>}
            {o.out && <span className="text-xs font-semibold text-danger">Out</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Pos() {
  const { state, placeOrder } = useDemoStore()
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [picked, setPicked] = useState(null) // { item, options } while the options sheet is open
  const [name, setName] = useState('')
  const [payment, setPayment] = useState('cash')
  const [cartOpen, setCartOpen] = useState(false) // mobile only
  const sheet = useRef(null)
  const paying = useRef(false)

  const onSale = state.menu.filter((m) => !m.hidden)
  const categories = ['All', ...new Set(onSale.map((m) => m.category))]
  const shown = onSale.filter((m) => category === 'All' || m.category === category)
  const itemOf = (id) => state.menu.find((m) => m.id === id)
  const total = cartTotal(state, cart)
  const count = cart.reduce((n, l) => n + l.qty, 0)

  const tapItem = (item) => {
    if (!Object.values(choicesFor(item)).some(Boolean)) return setCart((c) => addLine(c, { itemId: item.id, options: DEFAULT_OPTIONS, qty: 1 }))
    setPicked({ item, options: DEFAULT_OPTIONS })
  }
  // open once the sheet content is rendered, so focus lands on the first choice (or Add)
  useEffect(() => {
    if (!picked || sheet.current.open) return
    sheet.current.showModal()
    sheet.current.querySelector('fieldset button:not(:disabled), button[data-add]')?.focus()
  }, [picked])
  const setOption = (key, value) => setPicked((p) => ({ ...p, options: { ...p.options, [key]: value } }))
  const addPicked = () => {
    setCart((c) => addLine(c, { itemId: picked.item.id, options: picked.options, qty: 1 }))
    sheet.current.close()
  }

  const pay = () => {
    if (paying.current) return
    paying.current = true
    // released after this tap's batch: a second tap before React re-renders still sees the old cart
    queueMicrotask(() => (paying.current = false))
    const result = placeOrder({ customerName: name, lines: cart, payment })
    if (!result.ok) return toast.error(result.error)
    toast.success(`Order ${result.order.id} sent to the bar`)
    setCart([])
    setName('')
    setCartOpen(false)
  }

  const uses = picked && choicesFor(picked.item)
  const outWith = (change) => picked && !canAdd(state, cart, picked.item.id, { ...picked.options, ...change })

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_24rem] lg:pb-0">
      <section aria-labelledby="pos-title" className="min-w-0">
        <h1 id="pos-title" className="font-heading text-3xl font-medium tracking-tight md:text-4xl">Point of sale</h1>
        <div role="group" aria-label="Category" className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={pill(category === c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
          {shown.map((item) => {
            const out = !canMake(state, item)
            return (
              <button
                key={item.id}
                type="button"
                disabled={out}
                onClick={() => tapItem(item)}
                className="group relative flex flex-col items-stretch overflow-hidden rounded-md border border-line bg-surface text-left transition hover:border-rule disabled:cursor-not-allowed disabled:bg-soft disabled:hover:border-line"
              >
                <span className="block">
                  <Photo src={item.image} label={item.name} className="aspect-[4/3] w-full text-4xl transition-transform duration-200 group-enabled:group-hover:scale-[1.03] group-disabled:opacity-50 group-disabled:grayscale" />
                </span>
                <span className="flex flex-1 flex-col p-3">
                  <span className="font-heading text-lg leading-tight font-medium break-words hyphens-auto">{item.name}</span>
                  <span className="display-num mt-auto pt-1 text-xl text-accent-ink">{formatPeso(item.price)}</span>
                </span>
                {out && <span className="absolute top-2 left-2 rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-danger">Out</span>}
              </button>
            )
          })}
        </div>
      </section>

      <aside
        aria-label="Current order"
        className="fixed inset-x-0 bottom-0 z-10 md:left-60 border-t border-line bg-surface shadow-[0_-12px_30px_-18px_rgb(43_25_15/0.6)] lg:sticky lg:top-6 lg:self-start lg:rounded-md lg:border lg:shadow-none"
      >
        <button
          type="button"
          aria-expanded={cartOpen}
          onClick={() => setCartOpen((o) => !o)}
          className="flex min-h-14 w-full items-center gap-3 bg-rail px-4 text-left text-rail-ink lg:hidden"
        >
          <PiReceipt aria-hidden="true" className="size-6 shrink-0 text-highlight" />
          <span className="flex-1 font-semibold">
            {count} {count === 1 ? 'item' : 'items'} · {formatPeso(total)}
          </span>
          <PiCaretUp aria-hidden="true" className={`size-5 transition-transform ${cartOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`${cartOpen ? 'flex' : 'hidden'} max-h-[70dvh] flex-col gap-4 overflow-y-auto p-4 lg:flex lg:max-h-none lg:p-5`}>
          <h2 className="font-heading text-xl font-medium">Order</h2>
          {cart.length === 0 ? (
            <p className="text-sm text-muted">Tap an item to add it.</p>
          ) : (
            <ul className="divide-y divide-line">
              {cart.map((l) => {
                const item = itemOf(l.itemId)
                return (
                  <li key={l.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{item.name}</span>
                      {optionsLabel(item, l.options) && <span className="block text-sm text-muted">{optionsLabel(item, l.options)}</span>}
                    </span>
                    <span className="font-semibold">{formatPeso(l.qty * linePrice(item, l.options))}</span>
                    <span className="flex w-full items-center gap-1">
                      <button type="button" aria-label={`One less ${item.name}`} onClick={() => setCart((c) => setQty(c, l.key, l.qty - 1))} className="inline-flex size-11 items-center justify-center rounded-md border border-line hover:bg-soft">
                        <PiMinus aria-hidden="true" className="size-4" />
                      </button>
                      <span className="w-8 text-center font-semibold" aria-label={`Quantity ${l.qty}`}>{l.qty}</span>
                      <button type="button" aria-label={`One more ${item.name}`} onClick={() => setCart((c) => setQty(c, l.key, l.qty + 1))} className="inline-flex size-11 items-center justify-center rounded-md border border-line hover:bg-soft">
                        <PiPlus aria-hidden="true" className="size-4" />
                      </button>
                      <button type="button" onClick={() => setCart((c) => setQty(c, l.key, 0))} className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-danger hover:bg-soft">
                        <PiTrash aria-hidden="true" className="size-4" />
                        Remove<span className="sr-only"> {item.name}</span>
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="rule flex items-baseline justify-between pt-3">
            <span className="text-sm text-muted">Total</span>
            <span className="display-num text-3xl">{formatPeso(total)}</span>
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Customer name
            <input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="min-h-11 rounded-md border border-line bg-surface px-3 text-base font-normal"
            />
          </label>
          <Choice legend="Payment" value={payment} onChange={setPayment} options={[{ value: 'cash', label: 'Cash' }, { value: 'gcash', label: 'GCash' }]} />
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={pay}
            className="btn-primary min-h-12 px-6 text-base"
          >
            Pay {formatPeso(total)}
          </button>
        </div>
      </aside>

      <dialog
        ref={sheet}
        aria-label={picked ? `${picked.item.name} options` : 'Options'}
        // close fires as a queued task; ignore it if a fast tap has already reopened the sheet
        onClose={() => !sheet.current.open && setPicked(null)}
        onClick={(e) => e.target === sheet.current && sheet.current.close()}
        className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-lg rounded-t-lg bg-surface p-0 text-ink backdrop:bg-rail-active/60 md:mb-auto md:rounded-lg"
      >
        {picked && (
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-2xl font-medium">{picked.item.name}</h2>
              <button type="button" aria-label="Close" onClick={() => sheet.current.close()} className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-soft">
                <PiX aria-hidden="true" className="size-5" />
              </button>
            </div>
            {uses.size && (
              <Choice legend="Size" value={picked.options.size} onChange={(v) => setOption('size', v)} options={Object.entries(SIZES).map(([k, s]) => ({ value: k, label: k, extra: extra(s.add) }))} />
            )}
            {uses.milk && (
              <Choice legend="Milk" value={picked.options.milk} onChange={(v) => setOption('milk', v)} options={Object.entries(MILKS).map(([k, m]) => ({ value: k, label: k[0].toUpperCase() + k.slice(1), extra: extra(m.add), out: outWith({ milk: k }) }))} />
            )}
            {uses.shot && (
              <Choice legend="Extra shot" value={picked.options.extraShot} onChange={(v) => setOption('extraShot', v)} options={[{ value: false, label: 'No' }, { value: true, label: 'Yes', extra: extra(SHOT.add), out: outWith({ extraShot: true }) }]} />
            )}
            {uses.sugar && (
              <Choice legend="Sugar" value={picked.options.sugar} onChange={(v) => setOption('sugar', v)} options={SUGAR_LEVELS.map((s) => ({ value: s, label: `${s}%` }))} />
            )}
            <button type="button" data-add disabled={outWith({})} onClick={addPicked} className="btn-primary min-h-12 px-6 text-base">
              Add to order · {formatPeso(linePrice(picked.item, picked.options))}
            </button>
          </div>
        )}
      </dialog>
    </div>
  )
}
