import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { shopConfig } from './config/shop.config.js'
import { applyTheme, applyFonts } from './config/applyTheme.js'

applyTheme(shopConfig.theme)
applyFonts(shopConfig.fonts)
document.title = shopConfig.name

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
