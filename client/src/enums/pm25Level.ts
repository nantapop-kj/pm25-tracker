export const PM25Level = {
  VeryGood: 'very_good',
  Good: 'good',
  Moderate: 'moderate',
  Unhealthy: 'unhealthy',
  VeryUnhealthy: 'very_unhealthy',
  Unknown: 'unknown',
} as const

export type PM25Level = (typeof PM25Level)[keyof typeof PM25Level]
