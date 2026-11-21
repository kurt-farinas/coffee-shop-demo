import { shopConfig } from './config/shop.config.js'

// placeholder until the login and shell land (Task 1.6)
export default function App() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="text-center">
        <h1 className="font-heading text-4xl text-ink">{shopConfig.name}</h1>
        <p className="mt-2 text-muted">{shopConfig.tagline}</p>
      </div>
    </main>
  )
}
