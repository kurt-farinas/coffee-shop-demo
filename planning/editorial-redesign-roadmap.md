# Coffee demo: editorial redesign ("Kanto roast") — roadmap

Kanban card: #149 (Side Hustle, section coffee-client)

## 1. Status, goal, success criteria

**Status:** Ready for implementation (Phase 1). Phase 2 has a photo-approval gate.

**Goal:** make the Kanto Coffee demo look like a specialty coffee brand's site (third-wave editorial: big serif type, strong rules, real photography), so a café owner sees "their" café rather than a generic admin panel. Every page changes; behaviour does not.

**Success looks like:**
- Login opens on a split hero: shop name in large Fraunces on oat, a café photo on espresso, two role choices as editorial buttons.
- POS and Menu tiles show a photo of each drink; items without a photo show a typographic tile, never a broken image.
- Every page uses the same card, button, label and rule styles from one place (`src/index.css`).
- A re-skin is still config-only: colours, fonts and photo URLs in `src/config/shop.config.js`.
- All existing tests pass unchanged; text keeps at least 4.5:1 contrast (now enforced by a test).

**Audience (user-confirmed, 2026-11-21):** the main viewer is one specific coffee shop owner, shown on a laptop in a pitch, so first impression on Login, Dashboard and POS matters most. The config-driven re-skin stays (it is cheap) but is no longer a goal that limits the design.

**Anti-goals:** a cold, gallery-white look a neighbourhood café can't relate to; animations that slow down the cashier; anything that changes what a page does.

## 2. Scope

**Included:** new palette and tokens, shared editorial CSS classes, login hero, app shell (rail + header), Dashboard, POS, Queue, Inventory, Menu, Staff, Sales report, chart colours, favicon colours, photos for the hero and 10 menu items, README re-skin notes, deploy.

**Excluded:** new features, layout changes to flows (cart, queue columns stay where they are), dark mode, motion beyond hover/press transitions, shared React UI components, the spa demo.

## 3. Decisions and rationale

