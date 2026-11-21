# Coffee shop demo

Live: https://coffee-shop-demo-rho.vercel.app (Vercel deploys every push to `main`).

A clickable demo of a coffee shop system: dashboard, point of sale, barista order queue, ingredient inventory, menu with recipes, staff and sales report. All data is made up and lives in the browser, with no backend; a reload resets it.

## Roles

Pick a role on the login screen. No password.

- **Owner** sees everything: dashboard (with profit), point of sale, order queue, inventory (with costs and stock value), menu with recipe costs and margins, staff and sales report.
- **Barista** takes orders and makes the drinks: sees the dashboard, point of sale, order queue and inventory, with no costs or profit.

## Run it

```
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # static files in dist/
```

## Re-skin for a client (about 15 minutes)

1. Edit `src/config/shop.config.js`:
   - `name`, `tagline`, `logoText`
   - `heroImage`: the login photo (any https image URL; the `photo()` helper sizes Unsplash links)
   - `staff`: `ownerName`, `baristaName`
   - `theme` colours: `rail`, `railInk`, `railActive`, `page`, `surface`, `line`, `soft`, `text`, `muted`, `rule` (heading and table rules), `accent` (button fill), `onAccent` (text on buttons), `accentInk` (red text), `highlight`, `warnBg`, `warnText`, `successBg`, `success`, `danger`
   - `fonts`: `heading` and `body` (any Google Fonts family)
   - `ingredients`: name, unit, stock, reorder level (`lowAt`) and cost per unit
   - `menu`: items with category, price for a medium, `allowsShot`, an optional `image` and the `recipe` (ingredient amounts per cup); items without a photo show their first letter
   - `locale` and `currency` if the client is outside the Philippines
2. For link previews on chat apps and social sites, also update the static copies, because those sites don't run JavaScript:
   - `index.html`: `<title>`, `description` and `og:` tags
   - `public/favicon.svg`: the two colours (`rail` and `highlight`)
3. Run `npm test` and `npm run dev`, then check the login page, the dashboard and the point of sale.

Keep text readable: text colours need at least 4.5:1 contrast on `page`, `surface` and `soft`, and `onAccent` on `accent`. `npm test` checks this and fails if a colour is too light.

Shared styles (cards, buttons, labels, rules) live once in `src/index.css` as Tailwind utilities: `card`, `btn-primary`, `btn-ghost`, `label`, `rule`, `display-num`.

Photos are free Unsplash images linked from Unsplash's servers, so the demo needs internet to show them.

## Stack

React 18, Vite 6, Tailwind 4, Recharts 2, React Router 7 (hash routes, so any static host works), react-hot-toast, Vitest.
