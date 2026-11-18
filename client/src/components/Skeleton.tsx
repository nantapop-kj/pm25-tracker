import type { JSX } from 'react'
import type { ChartSkeletonProps, SkeletonProps } from '@/types'
import './Skeleton.css'

export const Skeleton = ({ width = '100%', height = 16, radius, className }: SkeletonProps): JSX.Element => {
  return (
    <span
      className={className ? `skeleton ${className}` : 'skeleton'}
      style={{ width, height, borderRadius: radius }}
      aria-hidden
    />
  )
}

export const ChartSkeleton = ({ height }: ChartSkeletonProps): JSX.Element => {
  return (
    <div className="chart-skeleton" role="status" aria-label="Loading chart">
      <Skeleton height={height} radius={12} />
    </div>
  )
}
