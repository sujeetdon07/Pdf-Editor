/**
 * Usage counters kept in localStorage. There is no server to ask, so these are
 * honest per-device numbers: what this browser has done with CelloPDF. Every
 * read is defensive because storage can be disabled, full or holding junk.
 */
const KEY = 'cellopdf.stats.v1'
const SESSION_KEY = 'cellopdf.visit'

export type Stats = {
  visits: number
  files: number
  bytes: number
}

const EMPTY: Stats = { visits: 0, files: 0, bytes: 0 }

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function readStats(): Stats {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY
    const { visits, files, bytes } = parsed as Partial<Stats>
    return {
      visits: isFinitePositive(visits) ? visits : 0,
      files: isFinitePositive(files) ? files : 0,
      bytes: isFinitePositive(bytes) ? bytes : 0,
    }
  } catch {
    return EMPTY
  }
}

function write(stats: Stats): Stats {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    // Private mode or a full quota: the counters simply stop growing.
  }
  window.dispatchEvent(new CustomEvent<Stats>('cellopdf:stats', { detail: stats }))
  return stats
}

/** Counts one visit per browser tab session, not per route change. */
export function recordVisit(): Stats {
  const stats = readStats()
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return stats
    window.sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    return stats
  }
  return write({ ...stats, visits: stats.visits + 1 })
}

/** Called for every file a tool hands back, so it tracks real work done. */
export function recordFile(bytes: number): Stats {
  const stats = readStats()
  return write({
    ...stats,
    files: stats.files + 1,
    bytes: stats.bytes + (isFinitePositive(bytes) ? bytes : 0),
  })
}
