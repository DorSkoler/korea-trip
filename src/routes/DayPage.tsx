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
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Day, Item, PlaceItem } from '../data/trip.schema'
import { NoteItem } from '../components/NoteItem'
import { PlaceCard } from '../components/PlaceCard'
import { TimelineRow } from '../components/TimelineRow'
import { TransportItem } from '../components/TransportItem'
import { pick } from '../lib/pick'
import { TRIP_DAYS, weekdayFromISODate } from '../lib/dates'
import { useTripStore } from '../store/useTripStore'
import { useUIStore } from '../store/useUIStore'

const SWIPE_THRESHOLD_PX = 60
const SWIPE_VELOCITY = 350
const AXIS_LOCK_RATIO = 1.5

type ItemRowProps = {
  item: Item
  weekdayOnDate: ReturnType<typeof weekdayFromISODate>
  done: boolean
  onToggleDone: () => void
  editMode: boolean
  isLast: boolean
}

function SortableItemRow(props: ItemRowProps) {
  const { item, editMode, isLast } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !editMode })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (item.kind === 'place') {
    const place = item as PlaceItem
    const durationBadge = place.durationMin
      ? place.durationMin >= 60
        ? `~${Math.round(place.durationMin / 60)}h`
        : `~${place.durationMin}m`
      : undefined
    return (
      <TimelineRow
        setNodeRef={setNodeRef}
        rowStyle={style}
        isLast={isLast}
        timeStart={place.startTime}
        timeBadge={durationBadge}
        variant="place"
        mustDo={Boolean(place.mustDo)}
      >
        <PlaceCard
          place={place}
          weekdayOnDate={props.weekdayOnDate}
          done={props.done}
          onToggleDone={props.onToggleDone}
          dragHandleProps={editMode ? { ...attributes, ...listeners } : undefined}
        />
      </TimelineRow>
    )
  }

  if (item.kind === 'transport') {
    const badge = item.durationMin ? `${item.durationMin}m` : undefined
    return (
      <TimelineRow
        setNodeRef={setNodeRef}
        rowStyle={style}
        isLast={isLast}
        timeBadge={badge}
        variant="transport"
      >
        <TransportItem item={item} />
      </TimelineRow>
    )
  }

  return (
    <TimelineRow
      setNodeRef={setNodeRef}
      rowStyle={style}
      isLast={isLast}
      variant="note"
    >
      <NoteItem item={item} />
    </TimelineRow>
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
  const items = day.items
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
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {items.map((item, i) => (
              <SortableItemRow
                key={item.id}
                item={item}
                weekdayOnDate={weekday}
                done={isDone(item.id)}
                onToggleDone={() => toggleDone(item.id)}
                editMode={editMode}
                isLast={i === items.length - 1}
              />
            ))}
            {editMode && (
              <button
                type="button"
                onClick={() => addPlace(day.dayNumber, 'morning')}
                className="glass rounded-2xl w-full py-2.5 text-sm font-medium opacity-80 hover:opacity-100 hover:scale-[1.01] active:scale-[0.99] transition mt-3 ms-[4.75rem]"
                dir="ltr"
              >
                + Add place
              </button>
            )}
          </div>
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
