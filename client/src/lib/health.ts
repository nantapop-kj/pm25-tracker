import { PM25Level } from '@/enums'
import type { CleanestHours, HealthAdvice, Reading } from '@/types'
import { formatHour } from './format'

export const SensitiveGroups: string = 'children, older adults, pregnant women, and people with heart or lung conditions'

const Advice: Record<PM25Level, HealthAdvice> = {
  [PM25Level.VeryGood]: {
    everyone: 'Good for outdoor activities and travel.',
    sensitive: 'No special precautions needed.',
  },
  [PM25Level.Good]: {
    everyone: 'Outdoor activities are fine as usual.',
    sensitive: 'Fine for most people. Watch for symptoms if you are very sensitive.',
  },
  [PM25Level.Moderate]: {
    everyone: 'Outdoor activities are fine.',
    sensitive: 'Cut back on long or heavy outdoor exercise. Stop if you cough, feel short of breath or your eyes sting.',
  },
  [PM25Level.Unhealthy]: {
    everyone: 'Spend less time doing long or heavy activity outdoors. Wear an N95 or KN95 mask outside.',
    sensitive: 'Avoid outdoor activity. Keep windows closed and run an air purifier if you have one.',
  },
  [PM25Level.VeryUnhealthy]: {
    everyone: 'Avoid outdoor activity. If you must go out, wear an N95 or KN95 mask.',
    sensitive: 'Stay indoors with an air purifier. See a doctor if you have chest pain, wheezing or trouble breathing.',
  },
  [PM25Level.Unknown]: {
    everyone: 'This station has not reported recently.',
    sensitive: 'Check a nearby station instead.',
  },
}

export const healthAdvice = (level: PM25Level): HealthAdvice => Advice[level] ?? Advice[PM25Level.Unknown]

export const cleanestHours = (readings: Reading[], timeZone?: string): CleanestHours | null => {
  const byHour = new Map<number, number[]>()
  for (const r of readings) {
    if (r.pm25 === null) continue
    const h = Number(formatHour(r.measuredAt, timeZone).slice(0, 2))
    byHour.set(h, [...(byHour.get(h) ?? []), r.pm25])
  }
  if (byHour.size < 24 || readings.length < 72) return null

  const avg = (h: number): number => {
    const v: number[] = byHour.get(((h % 24) + 24) % 24) ?? []

    return v.reduce((a: number, b: number): number => a + b, 0) / Math.max(1, v.length)
  }

  let best = 0
  let bestAvg = Infinity
  for (let h = 0; h < 24; h++) {
    const window = (avg(h) + avg(h + 1) + avg(h + 2)) / 3
    if (window < bestAvg) {
      bestAvg = window
      best = h
    }
  }

  const pad = (h: number): string => `${String(((h % 24) + 24) % 24).padStart(2, '0')}:00`

  return { from: pad(best), to: pad(best + 3), avg: bestAvg }
}
