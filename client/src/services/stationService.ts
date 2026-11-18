import type { DailyStat, Reading, Station } from '@/types'
import { get } from './httpClient'

export const stationService = {
  getAll: (signal?: AbortSignal): Promise<Station[]> =>
    get('/stations', undefined, signal),

  getByID: (id: string, signal?: AbortSignal): Promise<Station> =>
    get(`/stations/${encodeURIComponent(id)}`, undefined, signal),

  getReadings: (id: string, hours: number, signal?: AbortSignal): Promise<Reading[]> =>
    get(`/stations/${encodeURIComponent(id)}/readings`, { hours }, signal),

  getDailyStats: (id: string, days: number, signal?: AbortSignal): Promise<DailyStat[]> =>
    get(`/stations/${encodeURIComponent(id)}/daily`, { days }, signal),
}
