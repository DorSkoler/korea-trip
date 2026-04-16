const CACHE_PREFIX = 'korea:live-hours:'
const TTL_MS = 24 * 60 * 60 * 1000

export type LiveHours = {
  found: boolean
  placeId: string | null
  displayName: string | null
  address: string | null
  businessStatus: string | null
  weekdayDescriptions: string[] | null
  openNow: boolean | null
  fetchedAt: number
}

function cacheKey(query: string): string {
  return CACHE_PREFIX + query.toLowerCase().replace(/\s+/g, ' ').trim()
}

function readCache(query: string): LiveHours | null {
  try {
    const raw = localStorage.getItem(cacheKey(query))
    if (!raw) return null
    const parsed = JSON.parse(raw) as LiveHours
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(query: string, hours: LiveHours): void {
  try {
    localStorage.setItem(cacheKey(query), JSON.stringify(hours))
  } catch {
    // storage full / disabled — not critical
  }
}

async function readJsonSafely<T>(resp: Response): Promise<T | null> {
  const ctype = resp.headers.get('content-type') ?? ''
  if (!ctype.includes('application/json')) return null
  try {
    return (await resp.json()) as T
  } catch {
    return null
  }
}

export async function fetchLiveHours(
  query: string,
  opts: { force?: boolean } = {},
): Promise<LiveHours> {
  if (!opts.force) {
    const cached = readCache(query)
    if (cached) return cached
  }

  let resp: Response
  try {
    resp = await fetch(`/api/places?q=${encodeURIComponent(query)}`)
  } catch (err) {
    throw new Error(
      `Network error — check your connection (${(err as Error).message})`,
    )
  }

  const body = await readJsonSafely<
    (Omit<LiveHours, 'fetchedAt'> & { error?: string }) | null
  >(resp)

  if (!resp.ok) {
    const msg = body?.error
    if (msg) throw new Error(msg)
    if (resp.status === 404)
      throw new Error('Live-hours endpoint not available (deploy to Netlify)')
    throw new Error(`Places API failed (${resp.status})`)
  }

  if (!body) {
    // Dev-mode SPA fallback returns HTML with 200 — treat as unavailable
    throw new Error(
      'Live-hours endpoint not available here — works on your Netlify deploy',
    )
  }

  const withStamp: LiveHours = {
    ...(body as Omit<LiveHours, 'fetchedAt'>),
    fetchedAt: Date.now(),
  }
  writeCache(query, withStamp)
  return withStamp
}

export function clearLiveHoursCache(): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
      i-- // keys shift after remove
    }
  }
}
