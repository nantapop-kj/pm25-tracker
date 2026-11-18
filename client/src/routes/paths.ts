export const Paths = {
    home: '/',
    station: (id: string): string => `/stations/${encodeURIComponent(id)}`,
} as const;
