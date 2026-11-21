# Coffee shop demo — roadmap

Kanban card: #143 (Side Hustle, section coffee-client)

## 1. Status, goal, success criteria

**Status:** Ready for implementation (Phase 1). Later phases provisional until the client sends details.

**Goal:** a clickable showcase demo of a coffee shop system, to show a coffee shop owner before their real brief arrives. Fake data in the browser; a reload resets it. Built so it can be re-skinned (name, colours, menu) in about 15 minutes once the client's details come in.

**Success looks like:**
- Logging in as Cashier, ringing up "Iced latte, Large, Oat, extra shot" puts the order on the barista queue and takes 36 g beans, 250 ml oat milk and 1 cup out of stock.
- Logging in as Barista shows only the queue and stock; moving an order New → Brewing → Ready → Done works.
- Owner sees sales, cost and profit; Cashier and Barista never see a cost or profit figure.
- Hosted on Vercel from its own GitHub repo, separate from the spa demo.

**Anti-goals:** looking like the spa demo with the words changed; a real backend; features the owner never asked for (QR ordering, loyalty) in v1.

## 2. Scope

**Included:** POS with drink options, barista order queue, menu manager with recipes, ingredient inventory (with restock and low-stock warnings), dashboard, sales report, staff list, three roles, re-skin config, README, Vercel deploy.

**Excluded (v1):** QR / customer ordering page, loyalty stamps, real payments, printing receipts, accounts and passwords, a backend or database, a shared code kit with the spa demo.

## 3. Decisions

