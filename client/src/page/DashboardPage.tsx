import { Suspense, lazy, useState, type JSX } from 'react'
import { Link } from 'react-router-dom'
import {
  AdviceCard,
  AroundCard,
  ChartSkeleton,
  DailyCard,
  DashboardSkeleton,
  ErrorState,
  FilterBar,
  HourlyCard,
  LocationSwitch,
  PollutantTiles,
  RankingPair,
  StationList
} from '@/components'
import { useFilters } from '@/contexts/FilterContext'
import { useMyLocation } from '@/contexts/LocationContext'
import { useSkyPm25 } from '@/contexts/SkyContext'
import { useNationalDaily, useNationalHourly, useOverview, useStationDaily, useStationReadings, useStations } from '@/hooks'
import { MeasuredLevels, levelInfo, pm25ToLevel } from '@/lib/aqi'
import { formatHour, formatNumber, provinceOf } from '@/lib/format'
import { distanceKm } from '@/lib/geo'
import { cleanestHours } from '@/lib/health'
import { HttpError } from '@/lib/httpError'
import { NoData } from '@/lib/noData'
import { averageOf } from '@/lib/pollutants'
import { toDailyStats, toReadings } from '@/lib/series'
import { Paths } from '@/routes/paths'
import type { AroundCardProps, LevelInfo, Reading, SecondaryValues, Station } from '@/types'
import './DashboardPage.css'

const StationMap = lazy(() => import('@/components/StationMap').then((m) => ({ default: m.StationMap })))

interface HeroView {
  place: string
  meta: string
  pm25: number | null
  range: string
}

