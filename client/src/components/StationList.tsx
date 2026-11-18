import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { levelInfo } from '@/lib/aqi'
import { formatNumber, provinceOf } from '@/lib/format'
import { Paths } from '@/routes/paths'
import type { LevelInfo, Station, StationListProps } from '@/types'
import './StationList.css'

export const StationList = ({ stations, emptyText = 'No stations match these filters.' }: StationListProps): JSX.Element => {
  if (stations.length === 0) {
    return <p className="empty">{emptyText}</p>
  }

  return (
    <ul className="rows">
      {stations.map((s: Station) => {
        const info: LevelInfo = levelInfo(s.latest.level)

        return (
          <li key={s.id}>
            <Link to={Paths.station(s.id)} className="row">
              <span className="dot" style={{ background: info.color }} aria-hidden />
              <span className="row-main">
                <span className="row-name">{s.nameEn}</span>
                <span className="row-sub">
                  {provinceOf(s.areaEn)}
                  <span className="row-band-inline">, {info.label}</span>
                </span>
              </span>
              <span className="row-band">{info.label}</span>
              <span className="row-value">
                {formatNumber(s.latest.pm25)}
                {s.latest.pm25 !== null && <small className="row-unit"> µg/m³</small>}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
