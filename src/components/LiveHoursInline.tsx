import { useState } from 'react'
import type { PlaceItem } from '../data/trip.schema'
import { fetchLiveHours, type LiveHours } from '../lib/livePlaces'
import { staticHoursNote, staticWeekdayDescriptions } from '../lib/staticHours'

type Props = {
  place: PlaceItem
}

type Source = 'live' | 'saved' | 'saved-after-error'

type Display = {
  source: Source
  openNow: boolean | null
  businessStatus: string | null
  weekdayDescriptions: string[] | null
  note: string | null
  errorMessage?: string
}

function buildQuery(place: PlaceItem): string {
  const parts = [place.name, place.address].filter(Boolean)
  return parts.join(', ')
}

function buildSavedFallback(
  place: PlaceItem,
  errorMessage?: string,
): Display {
  return {
    source: errorMessage ? 'saved-after-error' : 'saved',
    openNow: null,
    businessStatus: null,
    weekdayDescriptions: staticWeekdayDescriptions(place.openingHours),
    note: staticHoursNote(place.openingHours),
    errorMessage,
  }
}

function displayFromLive(live: LiveHours, place: PlaceItem): Display {
  const hasLive = live.found && live.weekdayDescriptions?.length
  if (hasLive) {
    return {
      source: 'live',
      openNow: live.openNow,
      businessStatus: live.businessStatus,
      weekdayDescriptions: live.weekdayDescriptions,
      note: null,
    }
  }
  // live responded but no published hours — fall back to saved
  return buildSavedFallback(place)
}

export function LiveHoursInline({ place }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [display, setDisplay] = useState<Display | null>(null)

  async function load(force = false) {
    setState('loading')
    try {
      const live = await fetchLiveHours(buildQuery(place), { force })
      setDisplay(displayFromLive(live, place))
    } catch (err) {
      setDisplay(buildSavedFallback(place, (err as Error).message))
    } finally {
      setState('done')
    }
  }

  if (state === 'idle') {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => load()}
          className="text-xs glass rounded-full px-3 py-1.5 hover:scale-[1.02] active:scale-95 transition-transform"
          dir="ltr"
        >
          🔄 Check live hours
        </button>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <p className="mt-3 text-xs opacity-70" dir="ltr">
        Fetching live hours…
      </p>
    )
  }

  if (!display) return null

  return (
    <div className="mt-3 text-xs" dir="ltr" lang="en">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="opacity-80">
          {display.source === 'live'
            ? 'Live hours'
            : display.source === 'saved-after-error'
              ? 'Saved hours (live check failed)'
              : 'Saved hours'}
        </span>
        {display.openNow === true && (
          <span className="text-emerald-500 font-medium">Open now</span>
        )}
        {display.openNow === false && (
          <span className="text-red-500 font-medium">Closed now</span>
        )}
        {display.businessStatus &&
          display.businessStatus !== 'OPERATIONAL' && (
            <span className="text-orange-500 font-medium">
              {display.businessStatus.replace(/_/g, ' ').toLowerCase()}
            </span>
          )}
      </div>

      {display.weekdayDescriptions?.length ? (
        <ul className="opacity-85 space-y-0.5">
          {display.weekdayDescriptions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="opacity-70">No hours on file for this place.</p>
      )}

      {display.note && (
        <p className="mt-1 opacity-60 italic">ℹ {display.note}</p>
      )}

      {display.errorMessage && (
        <p className="mt-1 text-orange-500/80">
          ⚠ {display.errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => load(true)}
        className="mt-2 opacity-60 hover:opacity-100"
      >
        Refresh
      </button>
    </div>
  )
}
