export const TZ: string = 'Asia/Bangkok'
const Locale: string = 'en-GB'

type FormatKind = 'dateTime' | 'shortDate' | 'hour'

const FormatOptions: Record<FormatKind, Intl.DateTimeFormatOptions> = {
  dateTime: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
  shortDate: { day: 'numeric', month: 'short' },
  hour: { hour: '2-digit', minute: '2-digit' },
}

const cache = new Map<string, Intl.DateTimeFormat>()

const fmt = (kind: FormatKind, tz: string): Intl.DateTimeFormat => {
  const key = `${kind}|${tz}`
  let f = cache.get(key)
  if (!f) {
    try {
      f = new Intl.DateTimeFormat(Locale, { ...FormatOptions[kind], timeZone: tz })
    } catch {
      f = new Intl.DateTimeFormat(Locale, { ...FormatOptions[kind], timeZone: TZ })
    }
    cache.set(key, f)
  }

  return f
}

export const formatDateTime = (iso: string | null | undefined, tz: string = TZ): string => {
  if (!iso) return '–'

  return fmt('dateTime', tz).format(new Date(iso))
}

export const formatShortDate = (value: string, tz: string = TZ): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return fmt('shortDate', 'UTC').format(new Date(`${value}T12:00:00Z`))

  return fmt('shortDate', tz).format(new Date(value))
}

export const formatHour = (iso: string, tz: string = TZ): string => fmt('hour', tz).format(new Date(iso))

export const formatNumber = (value: number | null | undefined, digits: number = 1): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '–'

  return value.toLocaleString('en-US', { maximumFractionDigits: digits })
}

export const provinceOf = (area: string): string => {
  const parts: string[] = area.split(',').map((p: string): string => p.trim()).filter(Boolean)

  return parts.length > 0 ? parts[parts.length - 1] : ''
}
