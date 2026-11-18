import { useEffect, useRef, type JSX } from 'react'
import type { Mote, SkyDustProps } from '@/types'
import './SkyDust.css'

const MaxMotes: number = 160

export const SkyDust = ({ haze }: SkyDustProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hazeRef = useRef<number>(haze)
  hazeRef.current = haze

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced: boolean = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    let width = 0
    let height = 0
    const resize = (): void => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const motes: Mote[] = Array.from({ length: MaxMotes }, (): Mote => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.6,
      a: 0.15 + Math.random() * 0.35,
      vx: 4 + Math.random() * 10,
      vy: -2 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
    }))

    let shown = 0
    let raf = 0
    let prev = performance.now()

    const draw = (now: number): void => {
      raf = requestAnimationFrame(draw)
      const dt = Math.min(0.1, (now - prev) / 1000)
      prev = now
      shown += (hazeRef.current * MaxMotes - shown) * 0.02

      ctx.clearRect(0, 0, width, height)
      const n = Math.round(shown)
      for (let i = 0; i < n; i++) {
        const m = motes[i]
        if (!reduced) {
          m.x += m.vx * dt
          m.y += (m.vy + Math.sin(now / 1500 + m.phase) * 3) * dt
          if (m.x > width + 4) m.x = -4
          if (m.y < -4) m.y = height + 4
          if (m.y > height + 4) m.y = -4
        }
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(238, 222, 196, ${m.a})`
        ctx.fill()
      }

      if (reduced && Math.abs(shown - hazeRef.current * MaxMotes) < 1) {
        cancelAnimationFrame(raf)
      }
    }
    raf = requestAnimationFrame(draw)

    return (): void => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="sky-dust-motes" aria-hidden />
}
