import type { Average, PollutantInfo, PollutantKey, Reading } from '@/types'

export const PM25: PollutantInfo = {
  key: 'pm25',
  label: 'PM2.5',
  unit: 'µg/m³',
  digits: 1,
  name: 'Fine dust'
}

export const Secondary: PollutantInfo[] = [
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', digits: 0, name: 'Coarse dust' },
  { key: 'o3', label: 'O₃', unit: 'ppb', digits: 0, name: 'Ozone' },
  { key: 'co', label: 'CO', unit: 'ppm', digits: 2, name: 'Carbon monoxide' },
  { key: 'no2', label: 'NO₂', unit: 'ppb', digits: 0, name: 'Nitrogen dioxide' },
  { key: 'so2', label: 'SO₂', unit: 'ppb', digits: 0, name: 'Sulfur dioxide' },
]

export const AllPollutants: PollutantInfo[] = [PM25, ...Secondary]

export const averageOf = (readings: Reading[], key: PollutantKey | 'aqi'): Average => {
  const values: number[] = readings.map((r: Reading) => r[key]).filter((v): v is number => v !== null)
  if (values.length === 0) {
    return { avg: null, count: 0 }
  }

  return {
    avg: values.reduce((a: number, b: number): number => a + b, 0) / values.length,
    count: values.length
  }
}
