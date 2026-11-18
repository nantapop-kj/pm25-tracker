import type { LocalAir } from '@/types'
import { get } from './httpClient'

export const localService = {
  getByLocation: (lat: number, lon: number, signal?: AbortSignal): Promise<LocalAir> =>
    get('/local', { lat, lon }, signal),
}
