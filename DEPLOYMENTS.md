# Deployments

Live: https://coffee-shop-demo-rho.vercel.app (Vercel, team "kurt's things", project coffee-shop-demo, deploys on every push to `main`). The plain `coffee-shop-demo.vercel.app` name belongs to someone else, so Vercel added `-rho`.

## 2026-11-21 13:56 — fc9d70e — Calm brown and cream palette (replaces espresso and red)
- By: Claude, requested by Kurt
- Card: #149
- Code: 2d4b03a → fc9d70e
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: live site serves assets/index-CuagXXEi.js with page colour #F7F1E8 and accent #7A4E2D; login hero photo loaded (1600 px); as Owner all 7 pages load with their headings and no sideways scroll; POS shows all 10 drink photos; a Latte for "Live Test 4" paid with toast "Order O-2915 sent to the bar" and appears on the queue; 0 console errors.

## 2026-11-21 13:53 — 5b46292 — Editorial redesign ("Kanto roast": new palette, photos, every page restyled)
- By: Claude, requested by Kurt
- Card: #149
- Code: d88b646 → 5b46292
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: live site serves assets/index-BMPb1WOK.js with the oat page colour (#EFE8DC); login shows the "Kanto Coffee" split hero with the 1600 px café photo loaded; as Owner all 7 pages (dashboard, point of sale, order queue, inventory, menu, staff, sales report) load with their headings and no sideways scroll; POS shows all 10 drink photos loaded; a Latte for "Live Test 3" paid with toast "Order O-2915 sent to the bar" and appears on the queue; 0 console errors.

## 2026-11-21 13:27 — d4f9a23 — One Barista role (cashier and barista merged)
- By: Claude, requested by Kurt
- Card: #148
- Code: 3b2560e → d4f9a23
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: live site serves assets/index-DE6BK79-.js containing the new Barista login text; login shows only Owner and Barista; Barista lands on #/ with Dashboard, Point of sale, Order queue, Inventory; a Latte for "Live Test 2" paid with toast "Order O-2909 sent to the bar" and appears on the queue; no profit on the dashboard; #/sales-report redirects to #/; 0 console errors.

## 2026-11-21 13:19 — c9e6dfa — First release of the coffee shop demo
- By: Claude, requested by Kurt
- Card: #143
- Code: none → c9e6dfa (new public repo kurt-farinas/coffee-shop-demo, new Vercel project coffee-shop-demo)
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: live site returns 200 with title "Kanto Coffee", og:title and favicon.svg served, bundle assets/index-CFo217a5.js; as Owner all 7 pages (dashboard, point of sale, order queue, inventory, menu, staff, sales report) load with their headings, no sideways scroll at 1536 px, 0 console errors; as Cashier a Latte for "Live Test" paid with toast "Order O-2909 sent to the bar" and no profit shown on POS or dashboard; as Barista the login lands on #/queue with only Order queue and Inventory in the menu, and the "Live Test" order is on the queue.
