export const Phase = {
  Morning: 'morning',
  Afternoon: 'afternoon',
  Evening: 'evening',
  Night: 'night',
} as const

export type Phase = (typeof Phase)[keyof typeof Phase]

export const Phases: Phase[] = Object.values(Phase)
