import { useEffect, useRef, useState } from 'react'
import { TOOLS } from '../content/site'
import { formatBytes } from '../lib/files'
import { readStats, recordVisit, type Stats } from '../lib/stats'

const DURATION = 1200

/** Ease-out so the number sprints then settles instead of ticking linearly. */
function ease(t: number): number {
  return 1 - (1 - t) ** 3
}

function useCountUp(target: number, start: boolean): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let frame = 0
    const from = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - from) / DURATION, 1)
      setValue(target * ease(progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start])

  return value
}

function Counter({
  label,
  note,
  value,
  format,
  start,
}: {
  label: string
  note: string
  value: number
  format: (value: number) => string
  start: boolean
}) {
  const animated = useCountUp(value, start)
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/60 p-5">
      <p className="font-display text-3xl font-bold tabular-nums text-white sm:text-4xl">
        {/* Screen readers get the settled figure; the animation is decorative. */}
        <span className="sr-only">{format(value)}</span>
        <span aria-hidden>{format(animated)}</span>
      </p>
      <p className="mt-2 text-sm font-semibold text-ink-100">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-300">{note}</p>
    </div>
  )
}

const whole = (value: number) => Math.round(value).toLocaleString()

/**
 * Live usage numbers above the footer. Nothing is sent anywhere, so the counts
 * are what this browser has done — the copy says so rather than inventing a
 * global total the app has no way to know.
 */
export default function StatsBand() {
  const [stats, setStats] = useState<Stats>({ visits: 0, files: 0, bytes: 0 })
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    setStats(recordVisit())
    const onChange = (event: Event) => setStats((event as CustomEvent<Stats>).detail)
    window.addEventListener('cellopdf:stats', onChange)
    // Another tab doing work should be reflected here too.
    const onStorage = () => setStats(readStats())
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('cellopdf:stats', onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} aria-label="Usage" className="border-t border-ink-800">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8">
        <div className="panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-white">CelloPDF in your browser</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-300">
            These counters live on your device, not on a server — we have no way to watch what you
            convert, so the only usage we can honestly show is your own.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Counter
              label="Visits"
              note="Times you have opened CelloPDF in this browser."
              value={stats.visits}
              format={whole}
              start={visible}
            />
            <Counter
              label="Files processed"
              note="Documents this browser has compressed, converted or edited."
              value={stats.files}
              format={whole}
              start={visible}
            />
            <Counter
              label="Kept off the cloud"
              note="Total size of those files — none of it was uploaded."
              value={stats.bytes}
              format={(value) => formatBytes(Math.round(value))}
              start={visible}
            />
            <Counter
              label="Tools ready"
              note="Every one runs offline once the page has loaded."
              value={TOOLS.length}
              format={whole}
              start={visible}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
