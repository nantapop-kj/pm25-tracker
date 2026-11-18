import { useMemo, type JSX } from 'react'
import { useFilters } from '@/contexts/FilterContext'
import { SortOrder } from '@/enums'
import { MeasuredLevels } from '@/lib/aqi'
import { provinceOf } from '@/lib/format'
import type { FilterBarProps, FilterState, LevelFilter, LevelInfo, Station } from '@/types'
import './FilterBar.css'

export const FilterBar = ({ stations, shown, showSort = true }: FilterBarProps): JSX.Element => {
  const f: FilterState = useFilters()
  const provinces = useMemo(
    (): string[] => Array.from(
      new Set(stations
        .map((s: Station): string => provinceOf(s.areaEn))
        .filter(Boolean)))
      .sort(),
    [stations],
  )

  return (
    <div className="filters">
      <label className="field field--grow">
        <span className="sr-only">Search stations</span>
        <input type="search" placeholder="Search" value={f.search} onChange={(e): void => f.setSearch(e.target.value)} />
      </label>
      <label className="field">
        <span className="sr-only">Province</span>
        <select value={f.province} onChange={(e): void => f.setProvince(e.target.value)}>
          <option value="">All provinces</option>
          {provinces.map((p: string) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="sr-only">Health band</span>
        <select value={f.level} onChange={(e): void => f.setLevel(e.target.value as LevelFilter)}>
          <option value="">All bands</option>
          {MeasuredLevels.map((l: LevelInfo) => (
            <option key={l.level} value={l.level}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      {showSort && (
        <label className="field">
          <span className="sr-only">Sort</span>
          <select value={f.sort} onChange={(e): void => f.setSort(e.target.value as SortOrder)}>
            <option value={SortOrder.Highest}>Highest first</option>
            <option value={SortOrder.Lowest}>Lowest first</option>
            <option value={SortOrder.Name}>By name</option>
          </select>
        </label>
      )}
      <p className="filters-count" aria-live="polite">
        {f.hasFilter ? (
          <>
            {shown} of {stations.length} stations.{' '}
            <button type="button" className="link-btn" onClick={f.reset}>
              Clear
            </button>
          </>
        ) : (
          `${stations.length} stations`
        )}
      </p>
    </div>
  )
}
