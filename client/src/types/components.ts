import type { ReactNode } from 'react'
import type { PM25Level } from '@/enums'
import type { DailyStat, Reading, Station } from './api'
import type { CleanestHours } from './health'
import type { PollutantInfo } from './pollutant'

export type SecondaryValues = Pick<Reading, 'pm10' | 'o3' | 'co' | 'no2' | 'so2'>

export interface PollutantTilesProps {
  values: SecondaryValues
}

export interface AdviceCardProps {
  level: PM25Level
  cleanest: CleanestHours | null
  cleanestLabel: string
}

export interface AroundRow {
  station: Station
  sub: string
}

export interface AroundCardProps {
  title: string
  rows: AroundRow[]
  note?: string
}

export interface DailyCardProps {
  title?: string
  data: DailyStat[] | undefined
  isPending: boolean
  error: unknown
  onRetry: () => void
  days?: number
  onDays?: (d: number) => void
}

export interface HourlyCardProps {
  data: Reading[] | undefined
  isPending: boolean
  error: unknown
  onRetry: () => void
  hours?: number
  onHours?: (h: number) => void
}

export interface DailyChartProps {
  data: DailyStat[]
}

export interface DailyTooltipProps {
  active?: boolean
  payload?: { payload: DailyStat }[]
}

export interface HourlyChartProps {
  data: Reading[]
  pollutant?: PollutantInfo
}

export interface RangePickerProps {
  label: string
  options: number[]
  value: number
  onChange: (v: number) => void
  suffix: string
}

export interface RankingItem {
  key: string
  rank: number
  name: string
  sub: string
  pm25: number
  level: PM25Level
  href?: string
  highlight?: boolean
}

export interface RankingPairProps {
  stations: Station[]
  highlightId?: string
}

export interface RankingCardProps {
  title: string
  items: RankingItem[]
}

export interface FilterBarProps {
  stations: Station[]
  shown: number
  showSort?: boolean
}

export interface StationListProps {
  stations: Station[]
  emptyText?: string
}

export interface StationMapProps {
  stations: Station[]
  height?: number | string
  center?: [number, number]
  zoom?: number
}

export interface AqiBadgeProps {
  level: PM25Level
}

export interface LoadingProps {
  label?: string
}

export interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

export interface EmptyProps {
  children: ReactNode
}

export interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
}

export interface ChartSkeletonProps {
  height: number
}
