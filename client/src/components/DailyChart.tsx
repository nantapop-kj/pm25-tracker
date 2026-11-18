import type { JSX } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PM25Standard, levelInfo } from '@/lib/aqi'
import { formatNumber, formatShortDate } from '@/lib/format'
import type { DailyChartProps, DailyStat, DailyTooltipProps, LevelInfo } from '@/types'
import { ChartColors as c, ChartFont } from './chartTheme'
import './DailyChart.css'

const DailyTooltip = ({ active, payload }: DailyTooltipProps): JSX.Element | null => {
  if (!active || !payload?.length) return null
  const d: DailyStat = payload[0].payload
  const info: LevelInfo = levelInfo(d.level)

  return (
    <div className="tooltip">
      <div className="tooltip-title">{formatShortDate(d.day)}</div>
      <div>
        Average <strong>{formatNumber(d.avgPm25)}</strong> µg/m³
      </div>
      <div className="muted">
        Low {formatNumber(d.minPm25)}, high {formatNumber(d.maxPm25)}
      </div>
      <div className="muted">7-day average {formatNumber(d.rolling7d)}</div>
      <div className="band">
        <span className="dot" style={{ background: info.color }} /> {info.label}
      </div>
    </div>
  )
}

export const DailyChart = ({ data }: DailyChartProps): JSX.Element => {
  const tick = { fill: c.axisText, fontSize: 12, fontFamily: ChartFont }

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 20, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis
            dataKey="day"
            tickFormatter={(v: string): string => formatShortDate(v)}
            tick={tick}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={44}
            allowDecimals={false}
          />
          <ReferenceLine
            y={PM25Standard}
            stroke={c.reference}
            strokeWidth={1}
            label={{
              value: `Standard ${PM25Standard}`,
              position: 'insideTopRight',
              fill: c.reference,
              fontSize: 11,
              fontFamily: ChartFont
            }}
          />
          <Tooltip cursor={{ fill: c.cursor }} content={<DailyTooltip />} />
          <Bar dataKey="avgPm25" fill={c.bar} maxBarSize={20} radius={[3, 3, 0, 0]} />
          <Line
            type="monotone"
            dataKey="rolling7d"
            stroke={c.line}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: c.ring, strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="chart-key">
        <span>
          <i className="key-bar" style={{ background: c.bar }} /> Daily average
        </span>
        <span>
          <i className="key-line" style={{ background: c.line }} /> 7-day average
        </span>
      </div>
    </div>
  )
}
