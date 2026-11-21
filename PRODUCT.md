# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary viewer: the owner of one specific coffee shop, shown this demo on a laptop during a sales pitch (user-confirmed 2026-11-21). Their job in that moment is to judge whether this system would fit and look right for their café.
Inside the demo, two roles act out the real workflow: the Owner (sales, costs, profit, menu, staff) and the Barista (takes orders, works the drink queue, checks stock).

## Product Purpose
A clickable showcase of a coffee shop system: dashboard, point of sale, barista order queue, ingredient inventory, menu with recipes, staff and sales report. It exists to win this client's project before their real brief arrives. Success: the owner recognises their café in it and wants it built.

## Positioning
Tailored to this one café (user-confirmed): recipe-level stock tracking (a sale takes beans, milk and cups out of inventory), a barista queue fed directly by the POS, and owner-only cost and profit views.

## Operating Context
Shown live in a pitch, mostly on a laptop; the owner may also open the link on their phone. Hosted on Vercel at https://coffee-shop-demo-rho.vercel.app; every push to `main` deploys.

## Capabilities and Constraints
- All data is made up and lives in the browser; a reload resets it. No backend, no passwords.
- React 18, Vite 6, Tailwind 4, Recharts 2, React Router 7 (hash routes).
- Colours, fonts, menu and ingredients come from `src/config/shop.config.js`.
- Prices in Philippine pesos, locale en-PH.

## Brand Commitments
Shop name "Kanto Coffee" (placeholder for the client's café until their details arrive).

## Evidence on Hand
Sample menu (10 items) and ingredients in `src/config/shop.config.js`. No real photos, testimonials or client assets yet; do not invent them. Stock photos are allowed (user-confirmed, Unsplash).

## Product Principles
1. The pitch is the product: first impression on Login, Dashboard and POS matters most.
2. It must still read as a believable working tool: real flows, nothing fake-looking.
3. Owners see money; baristas never see costs or profit.

## Accessibility & Inclusion
Text keeps at least 4.5:1 contrast; tap targets at least 44px; keyboard focus visible everywhere.
