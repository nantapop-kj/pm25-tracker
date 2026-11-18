import { Suspense, lazy, useState, type JSX } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AdviceCard,
  AroundCard,
  ChartSkeleton,
  DailyCard,
  Empty,
  ErrorState,
  HourlyCard,
  Loading,
  PollutantTiles,
  RankingPair
} from '@/components'
import { useSkyPm25 } from '@/contexts/SkyContext'
import { useStation, useStationDaily, useStationReadings, useStations } from '@/hooks'
import { levelInfo } from '@/lib/aqi'
import { formatDateTime, formatNumber, provinceOf, timeAgo } from '@/lib/format'
import { distanceKm } from '@/lib/geo'
import { cleanestHours } from '@/lib/health'
import { HttpError } from '@/lib/httpError'
import { Paths } from '@/routes/paths'
import type { AroundRow, DailyStat, LevelInfo, Station } from '@/types'
import './StationDetailPage.css'

const StationMap = lazy(() => import('@/components/StationMap').then((m) => ({ default: m.StationMap })))

export const StationDetailPage = (): JSX.Element => {
  const { id } = useParams()
  const [days, setDays] = useState<number>(30)
  const [hours, setHours] = useState<number>(72)

  const station = useStation(id)
  const daily = useStationDaily(id, days)
  const readings = useStationReadings(id, hours)
  const week = useStationReadings(id, 168)
  const all = useStations()
  useSkyPm25(station.data?.latest.pm25)

  if (station.isPending) {
    return <Loading />
  }
  if (station.isError) {
    if (station.error instanceof HttpError && station.error.status === 404) {
      return (
        <Empty>
          There is no station with the ID “{id}”. <Link to={Paths.home}>Go to the overview</Link>
        </Empty>
      )
    }

    return <ErrorState error={station.error} onRetry={() => station.refetch()} />
  }

  const s: Station = station.data
  const info: LevelInfo = levelInfo(s.latest.level)
  const stations: Station[] = all.data ?? []

  const reporting: Station[] = stations
    .filter((x: Station): boolean => x.latest.pm25 !== null)
    .sort((a: Station, b: Station): number => (b.latest.pm25 ?? 0) - (a.latest.pm25 ?? 0))
  const rank: number = reporting.findIndex((x: Station): boolean => x.id === s.id) + 1

  const dailyRows: DailyStat[] = daily.data ?? []
  const today: DailyStat | undefined = dailyRows[dailyRows.length - 1]
  const yesterday: DailyStat | undefined = dailyRows[dailyRows.length - 2]
  const change: number | null = today && yesterday ? today.avgPm25 - yesterday.avgPm25 : null

  const neighbours: AroundRow[] = stations
    .filter((x: Station): boolean => x.id !== s.id)
    .map((x: Station) => ({ x, km: distanceKm(s.lat, s.lon, x.lat, x.lon) }))
    .sort((a, b): number => a.km - b.km)
    .slice(0, 5)
    .map(({ x, km }): AroundRow => ({ station: x, sub: `${formatNumber(km, km < 10 ? 1 : 0)} km away` }))
  const cleanest = week.data ? cleanestHours(week.data) : null

  return (
    <div className="stack">
      <section className="hero">
        <Link to={Paths.home} className="back glass glass--pill">
          Overview
        </Link>
        <h1 className="hero-place">{s.nameEn}</h1>
        <p className="hero-meta">
          {provinceOf(s.areaEn)}, measured {formatDateTime(s.latest.measuredAt)} ({timeAgo(s.latest.measuredAt)})
        </p>
        <p className="hero-reading">
          <span className="hero-number">{formatNumber(s.latest.pm25)}</span>
          <span className="hero-unit">µg/m³</span>
        </p>
        <p className="hero-band">
          <span className="dot dot--lg dot--glow" style={{ background: info.color, color: info.color }} aria-hidden />
          {info.label}
        </p>
        {s.latest.aqi !== null && <p className="hero-meta">AQI {s.latest.aqi}</p>}
        {(rank > 0 || change !== null) && (
          <p className="hero-context">
            {rank > 0 && (
              <span>
                #{rank} of {reporting.length} stations in Thailand
              </span>
            )}
            {change !== null && (
              <span>
                {Math.abs(change) < 1
                  ? 'Same as yesterday'
                  : `${formatNumber(Math.abs(change))} ${change > 0 ? 'higher' : 'lower'} than yesterday`}
              </span>
            )}
          </p>
        )}
      </section>
      <PollutantTiles values={s.latest} />
      <div className="grid-2">
        <AdviceCard level={s.latest.level} cleanest={cleanest} cleanestLabel="Cleanest air here, last 7 days" />
        <AroundCard title="Nearby stations" rows={neighbours} />
      </div>
      <DailyCard
        data={daily.data}
        isPending={daily.isPending}
        error={daily.error}
        onRetry={() => daily.refetch()}
        days={days}
        onDays={setDays}
      />
      <HourlyCard
        data={readings.data}
        isPending={readings.isPending}
        error={readings.error}
        onRetry={() => readings.refetch()}
        hours={hours}
        onHours={setHours}
      />
      {all.isSuccess && <RankingPair stations={all.data} highlightId={s.id} />}
      <section className="glass map-frame">
        <h2 className="card-title map-frame-title">Location</h2>
        <Suspense fallback={<ChartSkeleton height={300} />}>
          <StationMap stations={[s]} center={[s.lat, s.lon]} zoom={11} height={300} />
        </Suspense>
      </section>
    </div>
  )
}
