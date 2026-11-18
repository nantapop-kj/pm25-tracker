import { useState, type JSX } from 'react'
import { NoData } from '@/lib/noData'
import { AllPollutants } from '@/lib/pollutants'
import type { HourlyCardProps, PollutantInfo, PollutantKey, Reading } from '@/types'
import { HourlyChart } from './HourlyChart'
import { ErrorState } from './QueryState'
import { RangePicker } from './RangePicker'
import { ChartSkeleton } from './Skeleton'
import './HourlyCard.css'

export const HourOptions: number[] = [24, 72, 168]

export const HourlyCard = ({ data, isPending, error, onRetry, hours, onHours }: HourlyCardProps): JSX.Element => {
  const [metric, setMetric] = useState<PollutantKey>('pm25')
  const rows: Reading[] = data ?? []
  const measured: PollutantInfo[] = AllPollutants.filter(
    (p: PollutantInfo): boolean => p.key === 'pm25' || rows.some((r: Reading): boolean => r[p.key] !== null),
  )
  const pollutant: PollutantInfo = measured.find((p: PollutantInfo): boolean => p.key === metric) ?? measured[0]

  return (
    <section className="glass card">
      <div className="card-head">
        <h2 className="card-title">Hourly {pollutant.label}</h2>
        {onHours && hours !== undefined && (
          <RangePicker label="Hours to show" options={HourOptions} value={hours} onChange={onHours} suffix="h" />
        )}
      </div>
      {measured.length > 1 && (
        <div className="segmented segmented--minor" role="group" aria-label="Pollutant">
          {measured.map((p: PollutantInfo) => (
            <button
              key={p.key}
              type="button"
              className={p.key === pollutant.key ? 'is-active' : undefined}
              aria-pressed={p.key === pollutant.key}
              onClick={(): void => setMetric(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {isPending && <ChartSkeleton height={220} />}
      {Boolean(error) && <ErrorState error={error} onRetry={onRetry} />}
      {data &&
        (data.length === 0 ? (
          <p className="card-empty">{NoData}</p>
        ) : (
          <HourlyChart data={data} pollutant={pollutant} />
        ))}
    </section>
  )
}
