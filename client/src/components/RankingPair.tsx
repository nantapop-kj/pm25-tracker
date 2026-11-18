import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { levelInfo } from '@/lib/aqi'
import { formatNumber, provinceOf } from '@/lib/format'
import { NoData } from '@/lib/noData'
import { Paths } from '@/routes/paths'
import type { LevelInfo, RankingCardProps, RankingItem, RankingPairProps, Station } from '@/types'
import './RankingPair.css'

const RankingCard = ({ title, items }: RankingCardProps): JSX.Element => {
  return (
    <section className="glass card">
      <h3 className="card-title">{title}</h3>
      {items.length === 0 ? (
        <p className="card-empty">{NoData}</p>
      ) : (
        <ol className="rows rows--ranked">
          {items.map((it: RankingItem) => {
            const l: LevelInfo = levelInfo(it.level)
            const body = (
              <>
                <span className="row-rank">{it.rank}</span>
                <span className="dot dot--glow" style={{ background: l.color, color: l.color }} aria-hidden />
                <span className="row-main">
                  <span className="row-name">
                    {it.name}
                    {it.highlight && <span className="row-tag">This station</span>}
                  </span>
                  <span className="row-sub">{it.sub}</span>
                </span>
                <span className="row-value">
                  {formatNumber(it.pm25)}
                  <small className="row-unit"> µg/m³</small>
                </span>
              </>
            )

            return (
              <li key={it.key}>
                {it.href ? (
                  <Link to={it.href} className={`row row--compact row--rank${it.highlight ? ' is-highlight' : ''}`}>
                    {body}
                  </Link>
                ) : (
                  <div className="row row--compact row--rank">{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export const RankingPair = ({ stations, highlightId }: RankingPairProps): JSX.Element => {
  const ranked: Station[] = stations
    .filter((s: Station): boolean => s.latest.pm25 !== null)
    .sort((a: Station, b: Station): number => (b.latest.pm25 ?? 0) - (a.latest.pm25 ?? 0))

  const toItem = (s: Station, rank: number): RankingItem => ({
    key: s.id,
    rank,
    name: s.nameEn,
    sub: `${provinceOf(s.areaEn)}, ${levelInfo(s.latest.level).label}`,
    pm25: s.latest.pm25 ?? 0,
    level: s.latest.level,
    href: Paths.station(s.id),
    highlight: s.id === highlightId,
  })

  const worst: RankingItem[] = ranked.slice(0, 10).map((s: Station, i: number) => toItem(s, i + 1))
  const best: RankingItem[] = [...ranked].reverse().slice(0, 10).map((s: Station, i: number) => toItem(s, i + 1))

  return (
    <section className="stack stack--tight" aria-label="Rankings">
      <h2 className="section-label">Top 10 right now</h2>
      <div className="grid-2">
        <RankingCard title="Worst PM2.5 in Thailand" items={worst} />
        <RankingCard title="Best PM2.5 in Thailand" items={best} />
      </div>
      {ranked.length > 0 && (
        <p className="section-note">Measured at {ranked.length} Air4Thai stations, latest hourly reading.</p>
      )}
    </section>
  )
}
