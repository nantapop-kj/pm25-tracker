import { createContext, useContext, useMemo, useState, type Context, type JSX } from 'react'
import { SortOrder } from '@/enums'
import { provinceOf } from '@/lib/format'
import type { FilterProviderProps, FilterState, LevelFilter, Station } from '@/types'

const FilterContext: Context<FilterState | null> = createContext<FilterState | null>(null)

export const FilterProvider = ({ children }: FilterProviderProps): JSX.Element => {
  const [search, setSearch] = useState<string>('')
  const [province, setProvince] = useState<string>('')
  const [level, setLevel] = useState<LevelFilter>('')
  const [sort, setSort] = useState<SortOrder>(SortOrder.Highest)

  const value = useMemo((): FilterState => {
    const q: string = search.trim().toLowerCase()
    const pm = (s: Station): number => s.latest.pm25 ?? -1

    return {
      search,
      setSearch,
      province,
      setProvince,
      level,
      setLevel,
      sort,
      setSort,
      hasFilter: q !== '' || province !== '' || level !== '',
      reset: (): void => {
        setSearch('')
        setProvince('')
        setLevel('')
      },
      applyFilter: (stations: Station[]): Station[] =>
        stations
          .filter((s: Station): boolean => {
            if (province && provinceOf(s.areaEn) !== province) return false
            if (level && s.latest.level !== level) return false
            if (!q) return true

            return [s.id, s.nameEn, s.areaEn, s.nameTh, s.areaTh].some((f: string): boolean => f.toLowerCase().includes(q))
          })
          .sort((a: Station, b: Station): number => {
            if (sort === SortOrder.Name) return a.nameEn.localeCompare(b.nameEn)

            return sort === SortOrder.Highest ? pm(b) - pm(a) : pm(a) - pm(b)
          }),
    }
  }, [search, province, level, sort])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export const useFilters = (): FilterState => {
  const ctx: FilterState | null = useContext(FilterContext)
  if (!ctx) {
    throw new Error('useFilters must be used inside <FilterProvider>')
  }

  return ctx
}
