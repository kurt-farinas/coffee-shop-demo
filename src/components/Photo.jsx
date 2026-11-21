import { useState } from 'react'

// decorative photo (the name is always shown as text nearby); without one, or if it fails, an espresso tile with the initial (caller sets its text size)
export function Photo({ src, label, className = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return <img src={src} alt="" loading={loading} onError={() => setFailed(true)} className={`object-cover ${className}`} />
  }
  return (
    <span aria-hidden="true" className={`grid place-items-center bg-rail font-heading text-highlight italic ${className}`}>
      {label.charAt(0)}
    </span>
  )
}
