import type { ReactNode } from 'react'
import type { LocationStatus } from '@/enums'
import type { LocalAir } from './api'

export interface Coords {
  lat: number
  lon: number
}

export interface LocationState {
  status: LocationStatus
  active: boolean
  local: LocalAir | null | undefined
  localLoading: boolean
  localError: unknown
  enable: () => void
  showCountry: () => void
  showLocal: () => void
}

export interface LocationProviderProps {
  children: ReactNode
}
