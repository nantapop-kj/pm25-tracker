import type { PM25Level } from '@/enums'

export interface Reading {
  measuredAt: string
  pm25: number | null
  pm10: number | null
  o3: number | null
  co: number | null
  no2: number | null
  so2: number | null
  aqi: number | null
  level: PM25Level
}

export interface Station {
  id: string
  nameTh: string
  nameEn: string
  areaTh: string
  areaEn: string
  stationType: string
  lat: number
  lon: number
  latest: Reading
}

export interface DailyStat {
  day: string // YYYY-MM-DD
  avgPm25: number
  minPm25: number
  maxPm25: number
  samples: number
  rolling7d: number
  level: PM25Level
}

export interface Overview {
  generatedAt: string
  latestAt: string | null
  stationCount: number
  reportingCount: number
  avgPm25: number | null
  levelCounts: Record<PM25Level, number>
  worst: Station[]
  best: Station[]
}

export interface NationalHour {
  hour: string
  avgPm25: number
  stations: number
  level: PM25Level
}

export interface NationalDay {
  day: string // YYYY-MM-DD
  minPm25: number
  avgPm25: number
  maxPm25: number
  stations: number
  level: PM25Level
}

export interface LocalPlace {
  name: string
  area: string
  country: string
  lat: number
  lon: number
  stationId?: string // omitted when no station is within range
  distanceKm?: number // omitted when no station is within range
}

export interface LocalAir {
  place: LocalPlace
  timezone: string
  utcOffsetSeconds: number
  current: Reading
  hourly: NationalHour[]
  daily: NationalDay[]
  attribution: string
}

// Response wrapper shared by every endpoint: {status, code, data} or {status, code, error}
export interface ApiEnvelope<T> {
  status: 'ok' | 'error'
  code: number
  data?: T
  error?: string
}

export type QueryParams = Record<string, string | number>
