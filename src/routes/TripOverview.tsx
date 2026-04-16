import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { weekdayFromISODate } from '../lib/dates'
import { pick } from '../lib/pick'
import { useTripStore } from '../store/useTripStore'
import { useUIStore } from '../store/useUIStore'

const WEEKDAY_LABEL: Record<string, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
}

export default function TripOverview() {
  const { t } = useTranslation()
  const lang = useUIStore((s) => s.lang)
  const trip = useTripStore((s) => s.trip)
  const overlay = useTripStore((s) => s.overlay)

  return (
    <main className="px-4 pb-16 pt-8 max-w-2xl mx-auto">
      <header className="mb-6 px-1">
        <p
          className="text-xs opacity-60 uppercase tracking-wider"
          dir="ltr"
          lang="en"
        >
          May 8 &ndash; 22, 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">
          {t('app.overviewTitle')}
        </h1>
        <p className="text-sm opacity-70 mt-1">{t('app.overviewSubtitle')}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {trip.days.map((d) => {
          const weekday = weekdayFromISODate(d.date)
          const places = d.items.filter((i) => i.kind === 'place')
          const placeCount = places.length
          const doneCount = places.filter((p) => overlay.done[p.id]).length
          const allDone = placeCount > 0 && doneCount === placeCount
          const title = pick(lang, d.titleHe, d.region) ?? d.region
          return (
            <Link
              key={d.dayNumber}
              to={`/day/${d.dayNumber}`}
              className="block"
            >
              <GlassCard className="h-full overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.99]">
                {d.heroImage && (
                  <div className="relative h-24 -mx-px -mt-px overflow-hidden">
                    <img
                      src={d.heroImage}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))',
                      }}
                    />
                    <div
                      className="absolute top-1.5 left-1.5 right-1.5 flex items-baseline justify-between text-[11px] font-medium text-white drop-shadow"
                      dir="ltr"
                    >
                      <span>{t('day.dayN', { n: d.dayNumber })}</span>
                      <span className="opacity-85">
                        {WEEKDAY_LABEL[weekday]}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  {!d.heroImage && (
                    <div
                      className="flex items-baseline justify-between text-xs opacity-60"
                      dir="ltr"
                    >
                      <span>{t('day.dayN', { n: d.dayNumber })}</span>
                      <span>{WEEKDAY_LABEL[weekday]}</span>
                    </div>
                  )}
                  <p
                    className="text-sm font-medium mt-1 line-clamp-2 leading-snug"
                    dir={lang === 'he' ? 'rtl' : 'ltr'}
                  >
                    {title}
                  </p>
                  <div
                    className="flex items-center justify-between mt-2"
                    dir="ltr"
                  >
                    <p className="text-[11px] opacity-60" lang="en">
                      {d.date} · {t('day.placesCount', { count: placeCount })}
                    </p>
                    {placeCount > 0 && (
                      <span
                        className={`text-[11px] ${
                          allDone ? 'text-emerald-500' : 'opacity-70'
                        }`}
                        dir="ltr"
                      >
                        {doneCount}/{placeCount}
                        {allDone && ' ✓'}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
