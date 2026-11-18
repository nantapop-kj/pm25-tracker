import { PM25Level } from '@/enums'
import type { LevelInfo } from '@/types'

export const Levels: LevelInfo[] = [
  {
    level: PM25Level.VeryGood,
    label: 'Very good',
    range: '0–15',
    min: 0,
    max: 15,
    color: '#3bccff',
    textOnColor: '#18222d',
    advice: 'Good for outdoor activities and travel.',
  },
  {
    level: PM25Level.Good,
    label: 'Good',
    range: '15.1–25',
    min: 15,
    max: 25,
    color: '#92d050',
    textOnColor: '#18222d',
    advice: 'Outdoor activities are fine as usual.',
  },
  {
    level: PM25Level.Moderate,
    label: 'Moderate',
    range: '25.1–37.5',
    min: 25,
    max: 37.5,
    color: '#ffe23a',
    textOnColor: '#18222d',
    advice: 'People with health conditions should cut back on time outdoors.',
  },
  {
    level: PM25Level.Unhealthy,
    label: 'Starting to affect health',
    range: '37.6–75',
    min: 37.5,
    max: 75,
    color: '#ffa200',
    textOnColor: '#18222d',
    advice: 'Spend less time outdoors and wear a mask rated for fine dust.',
  },
  {
    level: PM25Level.VeryUnhealthy,
    label: 'Affecting health',
    range: 'over 75',
    min: 75,
    max: Infinity,
    color: '#f04646',
    textOnColor: '#ffffff',
    advice: 'Everyone should avoid outdoor activities.',
  },
  {
    level: PM25Level.Unknown,
    label: 'No data',
    range: '–',
    min: NaN,
    max: NaN,
    color: '#b8c0c8',
    textOnColor: '#18222d',
    advice: 'This station has not reported recently.',
  },
]

export const MeasuredLevels: LevelInfo[] = Levels.filter((l: LevelInfo): boolean => l.level !== PM25Level.Unknown)

const ByLevel = Object.fromEntries(Levels.map((l: LevelInfo) => [l.level, l])) as Record<PM25Level, LevelInfo>

export const PM25Standard: number = 37.5

export const levelInfo = (level: PM25Level): LevelInfo => ByLevel[level] ?? ByLevel[PM25Level.Unknown]

export const pm25ToLevel = (pm25: number | null | undefined): PM25Level => {
  if (pm25 == null || !Number.isFinite(pm25)) return PM25Level.Unknown
  if (pm25 <= 15) return PM25Level.VeryGood
  if (pm25 <= 25) return PM25Level.Good
  if (pm25 <= 37.5) return PM25Level.Moderate
  if (pm25 <= 75) return PM25Level.Unhealthy

  return PM25Level.VeryUnhealthy
}