export const DashboardPage = (): JSX.Element => {
  const overview = useOverview()
  const stations = useStations()
  const { applyFilter } = useFilters()
  const loc = useMyLocation()
  const [days, setDays] = useState<number>(30)
  const [hours, setHours] = useState<number>(72)
  const local = loc.active ? loc.local ?? undefined : undefined
  const localId: string | undefined = local?.place.stationId
  const nationalDaily = useNationalDaily(days)
  const nationalHourly = useNationalHourly(hours)
  const nationalWeek = useNationalHourly(168)
  const stationDaily = useStationDaily(localId, days)
  const stationHourly = useStationReadings(localId, hours)
  const stationWeek = useStationReadings(localId, 168)
  useSkyPm25(local ? local.current.pm25 : overview.data?.avgPm25)

  if (overview.isPending || stations.isPending) {
    return <DashboardSkeleton />
  }
  if (overview.isError) {
    return <ErrorState error={overview.error} onRetry={() => overview.refetch()} />
  }
  if (stations.isError) {
    return <ErrorState error={stations.error} onRetry={() => stations.refetch()} />
  }

  const ov = overview.data
  const filtered: Station[] = applyFilter(stations.data)
  const lastDay = local?.daily[local.daily.length - 1]
  const view: HeroView = local ?
    {
      place: local.place.name,
      meta: `Nearest station, ${formatNumber(local.place.distanceKm)} km away, updated ${formatHour(local.current.measuredAt)}`,
      pm25: local.current.pm25,
      range: lastDay ? `Today high ${formatNumber(lastDay.maxPm25)}, low ${formatNumber(lastDay.minPm25)}` : '',
    } : {
      place: 'Thailand',
      meta: `Average PM2.5${ov?.latestAt ? `, updated ${formatHour(ov.latestAt)}` : ''}`,
      pm25: ov?.avgPm25 ?? null,
      range: ov?.worst[0] && ov.best[0]
        ? `Highest ${formatNumber(ov.worst[0].latest.pm25)}, lowest ${formatNumber(ov.best[0].latest.pm25)}`
        : '',
    }
  const level = pm25ToLevel(view.pm25)
  const info: LevelInfo = levelInfo(level)
  const noStationNearby: boolean = loc.local === null || (loc.localError instanceof HttpError && loc.localError.status === 404)
  const locationNote: string | null = !loc.active
    ? null
    : loc.localLoading
      ? 'Finding the nearest station'
      : noStationNearby
        ? 'No data for your location, so this shows all of Thailand.'
        : loc.localError
          ? "Couldn't load air quality for your location, so this shows all of Thailand."
          : null

  const latest: Reading[] = stations.data.map((x: Station): Reading => x.latest)
  const tileValues: SecondaryValues = local
    ? local.current
    : {
      pm10: averageOf(latest, 'pm10').avg,
      o3: averageOf(latest, 'o3').avg,
      co: averageOf(latest, 'co').avg,
      no2: averageOf(latest, 'no2').avg,
      so2: averageOf(latest, 'so2').avg,
    }

  const week: Reading[] | undefined = localId ? stationWeek.data : nationalWeek.data && toReadings(nationalWeek.data)
  const cleanest = week ? cleanestHours(week) : null
  const here: Station | undefined = localId ? stations.data.find((x: Station): boolean => x.id === localId) : undefined
  const around: AroundCardProps = here ?
    {
      title: 'Nearby stations',
      rows: stations.data
        .filter((s: Station): boolean => s.id !== here.id)
        .map((s: Station) => ({ s, km: distanceKm(here.lat, here.lon, s.lat, s.lon) }))
        .sort((a, b): number => a.km - b.km)
        .slice(0, 5)
        .map(({ s, km }) => ({ station: s, sub: `${formatNumber(km, km < 10 ? 1 : 0)} km away` })),
    } : {
      title: 'Highest right now',
      rows: (ov?.worst ?? []).slice(0, 5).map((s: Station) => ({ station: s, sub: provinceOf(s.areaEn) })),
    }

  const daily = localId ? stationDaily : nationalDaily
  const hourly = localId ? stationHourly : nationalHourly

  return (
    <div className="stack">
      <section className="hero">
        <LocationSwitch />
        {locationNote && <p className="place-note">{locationNote}</p>}
        <h1 className="hero-place">
          {localId ? <Link to={Paths.station(localId)}>{view.place}</Link> : view.place}
        </h1>
        <p className="hero-meta">{view.meta}</p>
        {view.pm25 !== null && (
          <p className="hero-reading">
            <span className="hero-number">{formatNumber(view.pm25)}</span>
            <span className="hero-unit">µg/m³</span>
          </p>
        )}
        <p className="hero-band">
          <span className="dot dot--lg dot--glow" style={{ background: info.color, color: info.color }} aria-hidden />
          {info.label}
        </p>
        {view.range && <p className="hero-meta">{view.range}</p>}
      </section>
      <PollutantTiles values={tileValues} />
      <div className="grid-2">
        <AdviceCard
          level={level}
          cleanest={cleanest}
          cleanestLabel={localId ? 'Cleanest air here, last 7 days' : 'Cleanest air across Thailand, last 7 days'}
        />
        <AroundCard {...around} />
      </div>
      <DailyCard
        title={localId ? undefined : 'Daily average PM2.5 across Thailand'}
        data={localId ? stationDaily.data : nationalDaily.data && toDailyStats(nationalDaily.data)}
        isPending={daily.isPending}
        error={daily.error}
        onRetry={() => daily.refetch()}
        days={days}
        onDays={setDays}
      />
      <HourlyCard
        data={localId ? stationHourly.data : nationalHourly.data && toReadings(nationalHourly.data)}
        isPending={hourly.isPending}
        error={hourly.error}
        onRetry={() => hourly.refetch()}
        hours={hours}
        onHours={setHours}
      />
      <RankingPair stations={stations.data} highlightId={localId} />
      <section id="stations" className="glass card">
        <h2 className="card-title">All stations</h2>
        <FilterBar stations={stations.data} shown={filtered.length} />
        <StationList stations={filtered} emptyText={stations.data.length === 0 ? NoData : undefined} />
        <p className="card-note">PM2.5 in µg/m³. The national standard is 37.5.</p>
      </section>
      <section className="glass map-frame">
        <h2 className="card-title map-frame-title">Map</h2>
        <Suspense fallback={<ChartSkeleton height={320} />}>
          <StationMap stations={filtered} height={320} />
        </Suspense>
        <div className="legend legend--small">
          {MeasuredLevels.map((l: LevelInfo) => (
            <span key={l.level}>
              <span
                className="dot"
                style={{ background: l.color }}
                aria-hidden
              />
              {l.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
