export const LocationStatus = {
  Off: 'off',
  Locating: 'locating',
  On: 'on',
  Denied: 'denied',
  Unavailable: 'unavailable',
} as const

export type LocationStatus = (typeof LocationStatus)[keyof typeof LocationStatus]
