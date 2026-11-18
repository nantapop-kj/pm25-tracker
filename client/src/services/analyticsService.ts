import type { NationalDay, NationalHour, Overview } from '@/types'
import { get } from './httpClient'

export const analyticsService = {
  getOverview: (signal?: AbortSignal): Promise<Overview> =>
    get('/analytics/overview', undefined, signal),

  getNationalHourly: (hours: number, signal?: AbortSignal): Promise<NationalHour[]> =>
    get('/analytics/hourly', { hours }, signal),

  getNationalDaily: (days: number, signal?: AbortSignal): Promise<NationalDay[]> =>
    get('/analytics/daily', { days }, signal),
}
