import type { JSX } from 'react'
import { NoData } from '@/lib/noData'
import type { DailyCardProps } from '@/types'
import { DailyChart } from './DailyChart'
import { ErrorState } from './QueryState'
import { RangePicker } from './RangePicker'
import { ChartSkeleton } from './Skeleton'

export const DayOptions: number[] = [7, 30, 90]

export const DailyCard = ({ title, data, isPending, error, onRetry, days, onDays }: DailyCardProps): JSX.Element => {
  return (
    <section className="glass card">
      <div className="card-head">
        <h2 className="card-title">{title ?? 'Daily average PM2.5'}</h2>
        {onDays && days !== undefined && (
          <RangePicker label="Days to show" options={DayOptions} value={days} onChange={onDays} suffix=" days" />
        )}
      </div>
      {isPending && <ChartSkeleton height={260} />}
      {Boolean(error) && <ErrorState error={error} onRetry={onRetry} />}
      {data &&
        (data.length === 0 ? (
          <p className="card-empty">{NoData}</p>
        ) : (
          <DailyChart data={data} />
        ))}
    </section>
  )
}
