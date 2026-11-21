import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiEye, PiEyeSlash, PiPencilSimple, PiPlus, PiTrash, PiX } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { CATEGORIES, DEFAULT_OPTIONS, MILKS, lineUsage } from '../data/drinks.js'
import { Photo } from '../components/Photo.jsx'
import { formatPeso } from '../lib/money.js'

const MILK_IDS = Object.values(MILKS).map((m) => m.ingredientId)

// ingredient cost of one medium with the default options
const costOf = (ingredients, item) =>
  Object.entries(lineUsage(item, DEFAULT_OPTIONS)).reduce((sum, [id, qty]) => sum + qty * ingredients.find((i) => i.id === id).costPerUnit, 0)

// the form keeps typed numbers as text; fromForm turns them back into numbers for validateItem
const newLine = (ingredients) => ({ ingredientId: ingredients[0].id, qty: '', scales: false, milk: false })
const toForm = (item) => ({
  ...item,
  price: String(item.price),
  recipe: item.recipe.map((l) => ({ ingredientId: l.ingredientId, qty: String(l.qty), scales: !!l.scales, milk: !!l.milk })),
})
const fromForm = (f) => ({
  ...f,
  price: Number(f.price),
  allowsShot: f.category !== 'Pastry' && f.allowsShot,
  recipe: f.recipe.map(({ ingredientId, qty, scales, milk }) => ({
    ingredientId,
    qty: Number(qty),
    ...(scales && { scales: true }),
    ...(milk && MILK_IDS.includes(ingredientId) && { milk: true }),
  })),
})

const field = 'min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal'
const ghost = 'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:bg-soft'
const check = 'inline-flex min-h-11 items-center gap-2 text-sm'

function ItemRow({ item, ingredients, onEdit, onToggle }) {
  const cost = costOf(ingredients, item)
  const summary = item.recipe
    .map((l) => {
      const ing = ingredients.find((i) => i.id === l.ingredientId)
      return `${l.qty} ${ing.unit} ${ing.name}`
    })
    .join(' · ')
  return (
    <li className={`flex flex-wrap items-start gap-x-4 gap-y-3 rounded-md border border-line p-4 ${item.hidden ? 'bg-soft' : 'bg-surface'}`}>
      <Photo src={item.image} label={item.name} className={`size-20 shrink-0 rounded-md text-3xl ${item.hidden ? 'opacity-50 grayscale' : ''}`} />
      <div className="min-w-0 flex-1 basis-48">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-heading text-lg font-semibold [overflow-wrap:anywhere]">{item.name}</h3>
          <span className="font-semibold">{formatPeso(item.price)}</span>
          {item.hidden && <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted">Hidden</span>}
        </div>
        <p className="mt-1 text-sm text-muted">{summary}</p>
        <p className="mt-1 text-sm">
          Cost {formatPeso(cost)} · {Math.round(((item.price - cost) / item.price) * 100)}% margin
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onEdit(item)} className={ghost}>
          <PiPencilSimple aria-hidden="true" className="size-4" />
          Edit<span className="sr-only"> {item.name}</span>
        </button>
        <button type="button" onClick={() => onToggle(item)} className={ghost}>
          {item.hidden ? <PiEye aria-hidden="true" className="size-4" /> : <PiEyeSlash aria-hidden="true" className="size-4" />}
          {item.hidden ? 'Show' : 'Hide'}
          <span className="sr-only"> {item.name}</span>
        </button>
      </div>
    </li>
  )
}

