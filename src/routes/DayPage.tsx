import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, type PanInfo } from 'framer-motion'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Day, Item, PlaceItem, TimeOfDay } from '../data/trip.schema'
import { NoteItem } from '../components/NoteItem'
import { PlaceCard } from '../components/PlaceCard'
import { TimeOfDayHeader } from '../components/TimeOfDayHeader'
import { TransportItem } from '../components/TransportItem'
import { TIME_OF_DAY_ORDER } from '../lib/icons'
import { pick } from '../lib/pick'
import { TRIP_DAYS, weekdayFromISODate } from '../lib/dates'
import { useTripStore } from '../store/useTripStore'
import { useUIStore } from '../store/useUIStore'

const SWIPE_THRESHOLD_PX = 60
const SWIPE_VELOCITY = 350
const AXIS_LOCK_RATIO = 1.5

type Section = {
  timeOfDay: TimeOfDay
  items: Item[]
}

function groupByTimeOfDay(items: Item[]): Section[] {
  const unknownBucket: Item[] = []
  const buckets: Record<TimeOfDay, Item[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  let currentBucket: TimeOfDay | null = null

  for (const item of items) {
    if (item.kind === 'place') {
      currentBucket = item.timeOfDay
      buckets[item.timeOfDay].push(item)
    } else {
      if (currentBucket) buckets[currentBucket].push(item)
      else unknownBucket.push(item)
    }
  }

  const sections: Section[] = []
  if (unknownBucket.length)
    sections.push({ timeOfDay: 'morning', items: unknownBucket })
  for (const t of TIME_OF_DAY_ORDER) {
    if (buckets[t].length) sections.push({ timeOfDay: t, items: buckets[t] })
  }
  return sections
}

type ItemRowProps = {
  item: Item
  weekdayOnDate: ReturnType<typeof weekdayFromISODate>
  done: boolean
  onToggleDone: () => void
  editMode: boolean
}

function SortableItemRow(props: ItemRowProps) {
  const { item, editMode } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !editMode })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {item.kind === 'place' ? (
        <PlaceCard
          place={item as PlaceItem}
          weekdayOnDate={props.weekdayOnDate}
          done={props.done}
          onToggleDone={props.onToggleDone}
          dragHandleProps={editMode ? { ...attributes, ...listeners } : undefined}
        />
      ) : item.kind === 'transport' ? (
        <TransportItem item={item} />
      ) : (
        <NoteItem item={item} />
      )}
    </div>
  )
}

type DayBodyProps = {
  day: Day
}

function DayBody({ day }: DayBodyProps) {
  const { t } = useTranslation()
  const lang = useUIStore((s) => s.lang)
  const editMode = useUIStore((s) => s.editMode)
  const isDone = useTripStore((s) => s.isDone)
  const toggleDone = useTripStore((s) => s.toggleDone)
  const addPlace = useTripStore((s) => s.addPlace)
  const reorderDay = useTripStore((s) => s.reorderDay)

  const weekday = weekdayFromISODate(day.date)
  const sections = useMemo(() => groupByTimeOfDay(day.items), [day.items])
  const title = pick(lang, day.titleHe, day.region) ?? day.region
  const summary = pick(lang, day.summaryHe, day.summaryEn)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const ids = day.items.map((i) => i.id)
    const from = ids.indexOf(String(e.active.id))
    const to = ids.indexOf(String(e.over.id))
    if (from === -1 || to === -1) return
    const next = [...ids]
    next.splice(to, 0, next.splice(from, 1)[0])
    reorderDay(day.dayNumber, next)
  }

  return (
    <div className="relative px-4 pb-24 pt-4">
      {day.heroImage && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden -z-10"
          aria-hidden
        >
          <img
            src={day.heroImage}
            alt=""
            className="h-full w-full object-cover opacity-70 dark:opacity-55"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 40%, var(--bg-to) 95%)',
            }}
          />
        </div>
      )}
      <header className="mb-4 px-1 relative">
        <p
          className="text-xs opacity-80 tracking-wider uppercase drop-shadow-sm"
          dir="ltr"
          lang="en"
        >
          {t('day.dayN', { n: day.dayNumber })} · {day.date}
        </p>
        <h1 className="text-2xl font-semibold leading-tight mt-1 drop-shadow-sm">
          {title}
        </h1>
        <p
          className="text-sm opacity-80 mt-0.5 drop-shadow-sm"
          dir="ltr"
          lang="en"
        >
          {day.region}
        </p>
        {summary && (
          <p
            className="text-sm opacity-90 mt-3 leading-relaxed"
            dir={lang === 'he' ? 'rtl' : 'ltr'}
          >
            {summary}
          </p>
        )}
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={day.items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <section key={section.timeOfDay}>
              <TimeOfDayHeader timeOfDay={section.timeOfDay} />
              <div className="space-y-2">
                {section.items.map((item) => (
                  <SortableItemRow
                    key={item.id}
                    item={item}
                    weekdayOnDate={weekday}
                    done={isDone(item.id)}
                    onToggleDone={() => toggleDone(item.id)}
                    editMode={editMode}
                  />
                ))}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => addPlace(day.dayNumber, section.timeOfDay)}
                    className="glass rounded-2xl w-full py-2.5 text-sm font-medium opacity-80 hover:opacity-100 hover:scale-[1.01] active:scale-[0.99] transition"
                    dir="ltr"
                  >
                    + Add place
                  </button>
                )}
              </div>
            </section>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default function DayPage() {
  const { dayNumber } = useParams<{ dayNumber: string }>()
  const navigate = useNavigate()
  const trip = useTripStore((s) => s.trip)

  const n = Number(dayNumber)
  if (!Number.isFinite(n) || n < 1 || n > TRIP_DAYS) {
    return <Navigate to="/day/1" replace />
  }

  const day = trip.days.find((d) => d.dayNumber === n)
  if (!day) return <Navigate to="/day/1" replace />

  function onPanEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info
    if (Math.abs(offset.x) < Math.abs(offset.y) * AXIS_LOCK_RATIO) return
    const isRTL = document.documentElement.dir === 'rtl'
    const swipeDir =
      offset.x > SWIPE_THRESHOLD_PX || velocity.x > SWIPE_VELOCITY
        ? isRTL
          ? 'next'
          : 'prev'
        : offset.x < -SWIPE_THRESHOLD_PX || velocity.x < -SWIPE_VELOCITY
          ? isRTL
            ? 'prev'
            : 'next'
          : null
    if (!swipeDir) return
    const target = swipeDir === 'next' ? n + 1 : n - 1
    if (target < 1 || target > TRIP_DAYS) return
    navigate(`/day/${target}`)
  }

  return (
    <motion.div
      key={n}
      onPanEnd={onPanEnd}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen"
    >
      <DayBody day={day} />
    </motion.div>
  )
}
