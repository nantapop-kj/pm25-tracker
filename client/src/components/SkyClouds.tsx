import { useEffect, useRef, type JSX } from 'react'
import { Phase } from '@/enums'
import type { Rgb, SkyCloudsProps } from '@/types'
import './SkyClouds.css'

const CloudColor: Record<Phase, Rgb> = {
  [Phase.Morning]: [255, 247, 240],
  [Phase.Afternoon]: [238, 243, 248],
  [Phase.Evening]: [255, 206, 192],
  [Phase.Night]: [150, 160, 192],
}
const CloudAlpha: Record<Phase, number> = {
  [Phase.Morning]: 0.85,
  [Phase.Afternoon]: 0.9,
  [Phase.Evening]: 0.75,
  [Phase.Night]: 0.5,
}
const Dust: Rgb = [176, 158, 132]

const Perm: Uint8Array = ((): Uint8Array => {
  const p: number[] = Array.from({ length: 256 }, (_, i) => i)
  let s = 1337
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
      ;[p[i], p[j]] = [p[j], p[i]]
  }
  return Uint8Array.from([...p, ...p])
})()

const Rand: Float32Array = Float32Array.from({ length: 256 }, (_, i) => Perm[i] / 255)

const noise = (x: number, y: number): number => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const X = xi & 255
  const Y = yi & 255
  const a = Rand[Perm[Perm[X] + Y]]
  const b = Rand[Perm[Perm[X + 1] + Y]]
  const c = Rand[Perm[Perm[X] + Y + 1]]
  const d = Rand[Perm[Perm[X + 1] + Y + 1]]

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

const fbm = (x: number, y: number, octaves: number): number => {
  let sum = 0
  let amp = 0.5
  let freq = 1

  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq)
    freq *= 2.03
    amp *= 0.5
  }

  return sum
}

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const SkyClouds = ({ phase, haze }: SkyCloudsProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = useRef<SkyCloudsProps>({ phase, haze })
  target.current = { phase, haze }

  useEffect((): (() => void) | undefined => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced: boolean = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let W: number = 0
    let H: number = 0
    let image: ImageData | null = null

    const resize = (): void => {
      const aspect = window.innerHeight / Math.max(1, window.innerWidth)

      W = window.innerWidth < 600 ? 96 : 160
      H = Math.min(240, Math.max(60, Math.round(W * aspect)))
      canvas.width = W
      canvas.height = H
      image = ctx.createImageData(W, H)
    }
    resize()
    window.addEventListener('resize', resize)

    let col: number[] = [...CloudColor[target.current.phase]]
    let alpha: number = CloudAlpha[target.current.phase]

    let raf: number = 0
    let last: number = 0
    const start: number = performance.now()

    const draw = (now: number): void => {
      raf = requestAnimationFrame(draw)

      if (!reduced && now - last < 1000 / 24) return

      last = now

      if (!image) return

      const { phase: ph, haze: hz } = target.current
      const base = CloudColor[ph]
      const goal = base.map((c, i) => c + (Dust[i] - c) * hz * 0.55)
      col = col.map((c, i) => c + (goal[i] - c) * 0.04)
      alpha += (CloudAlpha[ph] - alpha) * 0.04

      const t = reduced ? 40 : (now - start) / 1000
      const data = image.data
      const scale = 3.2 / W
      const coverage = 0.5 - hz * 0.08

      for (let y = 0; y < H; y++) {
        const fade = 1 - smoothstep(0.55, 1, y / H) * 0.5

        for (let x = 0; x < W; x++) {
          const px = x * scale * 0.6 + t * 0.012
          const py = y * scale
          const qx = fbm(px * 0.9 + t * 0.004, py * 0.9, 3)
          const qy = fbm(px * 0.9 + 5.2, py * 0.9 + 1.3 - t * 0.003, 3)
          const n = fbm(px + 1.6 * qx, py + 1.6 * qy, 5)
          const d = smoothstep(coverage, coverage + 0.28, n) * fade
          const shade = 1 - d * 0.18
          const i = (y * W + x) * 4
          data[i] = col[0] * shade
          data[i + 1] = col[1] * shade
          data[i + 2] = col[2] * shade
          data[i + 3] = d * alpha * 255
        }
      }

      ctx.putImageData(image, 0, 0)

      if (reduced) cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(draw)

    return (): void => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="sky-clouds" aria-hidden />
}
