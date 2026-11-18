import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Context, type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LocationStatus } from '@/enums'
import { localService } from '@/services'
import type { Coords, LocalAir, LocationProviderProps, LocationState } from '@/types'

// "My location": the browser shares the user's position only after they agree.
// The nearest reporting station is looked up; with none (or no data) the page keeps showing all of Thailand.
// The choice is remembered, so a returning visitor who opted in sees their location again.

const StorageKey: string = 'pm25-location'

const remembered = (): boolean => {
  try {
    return localStorage.getItem(StorageKey) === 'on'
  } catch {
    return false
  }
}

const remember = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(StorageKey, 'on')
    else localStorage.removeItem(StorageKey)
  } catch {
    // storage blocked: the choice applies for this visit only
  }
}

const round2 = (v: number): number => Math.round(v * 100) / 100
const LocationContext: Context<LocationState | null> = createContext<LocationState | null>(null)

export const LocationProvider = ({ children }: LocationProviderProps): JSX.Element => {
  const [status, setStatus] = useState<LocationStatus>(LocationStatus.Off)
  const [coords, setCoords] = useState<Coords | null>(null)
  const [active, setActive] = useState<boolean>(false)

  const locate = useCallback((): void => {
    if (!('geolocation' in navigator)) {
      setStatus(LocationStatus.Unavailable)
      return
    }
    setStatus(LocationStatus.Locating)
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition): void => {
        setCoords({ lat: round2(pos.coords.latitude), lon: round2(pos.coords.longitude) })
        setStatus(LocationStatus.On)
        setActive(true)
        remember(true)
      },
      (err: GeolocationPositionError): void => {
        const denied = err.code === err.PERMISSION_DENIED
        setStatus(denied ? LocationStatus.Denied : LocationStatus.Unavailable)
        setActive(false)
        if (denied) remember(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 30 * 60 * 1000
      }
    )
  }, [])

  useEffect((): void => {
    if (remembered()) locate()
  }, [locate])

  const query = useQuery({
    queryKey: ['local', coords?.lat ?? null, coords?.lon ?? null],
    queryFn: ({ signal }): Promise<LocalAir | null> => localService.getByLocation(coords!.lat, coords!.lon, signal),
    enabled: coords !== null,
    retry: false,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  })

  const value = useMemo((): LocationState => ({
    status,
    active: active && status === LocationStatus.On,
    local: query.data,
    localLoading: query.isPending && coords !== null,
    localError: query.error,
    enable: locate,
    showCountry: (): void => setActive(false),
    showLocal: (): void => (coords ? setActive(true) : locate()),
  }), [status, active, query.data, query.isPending, query.error, coords, locate])

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export const useMyLocation = (): LocationState => {
  const ctx: LocationState | null = useContext(LocationContext)
  if (!ctx) {
    throw new Error('useMyLocation must be used inside <LocationProvider>')
  }

  return ctx
}
