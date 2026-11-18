import type { DailyStat, NationalDay, NationalHour, Reading } from '@/types'

export const toDailyStats = (days: NationalDay[]): DailyStat[] =>
  days.map((d: NationalDay, i: number): DailyStat => {
    const win: NationalDay[] = days.slice(Math.max(0, i - 6), i + 1)
    const rolling: number = win.reduce((a: number, b: NationalDay): number => a + b.avgPm25, 0) / win.length

    return {
      day: d.day,
      avgPm25: d.avgPm25,
      minPm25: d.minPm25,
      maxPm25: d.maxPm25,
      samples: d.stations,
      rolling7d: Math.round(rolling * 10) / 10,
      level: d.level,
    }
  })

export const toReadings = (hours: NationalHour[]): Reading[] =>
  hours.map((h: NationalHour): Reading => ({
    measuredAt: h.hour,
    pm25: h.avgPm25,
    pm10: null,
    o3: null,
    co: null,
    no2: null,
    so2: null,
    aqi: null,
    level: h.level,
  }))
