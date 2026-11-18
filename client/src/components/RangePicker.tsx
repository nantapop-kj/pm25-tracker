import type { JSX } from 'react'
import type { RangePickerProps } from '@/types'

export const RangePicker = ({ label, options, value, onChange, suffix }: RangePickerProps): JSX.Element => {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o: number) => (
        <button
          key={o}
          type="button"
          className={o === value ? 'is-active' : undefined}
          aria-pressed={o === value}
          onClick={(): void => onChange(o)}
        >
          {o}
          {suffix}
        </button>
      ))}
    </div>
  )
}
