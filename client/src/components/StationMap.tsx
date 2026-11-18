import type { JSX } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet'
import { Link } from 'react-router-dom'
import type { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSky } from '@/contexts/SkyContext'
import { Phase } from '@/enums'
import { levelInfo } from '@/lib/aqi'
import { formatDateTime, formatNumber, provinceOf } from '@/lib/format'
import { Paths } from '@/routes/paths'
import type { LevelInfo, Station, StationMapProps } from '@/types'
import { AqiBadge } from './AqiBadge'
import './StationMap.css'

type MapTheme = 'light' | 'dark'

const ThailandBounds: LatLngBoundsExpression = [
  [5.6, 97.3],
  [20.5, 105.7],
]

const Tiles: Record<MapTheme, string> = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const Attribution: string =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

const Ring: string = '#ffffff'

export const StationMap = ({ stations, height = 640, center, zoom = 11 }: StationMapProps): JSX.Element => {
  const theme: MapTheme = useSky().phase === Phase.Night ? 'dark' : 'light'
  const view = center ? { center, zoom } : { bounds: ThailandBounds }

  return (
    <div className="map" style={{ height }}>
      <MapContainer
        {...view}
        zoomSnap={0.25}
        boundsOptions={{ padding: [8, 8] }}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer key={theme} attribution={Attribution} url={Tiles[theme]} />
        {stations.map((s: Station) => {
          const info: LevelInfo = levelInfo(s.latest.level)
          const extras: string = [
            s.latest.pm10 !== null ? `PM10 ${formatNumber(s.latest.pm10, 0)} µg/m³` : '',
            s.latest.aqi !== null ? `AQI ${s.latest.aqi}` : '',
          ].filter(Boolean).join(', ')

          return (
            <CircleMarker
              key={`${s.id}-${theme}`}
              center={[s.lat, s.lon]}
              radius={8}
              pathOptions={{
                color: Ring,
                weight: 2,
                fillColor: info.color,
                fillOpacity: 1
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {s.nameEn}: {formatNumber(s.latest.pm25)}
              </Tooltip>
              <Popup>
                <div className="popup">
                  <span className="popup-name">{s.nameEn}</span>
                  <span className="muted">{provinceOf(s.areaEn)}</span>
                  <span className="popup-value">
                    {formatNumber(s.latest.pm25)} <small>µg/m³</small>
                  </span>
                  <AqiBadge level={s.latest.level} />
                  {extras && <span className="muted">{extras}</span>}
                  <span className="muted">Measured {formatDateTime(s.latest.measuredAt)}</span>
                  <Link to={Paths.station(s.id)}>View history</Link>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