| Decision | Choice | Basis |
|---|---|---|
| Module set | B: core shop + barista queue (not the QR menu or loyalty) | User-confirmed (Q1) |
| Roles | Owner, Cashier, Barista; no password | User-confirmed (Q2) |
| Build approach | Fresh Vite scaffold in `side-hustle/coffee-demo`, own git repo; small spa pieces re-typed or copied by hand, no shared code with spa | User-confirmed (Q3: "B, keep those 2 separated"). Options: A copy spa and rework (fastest, leftovers), B fresh (clean, slower), C shared kit (restructures live spa demo) |
| Stack | Same as spa: React 18, Vite 6, Tailwind 4, React Router 7 (hash routes), Recharts 2, react-hot-toast, react-icons, Vitest | Assumption: proven on Vercel, user knows it |
| Shop identity | Placeholder name "Kanto Coffee", en-PH, PHP whole pesos, warm coffee palette, all in `src/config/shop.config.js` | Assumption (delegated: client hasn't sent details) |
| Stock model | Stock is per ingredient, not per drink; each menu item has a recipe; sale deducts the recipe | Assumption (makes it feel like a café) |
| Orders = sales | One `orders` list; the queue and the reports read the same records | Assumption (less code) |
| History orders | Seeded past orders do not change today's stock | Assumption |

## 4. Implementation plan

**User flow:**
1. Login page: three cards — Owner, Cashier, Barista.
2. Cashier: POS → tap a drink → options sheet (size, milk, extra shot, sugar) → add to cart → customer name → pay (Cash / GCash) → order goes to the queue as New; toast shows order number.
3. Barista: lands on Queue → three columns New / Brewing / Ready, each card shows name, items with options, minutes waiting → one button moves it on; Done hides it.
4. Owner: dashboard (today's sales, cups sold, best sellers, low stock), menu manager (price, recipe), inventory (stock, cost, restock), sales report (30 days), staff.

**Domain rules (Phase 1 code):**
- Sizes: S (−₱20, milk/water ×0.8), M (₱0, ×1), L (+₱30, ×1.25). Only recipe lines with `scales: true` change with size; beans, cups, pastries do not. Amounts round to whole units.
- Milk: `whole` (₱0), `oat` (+₱30). Recipe lines with `milk: true` use the chosen milk ingredient. Items with no milk line ignore the choice.
- Extra shot: +₱40 and +18 g beans. Only for items with `allowsShot: true`.
- Sugar: 0 / 25 / 50 / 100 %; no price or stock effect, shown on the queue card.
- Order status: `new → brewing → ready → done`; `done` stays `done`.

**Pages to roles:**

| Page key | Owner | Cashier | Barista |
|---|---|---|---|
| dashboard | yes | yes (no profit) | no |
| pos | yes | yes | no |
| queue | yes | yes | yes |
| inventory | yes | yes (no cost) | yes (no cost) |
| menu, staff, sales-report | yes | no | no |
| pseudo-keys `cost`, `profit` | yes | no | no |

Home page per role: owner and cashier `/`, barista `/queue` (so the redirect for a page you can't see never loops).

**Reuse from spa (copied by hand, then owned here):** `data/random.js` (seeded generator), `config/applyTheme.js`, the `lib/money.js` peso formatter pattern, the `canSee` + `RequireRole` pattern, the `DemoStoreProvider` + reducer pattern, the hash-router + lazy pages pattern. Nothing imports from `spa-demo`.

**Validation:** Vitest unit tests for all domain logic; component tests for POS, queue and role gates; a browser check of each role before each deploy.

## 5. Roadmap

### Phase 1 — Project, data core and roles (no real pages yet) — DONE (3582ddc)

**Outcome:** `npm test` green on the domain rules; `npm run dev` shows a login with three roles and a shell whose sidebar shows only that role's pages (each a "Coming soon" placeholder).

**Prerequisites:** none.

#### Task 1.1 — Scaffold
- [ ] **Files:** create `coffee-demo/package.json` (name `coffee-demo`, scripts `dev`/`build`/`test` and the dependency versions copied from `spa-demo/package.json`), `vite.config.js` (same as spa's: `base: './'`, react + tailwind plugins, `test.environment: 'node'`, excludes `node_modules`, `dist`, `.claude`), `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css` (Tailwind 4 `@import "tailwindcss"` + `@theme` mapping `--color-*` to `--brand-*` vars), `.gitignore` (`node_modules`, `dist`, `.vite`, `.scratch`), `README.md` stub.
- [ ] Run `git init` in `coffee-demo`, `npm install`.
- [ ] **Check:** `npm run build` → exits 0 and writes `dist/index.html`.

#### Task 1.2 — Config, money, random
- [ ] **Files:** `src/config/shop.config.js`, `src/config/applyTheme.js` (copy of spa's), `src/lib/money.js`, `src/data/random.js` (copy of spa's).
- [ ] **Interfaces:**
  - `shopConfig = { name, tagline, logoText, locale: 'en-PH', currency: 'PHP', staff: { ownerName, cashierName, baristaName }, theme: {...}, fonts: { heading, body }, ingredients: Ingredient[], menu: MenuItem[] }`
  - `Ingredient = { id, name, unit: 'g'|'ml'|'pc', stock, lowAt, costPerUnit }` — at least: `ing-beans` (g), `ing-whole-milk` (ml), `ing-oat-milk` (ml), `ing-water` (ml), `ing-cup` (pc), `ing-matcha` (g), `ing-choco` (g), `ing-caramel` (ml), `ing-croissant` (pc), `ing-ensaymada` (pc).
  - `MenuItem = { id, name, category: 'Espresso'|'Non-coffee'|'Pastry', price, allowsShot, recipe: [{ ingredientId, qty, scales?, milk? }] }` — at least: Americano, Latte (`item-latte`, price 150, recipe beans 18, milk 200 `scales`+`milk`, cup 1), Iced latte (`item-iced-latte`, 160, same recipe), Cappuccino, Spanish latte, Caramel macchiato, Matcha latte, Chocolate, Croissant, Ensaymada.
  - `formatPeso(n) → '₱1,250'`
- [ ] **Test first** `src/lib/money.test.js`: `formatPeso(1250) === '₱1,250'`; `formatPeso(0) === '₱0'`.
- [ ] **Test** `src/config/shop.config.test.js`: every recipe `ingredientId` exists in `ingredients`; every id is unique.
- [ ] **Check:** `npx vitest run src/lib src/config` → all pass.

#### Task 1.3 — Drink rules
- [ ] **Files:** `src/data/drinks.js`, `src/data/drinks.test.js`.
- [ ] **Interfaces:**
  - `SIZES = { S: { add: -20, factor: 0.8 }, M: { add: 0, factor: 1 }, L: { add: 30, factor: 1.25 } }`
  - `MILKS = { whole: { add: 0, ingredientId: 'ing-whole-milk' }, oat: { add: 30, ingredientId: 'ing-oat-milk' } }`
  - `SHOT = { add: 40, grams: 18 }`, `SUGAR_LEVELS = [0, 25, 50, 100]`
  - `DEFAULT_OPTIONS = { size: 'M', milk: 'whole', extraShot: false, sugar: 100 }`
  - `linePrice(item, options) → number`
  - `lineUsage(item, options) → { [ingredientId]: number }` (one unit of the item)
  - `optionsLabel(item, options) → string` e.g. `'L · Oat · +shot · 50% sugar'` (omits defaults and choices the item ignores)
- [ ] **Test first:**
  - `linePrice(latte, { size: 'L', milk: 'oat', extraShot: true, sugar: 100 }) === 250`
  - `linePrice(latte, DEFAULT_OPTIONS) === 150`; `linePrice(latte, { ...DEFAULT_OPTIONS, size: 'S' }) === 130`
  - `lineUsage(latte, DEFAULT_OPTIONS)` deep-equals `{ 'ing-beans': 18, 'ing-whole-milk': 200, 'ing-cup': 1 }`
  - `lineUsage(icedLatte, { size: 'L', milk: 'oat', extraShot: true, sugar: 100 })` deep-equals `{ 'ing-beans': 36, 'ing-oat-milk': 250, 'ing-cup': 1 }`
  - `lineUsage(croissant, { ...DEFAULT_OPTIONS, size: 'L', milk: 'oat' })` deep-equals `{ 'ing-croissant': 1 }` and `linePrice` equals the croissant's base price (size/milk ignored for pastries: category `'Pastry'`)
  - `optionsLabel(latte, DEFAULT_OPTIONS) === ''`; `optionsLabel(latte, { size: 'L', milk: 'oat', extraShot: true, sugar: 50 }) === 'L · Oat · +shot · 50% sugar'`
- [ ] **Check:** `npx vitest run src/data/drinks.test.js` → all pass.

#### Task 1.4 — Store (orders, queue, restock)
- [ ] **Files:** `src/data/store.js`, `src/data/store.test.js`, `src/data/DemoStore.jsx`.
- [ ] **Interfaces:**
  - `Order = { id: 'O-1001'…, customerName, lines: [{ itemId, name, options, qty, unitPrice }], total, payment: 'cash'|'gcash', createdAt: ISO string, status: 'new'|'brewing'|'ready'|'done' }`
  - `orderUsage(state, lines) → { [ingredientId]: number }` (sum of `lineUsage × qty`)
  - `validateOrder(state, { customerName, lines }) → string | null`
  - `buildOrder(state, { customerName, lines, payment }, now) → Order` (id = `O-${1001 + state.orders.length}`, status `'new'`)
  - `demoReducer(state, action)` with actions `placeOrder { order }` (re-validates; on error returns the same state), `advanceOrder { id }`, `restock { ingredientId, qty }`
  - `nextStatus(status) → status`
  - `DemoStoreProvider` exposes `{ state, placeOrder(input) → { ok, order } | { ok: false, error }, advanceOrder(id), restock(ingredientId, qty) }` and `useDemoStore()`
- [ ] **Test first:**
  - `validateOrder(s, { customerName: 'Ana', lines: [] }) === 'Add at least one item'`
  - `validateOrder(s, { customerName: '  ', lines: [latte×1] }) === "Add the customer's name"`
  - qty 0 or 1.5 → `'Quantity must be at least 1'`; unknown itemId → `'Item not found'`
  - with `ing-oat-milk` stock 100: Latte M oat ×1 → `'Not enough Oat milk (100 ml left)'`
  - two Latte M whole lines that together need 400 ml with 300 ml stock → `'Not enough Whole milk (300 ml left)'` (sums across lines)
  - `placeOrder` with Iced latte L oat +shot ×1 lowers beans by 36, oat milk by 250, cups by 1, and adds the order with status `'new'`
  - `placeOrder` with an order that no longer fits stock returns the identical state object (`toBe`)
  - `nextStatus`: `new→brewing`, `brewing→ready`, `ready→done`, `done→done`
  - `restock { ingredientId: 'ing-cup', qty: 50 }` adds 50; qty ≤ 0 or non-integer returns the same state
- [ ] **Check:** `npx vitest run src/data/store.test.js` → all pass.

#### Task 1.5 — Seed data
- [ ] **Files:** `src/data/seed.js`, `src/data/seed.test.js`.
- [ ] **Interfaces:** `buildSeed(seed, now) → { ingredients, menu, staff, orders }`. Staff: 6 people (owner, 2 cashiers, 3 baristas) with `{ id, name, role, phone, hiredOn, schedule }`. Orders: 30 days of `done` orders (40–90 a day, more on weekends and 7–10 AM / 3–5 PM), plus today: 3 `new`, 2 `brewing`, 1 `ready`. Stock: config values, with oat milk and cups seeded near `lowAt` so the low-stock warning shows.
- [ ] **Test first:** same seed and same `now` give deep-equal output; every order's `total` equals the sum of `unitPrice × qty`; every `lines[].itemId` exists in `menu`; today has exactly 6 not-`done` orders; at least one ingredient has `stock <= lowAt`.
- [ ] **Check:** `npx vitest run src/data/seed.test.js` → all pass.

#### Task 1.6 — Roles, login, shell
- [ ] **Files:** `src/auth/roles.js`, `src/auth/roles.test.js`, `src/auth/RoleProvider.jsx`, `src/components/RequireRole.jsx`, `src/app/routes.jsx`, `src/layout/AppShell.jsx`, `src/pages/Login.jsx`, `src/pages/ComingSoon.jsx`.
- [ ] **Interfaces:** `PAGES` (keys `dashboard`, `pos`, `queue`, `inventory`, `menu`, `staff`, `sales-report`); `canSee(role, key) → boolean` per the table in section 4 (unknown key or role → false); `homeFor(role) → '/' | '/queue'`. `RequireRole` redirects a page you can't see to `homeFor(role)`.
- [ ] **Test first** `roles.test.js`: `canSee('barista','pos') === false`; `canSee('barista','queue') === true`; `canSee('cashier','cost') === false`; `canSee('cashier','menu') === false`; `canSee('owner','profit') === true`; `canSee('owner','nope') === false`; `homeFor('barista') === '/queue'`; `homeFor('cashier') === '/'`.
- [ ] **Check:** `npm test` → all pass; `npm run build` → exits 0; in the browser, Barista login lands on `/queue` and the sidebar shows only Queue and Inventory.

**Phase 1 acceptance:** all checks above, committed on `main` of the new `coffee-demo` repo (local only, no push).

### Phase 2 — POS and barista queue — DONE (reviewed, see git log)
- [ ] POS page: category tabs, item grid, options sheet (size / milk / shot / sugar, hidden when the item ignores them), cart with qty and remove, customer name, Cash / GCash, pay → `placeOrder`; error toast from `validateOrder`; items that can't be made with current stock shown as "Out".
- [ ] Queue page: New / Brewing / Ready columns, card shows order no., name, `optionsLabel` per line, minutes waiting; one button per card calls `advanceOrder`.
- **Acceptance:** component tests: pay adds an order that appears in New; an out-of-stock item can't be added; Barista can't open `/pos`.

### Phase 3 — Menu and inventory — DONE (reviewed, see git log)
- [ ] Inventory: ingredient table (stock in unit, low-stock badge, cost column owner-only), restock form.
- [ ] Menu manager (owner): edit price and recipe quantities; add/hide an item. Needs store actions `updateItem`, validated (price ≥ 1, recipe ingredient exists).
- **Acceptance:** Cashier sees no cost column; restock raises stock; a price change shows on the POS.

### Phase 4 — Dashboard, sales report, staff (provisional)
- [ ] Dashboard: today's sales, cups sold, average order, best sellers, low-stock list, hourly sales chart; profit card owner-only. Cost of a sale = `orderUsage × costPerUnit`.
- [ ] Sales report (owner): 30-day chart, by item and by category, cash vs GCash.
- [ ] Staff (owner): list with role and schedule.
- **Acceptance:** selector tests on fixed seed values; Cashier dashboard has no profit.

### Phase 5 — Look, re-skin guide, deploy (provisional)
- [ ] Design pass (own coffee look, not the spa's), mobile check at 375 px, favicon from theme, `index.html` meta.
- [ ] README with the re-skin steps.
- [ ] **Gate (needs user OK):** create GitHub repo, push, connect Vercel, add `DEPLOYMENTS.md` entry with `Card: #143`.

## 6. Dependencies, uncertainties, next step

- **Order:** 1 → 2 → (3 and 4 can run in parallel; both read `store.js` but 3 adds actions, so run 3 first if they touch the same file) → 5.
- **Uncertain until the client replies:** real name and menu, whether they use GCash/Maya, whether they want customer ordering or loyalty (excluded now, easy to add as Phase 6).
- **Next step:** Task 1.1, scaffold `coffee-demo`.

### Watch out for
1. Two lines that each fit stock but not together (covered in 1.4).
2. Options a pastry ignores still changing price or stock (covered in 1.3).
3. Barista redirect loop when `/` isn't allowed (covered by `homeFor` in 1.6).
4. Double-tap on Pay placing two orders — Phase 2: disable the button after the first tap; test it.
5. Advancing an order the barista already moved on another screen — `nextStatus('done') === 'done'` (1.4).