export function Menu() {
  const { state, saveItem, toggleHidden } = useDemoStore()
  const [form, setForm] = useState(null) // the item being added or edited while the dialog is open
  const [error, setError] = useState(null)
  const [submits, setSubmits] = useState(0) // keys the alert so a repeated error is announced again
  const sheet = useRef(null)
  const { ingredients } = state

  const open = (f) => {
    setError(null)
    setForm(f)
  }
  useEffect(() => {
    if (!form || sheet.current.open) return
    sheet.current.showModal()
    sheet.current.querySelector('input')?.focus()
  }, [form])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setLine = (n, change) => setForm((f) => ({ ...f, recipe: f.recipe.map((l, i) => (i === n ? { ...l, ...change } : l)) }))

  const save = (e) => {
    e.preventDefault()
    setSubmits((n) => n + 1)
    const result = saveItem(fromForm(form))
    if (!result.ok) return setError(result.error)
    toast.success(`Saved ${result.item.name}`)
    sheet.current.close()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold">Menu</h1>
        <button
          type="button"
          onClick={() => open({ name: '', category: CATEGORIES[0], price: '', allowsShot: false, recipe: [newLine(ingredients)] })}
          className="btn-primary gap-1.5"
        >
          <PiPlus aria-hidden="true" className="size-4" />
          Add item
        </button>
      </div>

      {CATEGORIES.map((c) => (
        <section key={c} aria-labelledby={`cat-${c}`} className="mt-6">
          <h2 id={`cat-${c}`} className="text-sm font-semibold tracking-[0.15em] text-muted uppercase">{c}</h2>
          <ul className="mt-3 space-y-3">
            {state.menu
              .filter((m) => m.category === c)
              .map((item) => (
                <ItemRow key={item.id} item={item} ingredients={ingredients} onEdit={(i) => open(toForm(i))} onToggle={(i) => toggleHidden(i.id)} />
              ))}
          </ul>
        </section>
      ))}

      <dialog
        ref={sheet}
        aria-label={form?.id ? `Edit ${form.name}` : 'Add item'}
        // close fires as a queued task; ignore it if the dialog has already been reopened
        onClose={() => !sheet.current.open && setForm(null)}
        className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-lg rounded-t-2xl bg-surface p-0 text-ink backdrop:bg-rail-active/60 md:mb-auto md:rounded-2xl"
      >
        {form && (
          <form noValidate onSubmit={save} aria-describedby={error ? 'menu-form-error' : undefined} className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-2xl font-semibold">{form.id ? 'Edit item' : 'Add item'}</h2>
              <button type="button" aria-label="Close" onClick={() => sheet.current.close()} className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-soft">
                <PiX aria-hidden="true" className="size-5" />
              </button>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Name
              <input value={form.name} maxLength={40} autoComplete="off" onChange={(e) => set('name', e.target.value)} className={field} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex min-w-0 flex-col gap-1.5 text-sm font-semibold">
                Category
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={field}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-1.5 text-sm font-semibold">
                Price (₱)
                <input type="number" inputMode="numeric" min="1" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} className={field} />
              </label>
            </div>
            {form.category !== 'Pastry' && (
              <label className={check}>
                <input type="checkbox" checked={form.allowsShot} onChange={(e) => set('allowsShot', e.target.checked)} className="size-5 accent-rail" />
                Allows extra shot
              </label>
            )}

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold">Recipe for a medium</legend>
              {form.recipe.map((l, n) => {
                const ing = ingredients.find((i) => i.id === l.ingredientId)
                return (
                  <div key={n} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-x-2 gap-y-1 rounded-xl border border-line p-3">
                    <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold">
                      Ingredient {n + 1}
                      <select value={l.ingredientId} onChange={(e) => setLine(n, { ingredientId: e.target.value })} className={`${field} w-full`}>
                        {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </label>
                    <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold">
                      Amount {n + 1} ({ing.unit})
                      <input type="number" inputMode="numeric" min="1" step="1" value={l.qty} onChange={(e) => setLine(n, { qty: e.target.value })} className={`${field} w-full`} />
                    </label>
                    <button type="button" onClick={() => set('recipe', form.recipe.filter((_, i) => i !== n))} className="inline-flex size-11 items-center justify-center rounded-full text-danger hover:bg-soft">
                      <PiTrash aria-hidden="true" className="size-5" />
                      <span className="sr-only">Remove {ing.name}</span>
                    </button>
                    <div className="col-span-3 flex flex-wrap gap-x-4">
                      <label className={check}>
                        <input type="checkbox" checked={l.scales} onChange={(e) => setLine(n, { scales: e.target.checked })} className="size-5 accent-rail" />
                        Scales with size
                      </label>
                      {MILK_IDS.includes(l.ingredientId) && (
                        <label className={check}>
                          <input type="checkbox" checked={l.milk} onChange={(e) => setLine(n, { milk: e.target.checked })} className="size-5 accent-rail" />
                          Is the milk
                        </label>
                      )}
                    </div>
                  </div>
                )
              })}
              <button type="button" onClick={() => set('recipe', [...form.recipe, newLine(ingredients)])} className={`${ghost} self-start`}>
                <PiPlus aria-hidden="true" className="size-4" />
                Add ingredient
              </button>
            </fieldset>

            {error && (
              <p key={submits} id="menu-form-error" role="alert" className="rounded-xl bg-warn-bg px-3 py-2 text-sm font-semibold text-warn-ink">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary min-h-12 px-6 text-base">
              Save
            </button>
          </form>
        )}
      </dialog>
    </div>
  )
}
