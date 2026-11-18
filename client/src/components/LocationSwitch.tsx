import type { JSX } from 'react'
import { useMyLocation } from '@/contexts/LocationContext'
import { LocationStatus } from '@/enums'
import './LocationSwitch.css'

const PinIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)

export const LocationSwitch = (): JSX.Element => {
  const { status, active, enable, showCountry, showLocal } = useMyLocation()

  if (status === LocationStatus.On) {
    return (
      <div className="place-switch glass glass--pill" role="group" aria-label="Show air quality for">
        <button type="button" className={active ? 'is-active' : undefined} aria-pressed={active} onClick={showLocal}>
          <PinIcon /> My location
        </button>
        <button type="button" className={!active ? 'is-active' : undefined} aria-pressed={!active} onClick={showCountry}>
          Thailand
        </button>
      </div>
    )
  }

  if (status === LocationStatus.Denied) {
    return <p className="place-note">Location is off in your browser, so this shows all of Thailand.</p>
  }

  if (status === LocationStatus.Unavailable) {
    return (
      <p className="place-note">
        Couldn't find your location.{' '}
        <button type="button" className="link-btn" onClick={enable}>
          Try again
        </button>
      </p>
    )
  }

  return (
    <button type="button" className="place-btn glass glass--pill" onClick={enable} disabled={status === LocationStatus.Locating}>
      <PinIcon /> {status === LocationStatus.Locating ? 'Finding your location' : 'Use my location'}
    </button>
  )
}
