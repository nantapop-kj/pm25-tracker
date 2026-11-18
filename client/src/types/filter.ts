import type { ReactNode } from 'react'
import type { PM25Level, SortOrder } from '@/enums'
import type { Station } from './api'

export type LevelFilter = PM25Level | ''

export interface FilterState {
  search: string
  setSearch: (v: string) => void
  province: string
  setProvince: (v: string) => void
  level: LevelFilter
  setLevel: (v: LevelFilter) => void
  sort: SortOrder
  setSort: (v: SortOrder) => void
  hasFilter: boolean
  reset: () => void
  applyFilter: (stations: Station[]) => Station[]
}

export interface FilterProviderProps {
  children: ReactNode
}
