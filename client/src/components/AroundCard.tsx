import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { levelInfo } from '@/lib/aqi'
import { formatNumber } from '@/lib/format'
import { NoData } from '@/lib/noData'
import { Paths } from '@/routes/paths'
import type { AroundCardProps, AroundRow, LevelInfo } from '@/types'

export const AroundCard = ({ title, rows, note }: AroundCardProps): JSX.Element => {
  return (
    <section className="glass card">
      <h2 className="card-title">{title}</h2>
      {rows.length === 0 ? (
        <p className="card-empty">{NoData}</p>
      ) : (
        <ul className="rows">
          {rows.map(({ station: x, sub }: AroundRow) => {
            const l: LevelInfo = levelInfo(x.latest.level)

            return (
              <li key={x.id}>
                <Link to={Paths.station(x.id)} className="row row--compact">
                  <span className="dot dot--glow" style={{ background: l.color, color: l.color }} aria-hidden />
                  <span className="row-main">
                    <span className="row-name">{x.nameEn}</span>
                    <span className="row-sub">
                      {sub}, {l.label}
                    </span>
                  </span>
                  <span className="row-value">
                    {formatNumber(x.latest.pm25)}
                    <small className="row-unit"> µg/m³</small>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {note && <p className="card-note">{note}</p>}
    </section>
  )
}
