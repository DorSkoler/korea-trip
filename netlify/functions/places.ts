import type { Context } from '@netlify/functions'

type TextSearchResponse = {
  places?: Array<{
    id?: string
    displayName?: { text?: string }
    formattedAddress?: string
    businessStatus?: string
    regularOpeningHours?: {
      openNow?: boolean
      weekdayDescriptions?: string[]
    }
    currentOpeningHours?: {
      openNow?: boolean
      weekdayDescriptions?: string[]
    }
  }>
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.businessStatus',
  'places.regularOpeningHours',
  'places.currentOpeningHours',
].join(',')

export default async (req: Request, _ctx: Context) => {
  const url = new URL(req.url)
  const query = url.searchParams.get('q')
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const key = Netlify.env.get('GOOGLE_PLACES_API_KEY')
  if (!key) {
    return new Response(
      JSON.stringify({
        error:
          'GOOGLE_PLACES_API_KEY is not set. Add it in Netlify → Site settings → Environment variables.',
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    )
  }

  let resp: Response
  try {
    resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': FIELD_MASK,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ textQuery: query, pageSize: 1 }),
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upstream fetch failed', detail: String(err) }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    )
  }

  if (!resp.ok) {
    const text = await resp.text()
    return new Response(
      JSON.stringify({ error: 'Places API error', status: resp.status, detail: text }),
      { status: resp.status, headers: { 'content-type': 'application/json' } },
    )
  }

  const data = (await resp.json()) as TextSearchResponse
  const first = data.places?.[0] ?? null
  const hours =
    first?.currentOpeningHours?.weekdayDescriptions ??
    first?.regularOpeningHours?.weekdayDescriptions ??
    null

  return new Response(
    JSON.stringify({
      found: Boolean(first),
      placeId: first?.id ?? null,
      displayName: first?.displayName?.text ?? null,
      address: first?.formattedAddress ?? null,
      businessStatus: first?.businessStatus ?? null,
      weekdayDescriptions: hours,
      openNow:
        first?.currentOpeningHours?.openNow ??
        first?.regularOpeningHours?.openNow ??
        null,
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=3600',
      },
    },
  )
}

export const config = { path: '/api/places' }
