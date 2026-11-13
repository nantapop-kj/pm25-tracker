import type { ReactNode } from 'react'
import type { Phase } from '@/enums'

export type CelestialBody = 'sun' | 'moon'

export interface CelestialPosition {
  body: CelestialBody
  t: number
}

export interface SkyState {
  phase: Phase
  minutes: number
  focusPm25: number | null
  setFocusPm25: (v: number | null) => void
  previewPm25: number | null
  setUtcOffset: (seconds: number) => void
  previewPhase: Phase | null
  setPreviewPhase: (p: Phase | null) => void
  setPreviewPm25: (v: number | null) => void
}

export interface SkyProviderProps {
  children: ReactNode
}
