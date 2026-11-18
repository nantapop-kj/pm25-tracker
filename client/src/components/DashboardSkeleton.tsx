import type { JSX } from 'react'
import { ChartSkeleton, Skeleton } from './Skeleton'
import './Skeleton.css'

const SkeletonRows = ({ count }: { count: number }): JSX.Element => {
  return (
    <div className="skeleton-rows">
      {Array.from({ length: count }, (_: unknown, i: number) => (
        <div key={i} className="skeleton-row">
          <Skeleton width={10} height={10} radius="50%" />
          <div className="skeleton-row-main">
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={10} />
          </div>
          <Skeleton width={56} height={18} />
        </div>
      ))}
    </div>
  )
}

const ChartCardSkeleton = ({ height }: { height: number }): JSX.Element => {
  return (
    <section className="glass card">
      <div className="card-head">
        <Skeleton width={180} height={14} />
        <Skeleton width={190} height={32} radius={999} />
      </div>
      <ChartSkeleton height={height} />
    </section>
  )
}

export const DashboardSkeleton = (): JSX.Element => {
  return (
    <div className="stack" role="status" aria-busy="true">
      <span className="sr-only">Loading air quality</span>
      <section className="hero">
        <Skeleton width={150} height={34} radius={999} />
        <Skeleton width={180} height={36} className="skeleton--spaced" />
        <Skeleton width={220} height={16} />
        <Skeleton width={260} height={120} radius={20} className="skeleton--spaced" />
        <Skeleton width={200} height={22} className="skeleton--spaced" />
        <Skeleton width={180} height={16} />
      </section>
      <div className="tiles tiles--5">
        {Array.from({ length: 5 }, (_: unknown, i: number) => (
          <div key={i} className="glass tile">
            <Skeleton width={44} height={12} />
            <Skeleton width={72} height={26} />
          </div>
        ))}
      </div>
      <div className="grid-2">
        <section className="glass card">
          <Skeleton width={110} height={14} />
          <SkeletonRows count={3} />
        </section>
        <section className="glass card">
          <Skeleton width={130} height={14} />
          <SkeletonRows count={5} />
        </section>
      </div>
      <ChartCardSkeleton height={260} />
      <ChartCardSkeleton height={220} />
    </div>
  )
}
