import type { Phase } from '@/enums'

export type Rgb = [number, number, number]

export interface SkyCloudsProps {
  phase: Phase
  haze: number
}