| Decision | Choice | Basis |
|---|---|---|
| How far | B: new third-wave editorial look, all pages | User-confirmed (Q1) |
| Photos | Free stock photos (Unsplash), optional `image` per menu item + `heroImage`, typographic fallback | User-confirmed (Q2) |
| Palette and type | C "Kanto roast": oat `#EFE8DC`, espresso `#1E1410`, jeepney red `#B8361F`, Fraunces + DM Sans | User-confirmed (Q3, from mockup) |
| Palette change (after first deploy) | Calm brown and cream: cream `#F7F1E8` page, brown `#3B2A20` rail, brown `#7A4E2D` buttons with white text, latte `#E3C9A2` highlight; red dropped. Charts: brown bars, green profit line | User-confirmed (2026-11-21, "i want the calm brown and cream") |
| Build approach | A: theme tokens in config + ~7 shared CSS classes in `index.css`; pages swap long Tailwind strings for them. Rejected: B React components (moves page markup, more churn), C Tailwind-only per page (keeps 5x copied card styling) | Delegated (Q4) |
| Photo hosting | Hotlink `images.unsplash.com` URLs with `?w=…&auto=format&q=70` (Unsplash's guidelines ask for hotlinking); no files downloaded into the repo | Assumption |
| Accent meaning | `accent` becomes the red **fill** with white text (`onAccent`); `accentInk` is red used as text. Old "accent behind dark text" rule in README is replaced | Assumption (forced by the palette) |
| Danger vs accent | Danger `#9B1C2E` (crimson) stays distinct from accent red and always comes with its warning icon, as today | Assumption |
| Skills | `impeccable` for the design passes and the final critique; `design-taste-frontend` not used (it is for marketing pages, this is an app) | Assumption |

## 4. Implementation plan

**Tokens** (`src/config/shop.config.js` → `theme`, contrast-checked 2026-11-21):

| Token | Value | Token | Value |
|---|---|---|---|
| rail | `#1E1410` | text | `#1E1410` |
| railInk | `#EFE8DC` | muted | `#5C4A3D` |
| railActive | `#3A2A20` | accent | `#B8361F` |
| page | `#EFE8DC` | onAccent (new) | `#FFFFFF` |
| surface | `#F8F4EC` | accentInk | `#9C2E1A` |
| line | `#D3C5AF` | highlight | `#E8B04A` |
| rule (new) | `#1E1410` | warnBg / warnText | `#F6E3C4` / `#6B3A06` |
| soft | `#E5DCCC` | successBg / success | `#E3EAD3` / `#3D6B1F` |
| | | danger | `#9B1C2E` |

Measured: muted 6.2–7.7:1, accentInk 5.5–6.8:1, success 4.65–5.8:1, white on accent 5.86:1, ink on highlight 9.2:1.

**Shared classes** (`src/index.css`, `@layer components`, Tailwind `@apply` with the tokens):
- `.card` — `bg-surface border border-line rounded-md p-4 md:p-5` (square-ish 6px corners replace `rounded-2xl`)
- `.btn` — `inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition`
- `.btn-primary` — `.btn` + `bg-accent text-on-accent hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`
- `.btn-ghost` — `.btn` + `border border-rule text-ink hover:bg-soft`
- `.label` — `text-xs font-semibold uppercase tracking-[0.14em] text-muted` (stat labels, table and queue column labels only; never a kicker above a heading, which impeccable's craft floor bans)
- `.rule` — `border-t-2 border-rule` (section divider under page titles and above tile grids)
- `.display-num` — `font-heading font-medium tabular-nums tracking-tight` (prices, stats)

**Page titles:** the `h1` carries itself (Fraunces 500, 3xl–4xl, no label above it), with a `.rule` under the title block.

**Photos:** `menu[i].image` (optional string URL) and `heroImage` (optional) in `shopConfig`. A tiny `Photo` component (`src/components/Photo.jsx`) renders `<img loading="lazy" alt="">` (decorative: the item name is already text) and on `onError` or missing `src` renders the fallback: an espresso tile with the item's initial in Fraunces italic.

**Validation:** `npm test` green after each task; `npm run build` passes; screenshot check of the changed pages at desktop and 375px wide in the preview (`.claude/launch.json` → `coffee-demo`).

## 5. Phase-by-phase roadmap

### Phase 1 — Foundation: tokens, classes, login, app shell

**Outcome:** the new palette and type are live; Login and the shell (rail, header) are in the new look; other pages already pick up the colours.
**Prerequisites:** branch `redesign-kanto-roast` off `main` (created).

- [ ] **1.1 Contrast helper + test (test first)**
  - **Files:** create `src/lib/contrast.js`, `src/lib/contrast.test.js`; edit `src/config/shop.config.test.js` (append a test).
  - **Interfaces:** `export function contrastRatio(hexA: string, hexB: string): number` (WCAG 2.1 relative luminance; `#RRGGBB` only).
  - **Test first:** in `src/lib/contrast.test.js`: `contrastRatio('#000000', '#FFFFFF')` → `21` (toBeCloseTo, 1); `contrastRatio('#FFFFFF', '#FFFFFF')` → `1`. In `shop.config.test.js`, `it('keeps text readable on every background')`: each of `text, muted, accentInk, warnText, success, danger` on each of `page, surface, soft` ≥ 4.5; `onAccent` on `accent` ≥ 4.5; `text` on `highlight` ≥ 4.5; `railInk` on `rail` ≥ 4.5; `warnText` on `warnBg` ≥ 4.5; `success` on `successBg` ≥ 4.5. It must fail against the old theme (old has no `onAccent`) and pass after 1.2.
  - **Check:** `npm test` → all files pass.
- [ ] **1.2 New theme tokens**
  - **Files:** `src/config/shop.config.js` (theme block, lines 10–28) → values from the table, and rewrite the line-9 comment ("caramel accent takes dark text") to "the red accent takes white text (onAccent)"; `src/main.jsx:33` font request adds Fraunces italic (`ital,wght@0,400..700;1,400..500`); `src/index.css` `@theme` → add `--color-on-accent: var(--brand-on-accent)` and `--color-rule: var(--brand-rule)`.
  - **Check:** `npm test` green; the contrast test from 1.1 passes.
- [ ] **1.3 Shared editorial classes**
  - **Files:** `src/index.css` → `@layer components { .card … .label, .display-num }` as specified in section 4.
  - **Check:** `npm run build` succeeds.
- [ ] **1.4 Login hero**
  - **Files:** `src/pages/Login.jsx` (whole file), `src/config/shop.config.js` (`heroImage` field, left undefined until Phase 2).
  - **Layout:** md+: two columns. Left on oat: "Who is on shift?" stays as the section heading `h2` (heading-sized, not a small-caps kicker); `h1` shop name Fraunces 5xl/7xl; tagline; `.rule`; the two role choices as stacked rows (role name in Fraunces 2xl, person, one-line description, arrow), Owner styled `.btn-primary`-coloured, Barista `.btn-ghost`. Right: full-height espresso panel with `<Photo src={shopConfig.heroImage}>` (fallback shows the bean icon large). Phones: photo panel becomes a 40vh band on top.
  - Keep: `h2#pick-role` and the section's `aria-labelledby`; `h1` text = shop name, buttons' accessible names include "Log in as Owner" / "Log in as Barista" (used to navigate in manual checks).
  - **Check:** no Login test exists and none is added (manual check); `npm test` green; screenshot at 1280 and 375 wide shows no horizontal scroll.
- [ ] **1.5 Photo component**
  - **Files:** create `src/components/Photo.jsx`, `src/components/Photo.test.jsx`.
  - **Interfaces:** `export function Photo({ src?: string, label: string, className?: string })`.
  - **Test first:** no `src` → renders text `label`'s first letter, no `img` (`queryByRole('img')` is null — the img has `alt=""` so it is presentation; query `container.querySelector('img')` instead); with `src` → `img` with that `src`; after `fireEvent.error(img)` → img gone, initial shown.
  - **Check:** `npx vitest run src/components/Photo.test.jsx` → 3 passed.
- [ ] **1.6 App shell**
  - **Files:** `src/layout/AppShell.jsx`.
  - **Changes:** rail stays espresso; brand in Fraunces 2xl; nav items `rounded-md` (not pills), active = `bg-highlight text-ink`; a thin `border-rail-active` line separates brand from nav; header stays `bg-rail` below md; on md+ it is `bg-page` with `border-b-2 border-rule` instead of white + light line; role badge `rounded-md`; Log out uses `.btn-ghost` on md+.
  - The `header.bg-rail` md+ focus override in `src/index.css:50-53` stays (md+ header is light, so the espresso ring is right).
  - **Check:** `npm test` green; keyboard focus ring visible on rail and header (tab through in preview).

**Acceptance:** tests and build green; Login and Dashboard screenshots at desktop and 375px show the new palette, no overflow, focus rings visible.

### Phase 2 — Photography (gate: user approves the photo set)

**Outcome:** hero and all 10 menu items have real photos on POS and Menu.

- [ ] Search Unsplash in the browser for: café interior (hero), americano, latte, iced latte, cappuccino, spanish latte, caramel macchiato, matcha latte, hot chocolate, croissant, ensaymada. Pick warm, consistent-light shots.
- [ ] **Gate:** show the user a contact sheet (widget with the 11 thumbnails + photographer credit). Proceed only on approval.
- [ ] Add `image` URLs to each `menu` item and `heroImage` in `shop.config.js`; add a `photoCredits` comment line listing photographers.
- [ ] POS tiles (`src/pages/Pos.jsx`) and Menu cards (`src/pages/Menu.jsx`): `Photo` on top (4:3), name below, price as `.display-num`.
- [ ] `shop.config.test.js`: `it('uses https image urls when an item has one')`.
- **Acceptance:** tests green; POS on a phone still shows ≥2 tiles per row; with the network blocked for `images.unsplash.com`, tiles show the initial fallback.

### Phase 3 — Working pages

Done early in Phase 1 (dark text on the new red failed contrast): every `bg-accent … text-ink` button is now `.btn-primary`, and the Staff avatar is `bg-rail text-rail-ink`.

**Outcome:** every remaining page uses the shared classes and editorial headers. One task per page, each ending with `npm test` green and a screenshot.

- [ ] Dashboard: stats as `.display-num` 3xl with `.label` labels, `.card` everywhere, best-seller ranks in Fraunces italic.
- [ ] POS: cart panel `.card` with `.rule` above the total; Charge / Add buttons `.btn-primary` (replace `bg-accent … text-ink`, lines 183 and 218).
- [ ] Queue: column headers as `.label`, order tickets styled like paper receipts (`.card`, dashed `border-line` between lines), advance button `.btn-primary` (line 39).
- [ ] Inventory: table with `.rule` header row, low/out states keep icon + colour; restock submit `.btn-primary` (line 153).
- [ ] Menu: add/edit buttons `.btn-primary` (lines 110, 215).
- [ ] Staff: avatar circles `bg-rail text-rail-ink` (line 38, was `bg-accent text-ink`).
- [ ] Sales report + `src/components/SalesCharts.jsx`: bars espresso, profit line red accent, cash share bar `bg-accent` (lines 97, 102) stays (no text on it).
- [ ] Favicon in `public/favicon.svg` and the `index.html` meta stay as they are (colours come from `rail`/`highlight`, already themed).
- **Acceptance:** `grep -rn "rounded-2xl border border-line bg-surface" src` → no hits; `grep -rn "bg-accent[^\"]*text-ink" src` → no hits; tests green.

### Phase 4 — Finish, review, deploy

- [ ] `impeccable` critique pass on Login, Dashboard, POS screenshots; fix material items.
- [ ] Fresh `delegate:reviewer` with this spec's section 1–4 and the branch diff.
- [ ] README: update the re-skin steps (new tokens `onAccent`, `rule`; `heroImage` and `image`; replace the "accent sits behind dark text" sentence).
- [ ] Merge to `main` on the user's go-ahead, push (Vercel deploys), verify live URL, log in `DEPLOYMENTS.md` with `Card: #149`.

## 6. Dependencies, uncertainties, next step

- **Order:** Phase 1 before everything (tokens + classes are shared). Phase 2 and Phase 3 are independent after Phase 1, except POS and Menu tiles, which Phase 2 owns (Phase 3 skips the tile markup on those two pages).
- **Parallel:** not worth splitting; pages share `index.css`, and the work is visual and needs one eye.
- **Uncertainties:** Unsplash hotlink availability (fallback tile covers outages); whether the owner likes red buttons (one token to change).
- **Watch out for:**
  1. A photo URL that 404s → fallback tile (test in 1.5).
  2. Long drink names under a photo on 375px tiles → keep the existing hyphenation (`hyphens-auto`) on POS names.
  3. Disabled Charge button with an empty cart → `.btn-primary` keeps `disabled:opacity-50` (Pos test already covers the disabled state).
  4. A re-skin colour that fails contrast → the 1.1 test fails.
  5. Focus ring on the red button → `outline` is `--color-rail` (espresso) on oat, still visible next to red; inside the rail it is `highlight`.
- **First step:** task 1.1 (branch already created).
