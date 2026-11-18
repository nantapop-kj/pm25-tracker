export type CartoStyle = 'light_all' | 'dark_all'

const CartoTileBase: string = 'https://{s}.basemaps.cartocdn.com'

const apiKey: string = import.meta.env.VITE_CARTO_API_KEY?.trim() ?? ''

if (!apiKey && import.meta.env.DEV) {
  console.warn('VITE_CARTO_API_KEY is not set: CARTO basemap tiles may be blocked or watermarked.')
}

export const cartoTileUrl = (style: CartoStyle): string => {
  const url: string = `${CartoTileBase}/${style}/{z}/{x}/{y}{r}.png`

  return apiKey ? `${url}?key=${encodeURIComponent(apiKey)}` : url
}
