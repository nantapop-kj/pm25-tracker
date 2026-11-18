export const Paths = {
    home: '/',
    stationPattern: '/stations/:id',
    station: (id: string): string => `/stations/${encodeURIComponent(id)}`,
} as const;
