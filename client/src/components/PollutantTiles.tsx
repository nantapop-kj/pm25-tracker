import type { JSX } from 'react'
import { formatNumber } from '@/lib/format'
import { Secondary } from '@/lib/pollutants'
import type { PollutantInfo, PollutantTilesProps, SecondaryValues } from '@/types'
import './PollutantTiles.css'

export const PollutantTiles = ({ values }: PollutantTilesProps): JSX.Element => {
  return (
    <>
      <h2 className="sr-only">Other pollutants</h2>
      <dl className="tiles tiles--5">
        {Secondary.map((p: PollutantInfo) => {
          const value: number | null = values[p.key as keyof SecondaryValues]

          return (
            <div key={p.key} className="glass tile" title={p.name}>
              <dt className="tile-label">{p.label}</dt>
              <dd className="tile-value tile-value--sm">
                {formatNumber(value, p.digits)}
                {value !== null && p.unit && <small> {p.unit}</small>}
              </dd>
            </div>
          )
        })}
      </dl>
    </>
  )
}
