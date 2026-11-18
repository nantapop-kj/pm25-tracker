import type { JSX } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PM25Standard, levelInfo } from '@/lib/aqi'
import { formatDateTime, formatHour, formatNumber, formatShortDate } from '@/lib/format'
import { PM25 } from '@/lib/pollutants'
import type { HourlyChartProps, LevelInfo, Reading } from '@/types'
import { ChartColors as c, ChartFont } from './chartTheme'

export const HourlyChart = ({ data, pollutant = PM25 }: HourlyChartProps): JSX.Element => {
  const key = pollutant.key
  const isPm25: boolean = key === 'pm25'
  const tick = { fill: c.axisText, fontSize: 12, fontFamily: ChartFont }
  const points: Reading[] = data.filter((r: Reading): boolean => r[key] !== null)
  const spanHours: number =
    points.length > 1
      ? (new Date(points[points.length - 1].measuredAt).getTime() - new Date(points[0].measuredAt).getTime()) / 36e5
      : 0
  const byDate: boolean = spanHours > 36
  const tickFormatter = (v: string): string => (byDate ? formatShortDate(v) : formatHour(v))

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={points} margin={{ top: 20, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis
            dataKey="measuredAt"
            tickFormatter={tickFormatter}
            tick={tick}
            axisLine={false}
            tickLine={false}
            minTickGap={byDate ? 72 : 40}
          />
          <YAxis tick={tick} axisLine={false} tickLine={false} width={44} allowDecimals={key === 'co'} />
          {isPm25 && <ReferenceLine y={PM25Standard} stroke={c.reference} strokeWidth={1} />}
          <Tooltip
            cursor={{ stroke: c.axisText, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const r = payload[0].payload as Reading
              const info: LevelInfo = levelInfo(r.level)

              return (
                <div className="tooltip">
                  <div className="tooltip-title">{formatDateTime(r.measuredAt)}</div>
                  <div>
                    {pollutant.label} <strong>{formatNumber(r[key], pollutant.digits)}</strong> {pollutant.unit}
                  </div>
                  {isPm25 ? (
                    <div className="band">
                      <span className="dot" style={{ background: info.color }} /> {info.label}
                    </div>
                  ) : (
                    r.pm25 !== null && <div className="muted">PM2.5 {formatNumber(r.pm25)} µg/m³</div>
                  )}
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey={key}
            stroke={c.line}
            strokeWidth={2}
            fill={c.area}
            dot={false}
            activeDot={{ r: 4, stroke: c.ring, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
