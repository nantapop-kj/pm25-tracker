import { useMemo, type CSSProperties, type JSX } from 'react'
import { hazeLevel, useSky } from '@/contexts/SkyContext'
import { Phase, Phases } from '@/enums'
import type { Star } from '@/types'
import { SkyClouds } from './SkyClouds'
import './SkyBackground.css'

const seeded = (seed: number): (() => number) => {
  let s = seed
  return (): number => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export const SkyBackground = (): JSX.Element => {
  const { phase, focusPm25, previewPm25 } = useSky()
  const haze: number = hazeLevel(previewPm25 ?? focusPm25)

  const stars = useMemo((): Star[] => {
    const rnd: () => number = seeded(11)

    return Array.from({ length: 80 }, (): Star => ({
      left: `${(rnd() * 100).toFixed(1)}%`,
      top: `${(rnd() * 50).toFixed(1)}%`,
      size: rnd() > 0.85 ? 2 : 1,
      opacity: 0.35 + rnd() * 0.55,
      delay: `${(-rnd() * 6).toFixed(1)}s`,
      duration: `${(3 + rnd() * 4).toFixed(1)}s`,
    }))
  }, [])

  return (
    <div
      className="sky"
      aria-hidden data-phase={phase}
      style={{ '--haze': haze.toFixed(3) } as CSSProperties}
    >
      <div className="sky-scene">
        {Phases.map((p) => (
          <div
            key={p}
            className={`sky-layer sky-layer--${p}${p === phase ? ' is-active' : ''}`} />
        ))}
        <div className={`sky-stars${phase === Phase.Night ? ' is-active' : ''}`}>
          {stars.map((s, i) => (
            <span
              key={i}
              className="sky-star"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          ))}
        </div>
        <SkyClouds phase={phase} haze={haze} />
      </div>
      <div className="sky-dust" />
    </div>
  )
}
