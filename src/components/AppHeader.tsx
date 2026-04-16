import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { SettingsSheet } from '../routes/SettingsSheet'
import { TRIP_DAYS } from '../lib/dates'
import { useTripStore } from '../store/useTripStore'
import { useUIStore } from '../store/useUIStore'
import { DayStrip } from './DayStrip'
import { LanguageToggle } from './LanguageToggle'

export function AppHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const editMode = useUIStore((s) => s.editMode)
  const toggleEditMode = useUIStore((s) => s.toggleEditMode)
  const isOverview = location.pathname === '/'
  const dayMatch = location.pathname.match(/^\/day\/(\d+)/)
  const current = dayMatch ? Number(dayMatch[1]) : 1
  const overlay = useTripStore((s) => s.overlay)
  const trip = useTripStore((s) => s.trip)
  const dayProgress = (() => {
    const d = trip.days.find((x) => x.dayNumber === current)
    if (!d) return { done: 0, total: 0 }
    const places = d.items.filter((i) => i.kind === 'place')
    return {
      done: places.filter((p) => overlay.done[p.id]).length,
      total: places.length,
    }
  })()

  return (
    <>
      <header
        className="glass-strong sticky top-0 z-30 border-b border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 pt-2 pb-1 flex items-center gap-3">
          <Link
            to="/"
            aria-label={t('app.homeAria') ?? 'Trip overview'}
            className="text-lg hover:scale-110 transition-transform"
          >
            🇰🇷
          </Link>
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] opacity-60 tracking-wider uppercase truncate"
              dir="ltr"
              lang="en"
            >
              Korea &middot; May 2026
              {!isOverview && dayProgress.total > 0 && (
                <span className="ms-2">
                  · {dayProgress.done}/{dayProgress.total} ✓
                </span>
              )}
            </p>
            <p className="text-sm font-semibold truncate">
              {isOverview
                ? t('app.overview')
                : t('app.dayOfN', { n: current, total: TRIP_DAYS })}
            </p>
          </div>
          <LanguageToggle />
          {!isOverview && (
            <button
              type="button"
              onClick={toggleEditMode}
              aria-pressed={editMode}
              aria-label={editMode ? 'Done editing' : 'Edit'}
              title={editMode ? 'Done editing' : 'Edit'}
              className={`rounded-full h-9 w-9 grid place-items-center transition-all ${
                editMode
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'glass hover:scale-105 active:scale-95'
              }`}
            >
              {editMode ? '✓' : '✏️'}
            </button>
          )}
          <button
            type="button"
            aria-label={t('settings.title') ?? 'Settings'}
            onClick={() => setSettingsOpen(true)}
            className="glass rounded-full h-9 w-9 grid place-items-center hover:scale-105 active:scale-95 transition-transform"
            title={t('settings.title')}
          >
            ⚙️
          </button>
        </div>
        {!isOverview && <DayStrip current={current} />}
        {!isOverview && (
          <div className="h-0.5 bg-current opacity-10">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(current / TRIP_DAYS) * 100}%` }}
            />
          </div>
        )}
      </header>
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
