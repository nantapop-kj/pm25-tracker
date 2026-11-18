import { HttpError } from '@/lib/httpError'
import type { ApiEnvelope, QueryParams } from '@/types'

const BaseUrl: string = '/api/v1'

export const get = async <T,>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T> => {
  const query: string = params
    ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
    : ''

  const res: Response = await fetch(`${BaseUrl}${path}${query}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  const text: string = await res.text()
  const body: ApiEnvelope<T> | null = parseEnvelope<T>(text)

  if (body === null) {
    throw new HttpError(
      res.ok ? 502 : res.status,
      res.ok ? 'Unexpected response from server' : `Request failed: ${res.status} ${res.statusText}`.trim(),
    )
  }

  if (!res.ok || body.status !== 'ok') {
    throw new HttpError(body.code || res.status, body.error || `Request failed (${res.status})`)
  }

  return body.data as T
}

const parseEnvelope = <T,>(text: string): ApiEnvelope<T> | null => {
  try {
    const parsed: unknown = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null && 'status' in parsed ? (parsed as ApiEnvelope<T>) : null
  } catch {
    return null
  }
}
