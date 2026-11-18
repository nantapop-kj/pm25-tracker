import type { PM25Level } from '@/enums'

export interface LevelInfo {
  level: PM25Level
  label: string
  range: string
  min: number
  max: number
  color: string
  textOnColor: string
  advice: string
}
