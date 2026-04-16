import type { Context } from '@netlify/functions'

// OpenStreetMap Nominatim — free, no API key, no signup.
// Usage policy: <1 req/sec per client, include a descriptive User-Agent.
// https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT =
  'korea-trip/1.0 (personal itinerary app; https://github.com/DorSkoler/korea-trip)'

type NominatimResult = {
  display_name?: string
  lat?: string
  lon?: string
  class?: string
  type?: string
  extratags?: Record<string, string>
  address?: Record<string, string>
}

export default async (req: Request, _ctx: Context) => {
  const url = new URL(req.url)
  const query = url.searchParams.get('q')
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    extratags: '1',
    countrycodes: 'kr',
    limit: '1',
  })

  let resp: Response
  try {
    resp = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upstream fetch failed', detail: String(err) }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    )
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    return new Response(
      JSON.stringify({
        error: `OSM Nominatim error (${resp.status})`,
        detail: text.slice(0, 200),
      }),
      { status: resp.status, headers: { 'content-type': 'application/json' } },
    )
  }

  const results = (await resp.json()) as NominatimResult[]
  const first = results[0]

  if (!first) {
    return new Response(
      JSON.stringify({
        found: false,
        source: 'osm',
        placeId: null,
        displayName: null,
        address: null,
        businessStatus: null,
        weekdayDescriptions: null,
        openNow: null,
      }),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=86400',
        },
      },
    )
  }

  const ex = first.extratags ?? {}
  const openingHours = ex.opening_hours ?? null
  // OSM opening_hours is a single tag with a compact grammar (e.g.
  // "Mo-Fr 09:00-18:00; Tu off; PH off"). We display it as-is on one line —
  // readable enough and avoids shipping a heavy parser. If missing, the UI
  // falls back to the static weekly hours from the seed.
  const weekdayDescriptions = openingHours ? [openingHours] : null

  return new Response(
    JSON.stringify({
      found: true,
      source: 'osm',
      placeId: null,
      displayName: null,
      address: first.display_name ?? null,
      businessStatus: null,
      weekdayDescriptions,
      openNow: null,
      phone: ex.phone ?? ex['contact:phone'] ?? null,
      website: ex.website ?? ex['contact:website'] ?? null,
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=86400', // 24h
      },
    },
  )
}

export const config = { path: '/api/places' }
