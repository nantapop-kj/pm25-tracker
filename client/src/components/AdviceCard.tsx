import type { JSX } from 'react'
import { PM25Level } from '@/enums'
import { formatNumber } from '@/lib/format'
import { SensitiveGroups, healthAdvice } from '@/lib/health'
import { NoData } from '@/lib/noData'
import type { AdviceCardProps, HealthAdvice } from '@/types'
import './AdviceCard.css'

export const AdviceCard = ({ level, cleanest, cleanestLabel }: AdviceCardProps): JSX.Element => {
  const advice: HealthAdvice = healthAdvice(level)

  if (level === PM25Level.Unknown) {
    return (
      <section className="glass card">
        <h2 className="card-title">What to do now</h2>
        <p className="card-empty">{NoData}</p>
      </section>
    )
  }

  return (
    <section className="glass card">
      <h2 className="card-title">What to do now</h2>
      <dl className="advice">
        <div>
          <dt>Everyone</dt>
          <dd>{advice.everyone}</dd>
        </div>
        <div>
          <dt>Sensitive groups</dt>
          <dd>{advice.sensitive}</dd>
        </div>
        {cleanest && (
          <div>
            <dt>{cleanestLabel}</dt>
            <dd>
              Usually {cleanest.from}–{cleanest.to}, around {formatNumber(cleanest.avg)} µg/m³
            </dd>
          </div>
        )}
      </dl>
      <p className="card-note">Sensitive groups: {SensitiveGroups}. General guidance, not medical advice.</p>
    </section>
  )
}
