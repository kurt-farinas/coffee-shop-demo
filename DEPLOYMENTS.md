# Deployments

Live: https://coffee-shop-demo-rho.vercel.app (Vercel, team "kurt's things", project coffee-shop-demo, deploys on every push to `main`). The plain `coffee-shop-demo.vercel.app` name belongs to someone else, so Vercel added `-rho`.

## 2026-11-21 13:19 — c9e6dfa — First release of the coffee shop demo
- By: Claude, requested by Kurt
- Card: #143
- Code: none → c9e6dfa (new public repo kurt-farinas/coffee-shop-demo, new Vercel project coffee-shop-demo)
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: live site returns 200 with title "Kanto Coffee", og:title and favicon.svg served, bundle assets/index-CFo217a5.js; as Owner all 7 pages (dashboard, point of sale, order queue, inventory, menu, staff, sales report) load with their headings, no sideways scroll at 1536 px, 0 console errors; as Cashier a Latte for "Live Test" paid with toast "Order O-2909 sent to the bar" and no profit shown on POS or dashboard; as Barista the login lands on #/queue with only Order queue and Inventory in the menu, and the "Live Test" order is on the queue.
