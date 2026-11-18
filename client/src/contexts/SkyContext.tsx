import { createContext, useContext, useEffect, useMemo, useState, type Context, type JSX } from 'react'
import { Phase, Phases } from '@/enums'
import type { CelestialPosition, SkyProviderProps, SkyState } from '@/types'

const ThemeColor: Record<Phase, string> = {
  [Phase.Morning]: '#4a78ad',
  [Phase.Afternoon]: '#2f5f96',
  [Phase.Evening]: '#2a2f5e',
  [Phase.Night]: '#070d1d',
}

export const BangkokOffset: number = 7 * 3600

export const localMinutes = (offsetSeconds: number = BangkokOffset, date: Date = new Date()): number => {
  const utc = date.getUTCHours() * 60 + date.getUTCMinutes()

  return (((utc + Math.round(offsetSeconds / 60)) % 1440) + 1440) % 1440
}

export const phaseAt = (minutes: number): Phase => {
  const h = minutes / 60

  if (h >= 5 && h < 11) return Phase.Morning
  if (h >= 11 && h < 16) return Phase.Afternoon
  if (h >= 16 && h < 19) return Phase.Evening

  return Phase.Night
}

export const celestial = (minutes: number): CelestialPosition => {
  const rise = 6 * 60
  const set = 18 * 60 + 30
  if (minutes >= rise && minutes < set) {
    return { body: 'sun', t: (minutes - rise) / (set - rise) }
  }

  const nightLength = 24 * 60 - (set - rise)
  const sinceSet = (minutes - set + 24 * 60) % (24 * 60)

  return { body: 'moon', t: sinceSet / nightLength }
}

const phaseOverride = (): Phase | null => {
  try {
    const p = new URLSearchParams(window.location.search).get('phase')

    return Phases.includes(p as Phase) ? (p as Phase) : null
  } catch {
    return null
  }
}

const PreviewMinutes: Record<Phase, number> = {
  [Phase.Morning]: 8 * 60,
  [Phase.Afternoon]: 13 * 60 + 30,
  [Phase.Evening]: 17 * 60 + 40,
  [Phase.Night]: 22 * 60,
}

const pmOverride = (): number | null => {
  try {
    const v = new URLSearchParams(window.location.search).get('pm')
    const n = v === null ? NaN : Number(v)

    return Number.isFinite(n) && n >= 0 ? n : null
  } catch {
    return null
  }
}

export const hazeLevel = (pm25: number | null | undefined): number => {
  if (pm25 === null || pm25 === undefined) {
    return 0
  }

  return Math.min(1, Math.max(0, (pm25 - 25) / 75))
}

const SkyContext: Context<SkyState | null> = createContext<SkyState | null>(null)

export const SkyProvider = ({ children }: SkyProviderProps): JSX.Element => {
  const [override, setPreviewPhase] = useState<Phase | null>(phaseOverride)
  const [previewPm25, setPreviewPm25] = useState<number | null>(pmOverride)
  const [focusPm25, setFocusPm25] = useState<number | null>(null)
  const [utcOffset, setUtcOffset] = useState<number>(BangkokOffset)
  const [tick, setTick] = useState<number>(0)

  useEffect((): (() => void) | undefined => {
    if (override) return

    const id = window.setInterval((): void => setTick((t: number): number => t + 1), 60_000)

    return (): void => window.clearInterval(id)
  }, [override])

  void tick
  const minutes: number = override ? PreviewMinutes[override] : localMinutes(utcOffset)

  const phase: Phase = override ?? phaseAt(minutes)

  useEffect((): void => {
    document.documentElement.dataset.phase = phase
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ThemeColor[phase])
  }, [phase])

  const value = useMemo((): SkyState => ({
    phase,
    minutes,
    focusPm25,
    setFocusPm25,
    previewPm25,
    setUtcOffset,
    previewPhase: override,
    setPreviewPhase,
    setPreviewPm25,
  }), [
    phase,
    minutes,
    focusPm25,
    previewPm25,
    override
  ])

  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>
}

export const useSkyPm25 = (value: number | null | undefined): void => {
  const { setFocusPm25 } = useSky()

  useEffect((): (() => void) => {
    setFocusPm25(value ?? null)

    return (): void => setFocusPm25(null)
  }, [value, setFocusPm25])
}

export const useSky = (): SkyState => {
  const ctx: SkyState | null = useContext(SkyContext)
  if (!ctx) {
    throw new Error('useSky must be used inside <SkyProvider>')
  }

  return ctx
}
