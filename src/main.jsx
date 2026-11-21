import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { shopConfig } from './config/shop.config.js'
import { applyTheme, applyFonts } from './config/applyTheme.js'

applyTheme(shopConfig.theme)
applyFonts(shopConfig.fonts)
document.title = shopConfig.name

const description = `${shopConfig.tagline} A coffee shop demo with sample data.`
const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.head.appendChild(document.createElement('meta'))
    el.setAttribute(attr, key)
  }
  el.setAttribute('content', content)
}
setMeta('name', 'description', description)
setMeta('property', 'og:title', shopConfig.name)
setMeta('property', 'og:description', description)

// favicon from the theme, so a re-skin changes it too; public/favicon.svg is the static fallback
const { rail, highlight } = shopConfig.theme
const stroke = `fill="none" stroke="${highlight}" stroke-linecap="round"`
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${rail}"/><path d="M15 25h28v9a14 14 0 0 1-28 0z" fill="${highlight}"/><path d="M43 28h3a6 6 0 0 1 0 12h-4" ${stroke} stroke-width="3.5"/><path d="M24 11c-3 4 3 6 0 10M33 11c-3 4 3 6 0 10" ${stroke} stroke-width="3"/><path d="M12 54h34" ${stroke} stroke-width="3.5"/></svg>`
const icon = document.head.querySelector('link[rel="icon"]') ?? document.head.appendChild(document.createElement('link'))
icon.rel = 'icon'
icon.type = 'image/svg+xml'
icon.href = URL.createObjectURL(new Blob([favicon], { type: 'image/svg+xml' }))

const family = (name) => `family=${name.replaceAll(' ', '+')}:wght@400;500;600;700`
const fonts = document.createElement('link')
fonts.rel = 'stylesheet'
fonts.href = `https://fonts.googleapis.com/css2?${[...new Set([shopConfig.fonts.body, shopConfig.fonts.heading])].map(family).join('&')}&display=swap`
document.head.append(fonts)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
