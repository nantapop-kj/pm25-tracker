import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { analyticsService } from '@/services'
import type { NationalDay, NationalHour, Overview } from '@/types'

const RefreshMs: number = 10 * 60 * 1000

export const useOverview = (): UseQueryResult<Overview | null> =>
  useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: ({ signal }): Promise<Overview | null> => analyticsService.getOverview(signal),
    refetchInterval: RefreshMs,
  })

export const useNationalHourly = (hours: number = 12): UseQueryResult<NationalHour[]> =>
  useQuery({
    queryKey: ['analytics', 'hourly', hours],
    queryFn: ({ signal }): Promise<NationalHour[]> => analyticsService.getNationalHourly(hours, signal),
    refetchInterval: RefreshMs,
  })

export const useNationalDaily = (days: number = 7): UseQueryResult<NationalDay[]> =>
  useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: ({ signal }): Promise<NationalDay[]> => analyticsService.getNationalDaily(days, signal),
    refetchInterval: 3 * RefreshMs,
  })
