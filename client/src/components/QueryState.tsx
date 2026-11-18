import type { JSX } from 'react'
import { HttpError } from '@/lib/httpError'
import type { EmptyProps, ErrorStateProps, LoadingProps } from '@/types'
import './QueryState.css'

export const Loading = ({ label = 'Loading' }: LoadingProps): JSX.Element => {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden />
      {label}
    </div>
  )
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps): JSX.Element => {
  const message: string =
    error instanceof HttpError
      ? `Something went wrong (${error.status}): ${error.message}`
      : "Couldn't load the data."

  return (
    <div className="state state--error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export const Empty = ({ children }: EmptyProps): JSX.Element => {
  return <div className="state">{children}</div>
}
