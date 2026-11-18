export const SortOrder = {
  Highest: 'highest',
  Lowest: 'lowest',
  Name: 'name',
} as const

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]
