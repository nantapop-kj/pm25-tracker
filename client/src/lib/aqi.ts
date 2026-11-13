import { PM25Level } from '@/enums'

export const pm25ToLevel = (pm25: number | null | undefined): PM25Level => {
  if (pm25 == null || !Number.isFinite(pm25)) return PM25Level.Unknown
  if (pm25 <= 15) return PM25Level.VeryGood
  if (pm25 <= 25) return PM25Level.Good
  if (pm25 <= 37.5) return PM25Level.Moderate
  if (pm25 <= 75) return PM25Level.Unhealthy

  return PM25Level.VeryUnhealthy
}
