import type { JSX } from 'react'
import { levelInfo } from '@/lib/aqi'
import type { AqiBadgeProps, LevelInfo } from '@/types'

export const AqiBadge = ({ level }: AqiBadgeProps): JSX.Element => {
  const info: LevelInfo = levelInfo(level)

  return (
    <span className="band" title={`PM2.5 ${info.range} µg/m³`}>
      <span className="dot" style={{ background: info.color }} aria-hidden />
      {info.label}
    </span>
  )
}
