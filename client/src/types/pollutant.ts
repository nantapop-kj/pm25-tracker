export type PollutantKey = 'pm25' | 'pm10' | 'o3' | 'co' | 'no2' | 'so2'

export interface PollutantInfo {
  key: PollutantKey
  label: string
  unit: string
  digits: number
  name: string
}

export interface Average {
  avg: number | null
  count: number
}
