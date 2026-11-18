import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { stationService } from '@/services'
import type { DailyStat, Reading, Station } from '@/types'

const RefreshMs: number = 10 * 60 * 1000

export const useStations = (): UseQueryResult<Station[]> =>
  useQuery({
    queryKey: ['stations'],
    queryFn: ({ signal }): Promise<Station[]> => stationService.getAll(signal),
    refetchInterval: RefreshMs,
  })

export const useStationReadings = (id: string | undefined, hours: number): UseQueryResult<Reading[]> =>
  useQuery({
    queryKey: ['station', id, 'readings', hours],
    queryFn: ({ signal }): Promise<Reading[]> => stationService.getReadings(id!, hours, signal),
    enabled: Boolean(id),
    refetchInterval: RefreshMs,
  })

export const useStationDaily = (id: string | undefined, days: number): UseQueryResult<DailyStat[]> =>
  useQuery({
    queryKey: ['station', id, 'daily', days],
    queryFn: ({ signal }): Promise<DailyStat[]> => stationService.getDailyStats(id!, days, signal),
    enabled: Boolean(id),
    refetchInterval: RefreshMs,
  })
