import { createContext, useContext, useReducer } from 'react'
import { buildSeed } from './seed.js'
import { demoReducer, validateOrder, buildOrder, validateItem, buildItem } from './store.js'

const DemoStoreContext = createContext(null)

export function DemoStoreProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(demoReducer, initialState, (s) => s ?? buildSeed(42, new Date()))

  // shortcut: ids are built from this render's state, so two calls in one event share an id; fine while the POS submits once per tap
  const placeOrder = (input) => {
    const error = validateOrder(state, input)
    if (error) return { ok: false, error }
    const order = buildOrder(state, input, new Date())
    dispatch({ type: 'placeOrder', order })
    return { ok: true, order }
  }
  const advanceOrder = (id) => dispatch({ type: 'advanceOrder', id })
  const restock = (ingredientId, qty) => dispatch({ type: 'restock', ingredientId, qty })
  // input with the id of an existing item edits it; anything else adds a new item
  const saveItem = (input) => {
    const error = validateItem(state, input)
    if (error) return { ok: false, error }
    const old = state.menu.find((m) => m.id === input.id)
    const item = old ? { ...old, ...input, name: input.name.trim() } : buildItem(state, input)
    dispatch({ type: 'saveItem', item })
    return { ok: true, item }
  }
  const toggleHidden = (id) => dispatch({ type: 'toggleHidden', id })

  return (
    <DemoStoreContext.Provider value={{ state, placeOrder, advanceOrder, restock, saveItem, toggleHidden }}>
      {children}
    </DemoStoreContext.Provider>
  )
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext)
  if (!store) throw new Error('useDemoStore must be used inside DemoStoreProvider')
  return store
}
