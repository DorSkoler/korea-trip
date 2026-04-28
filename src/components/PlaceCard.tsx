import { useState, type HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlaceItem, Weekday } from '../data/trip.schema'
import { useTripStore } from '../store/useTripStore'
import { useUIStore } from '../store/useUIStore'
import { CATEGORY_ICON, FOOD_EMOJI } from '../lib/icons'
import { pick } from '../lib/pick'
import { DeepLinkButtons } from './DeepLinkButtons'
import { GlassCard } from './GlassCard'
import { HoursBadge } from './HoursBadge'
import { LiveHoursInline } from './LiveHoursInline'

type Props = {
  place: PlaceItem
  weekdayOnDate: Weekday
  done?: boolean
  onToggleDone?: () => void
  dragHandleProps?: HTMLAttributes<HTMLElement>
}

export function PlaceCard({
  place,
  weekdayOnDate,
  done = false,
  onToggleDone,
  dragHandleProps,
}: Props) {
  const { t } = useTranslation()
  const lang = useUIStore((s) => s.lang)
  const editMode = useUIStore((s) => s.editMode)
  const patchPlace = useTripStore((s) => s.patchPlace)
  const deleteItem = useTripStore((s) => s.deleteItem)
  const [expanded, setExpanded] = useState(false)

  const icon = CATEGORY_ICON[place.category]
  const foodIcon =
    place.foodLevel && place.foodLevel !== 'none'
      ? FOOD_EMOJI[place.foodLevel]
      : null
  const subLabel = lang === 'he' ? place.nameHe : undefined
  const notesText = pick(lang, place.notesHe, place.notesEn)
  const hasNotes = Boolean(notesText)

  function handleDelete() {
    if (!confirm(`Delete "${place.name}"?`)) return
    deleteItem(place.id)
  }

  return (
    <GlassCard className="p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {editMode ? (
          <button
            type="button"
            {...dragHandleProps}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            className="mt-1 h-6 w-6 shrink-0 rounded-md grid place-items-center cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 touch-none"
          >
            ⋮⋮
          </button>
        ) : (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onToggleDone?.()
            }}
            aria-pressed={done}
            aria-label={done ? t('place.markNotDone') : t('place.markDone')}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            className="-m-2 p-2 shrink-0 rounded-full grid place-items-center active:scale-95 transition-transform"
          >
            <span
              className={`h-7 w-7 rounded-full border-2 grid place-items-center text-sm font-bold transition-colors ${
                done
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-current opacity-60'
              }`}
            >
              {done ? '✓' : ''}
            </span>
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap" dir="ltr">
            <span className="text-xl shrink-0" aria-hidden>
              {icon}
            </span>
            {editMode ? (
              <input
                type="text"
                defaultValue={place.name}
                onBlur={(e) => {
                  const v = e.currentTarget.value.trim()
                  if (v && v !== place.name) patchPlace(place.id, { name: v })
                }}
                className="flex-1 min-w-0 text-lg font-semibold bg-transparent border-b border-current/30 focus:border-emerald-500 outline-none"
              />
            ) : (
              <h3 className="text-lg font-semibold tracking-tight leading-tight">
                {place.name}
              </h3>
            )}
            {editMode ? (
              <button
                type="button"
                onClick={() =>
                  patchPlace(place.id, { mustDo: !place.mustDo })
                }
                aria-label={t('place.mustDo')}
                title={t('place.mustDo')}
                className={`text-sm ${place.mustDo ? 'text-yellow-500' : 'opacity-40'}`}
              >
                ⭐
              </button>
            ) : (
              place.mustDo && (
                <span
                  className="text-yellow-500 text-base"
                  aria-label={t('place.mustDo')}
                  title={t('place.mustDo')}
                >
                  ⭐
                </span>
              )
            )}
            {foodIcon && !editMode && (
              <span className="text-base opacity-90" aria-hidden>
                {foodIcon}
              </span>
            )}
            {editMode && (
              <button
                type="button"
                onClick={handleDelete}
                className="ms-auto text-red-500 hover:scale-110 active:scale-90 transition-transform text-sm"
                aria-label={`Delete ${place.name}`}
                title={`Delete ${place.name}`}
              >
                🗑
              </button>
            )}
          </div>

          {editMode && (
            <div className="mt-2 flex gap-2 items-center flex-wrap" dir="ltr">
              <input
                type="time"
                defaultValue={place.startTime ?? ''}
                onBlur={(e) => {
                  const v = e.currentTarget.value
                  if (v !== (place.startTime ?? ''))
                    patchPlace(place.id, { startTime: v || undefined })
                }}
                className="glass rounded-full px-2 py-1 text-xs bg-transparent"
              />
              <input
                type="number"
                min="0"
                step="15"
                placeholder="min"
                defaultValue={place.durationMin ?? ''}
                onBlur={(e) => {
                  const raw = e.currentTarget.value
                  const v = raw ? Number(raw) : undefined
                  if (v !== place.durationMin)
                    patchPlace(place.id, { durationMin: v })
                }}
                className="glass rounded-full px-2 py-1 text-xs bg-transparent w-20"
              />
            </div>
          )}

          {subLabel && !editMode && (
            <p className="text-sm opacity-70 mt-0.5">{subLabel}</p>
          )}
          {editMode && lang === 'he' && (
            <input
              type="text"
              defaultValue={place.nameHe ?? ''}
              placeholder="שם בעברית"
              onBlur={(e) => {
                const v = e.currentTarget.value.trim()
                if (v !== (place.nameHe ?? ''))
                  patchPlace(place.id, { nameHe: v || undefined })
              }}
              className="mt-1 w-full text-sm bg-transparent border-b border-current/20 focus:border-emerald-500 outline-none"
              dir="rtl"
            />
          )}

          {editMode ? (
            <input
              type="text"
              defaultValue={place.address}
              onBlur={(e) => {
                const v = e.currentTarget.value.trim()
                if (v && v !== place.address)
                  patchPlace(place.id, { address: v })
              }}
              className="mt-2 w-full text-xs opacity-90 bg-transparent border-b border-current/20 focus:border-emerald-500 outline-none"
              dir="ltr"
              lang="en"
            />
          ) : (
            <p
              className="text-xs opacity-70 mt-1 leading-snug"
              dir="ltr"
              lang="en"
            >
              {place.address}
            </p>
          )}

          {!editMode && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <HoursBadge
                hours={place.openingHours}
                weekdayOnDate={weekdayOnDate}
              />
            </div>
          )}

          {!editMode && <DeepLinkButtons place={place} />}

          {!editMode && <LiveHoursInline place={place} />}

          {editMode && (
            <div className="mt-3">
              <textarea
                defaultValue={
                  (lang === 'he' ? place.notesHe : place.notesEn) ?? ''
                }
                placeholder={
                  lang === 'he' ? 'הערות אישיות…' : 'Your notes…'
                }
                rows={2}
                onBlur={(e) => {
                  const v = e.currentTarget.value
                  const field = lang === 'he' ? 'notesHe' : 'notesEn'
                  const current = lang === 'he' ? place.notesHe : place.notesEn
                  if (v !== (current ?? '')) {
                    patchPlace(place.id, { [field]: v || undefined })
                  }
                }}
                className="w-full glass rounded-2xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                dir={lang === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
          )}

          {!editMode && hasNotes && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 text-xs opacity-60 hover:opacity-100"
              aria-expanded={expanded}
            >
              {expanded
                ? t('place.notesToggleHide')
                : t('place.notesToggleShow')}
            </button>
          )}

          {!editMode && expanded && hasNotes && (
            <div className="mt-2 text-sm leading-relaxed opacity-85">
              <p dir={lang === 'he' ? 'rtl' : 'ltr'}>{notesText}</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
