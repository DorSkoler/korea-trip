import type { Weekday } from '../data/trip.schema'

export const TRIP_START = '2026-05-08'
export const TRIP_END = '2026-05-22'
export const TRIP_DAYS = 15

const WEEKDAY_ORDER: Weekday[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]

export function dateForDayNumber(dayNumber: number): string {
  const base = new Date(`${TRIP_START}T00:00:00`)
  base.setDate(base.getDate() + (dayNumber - 1))
  return base.toISOString().slice(0, 10)
}

export function weekdayFromISODate(iso: string): Weekday {
  const d = new Date(`${iso}T00:00:00`)
  return WEEKDAY_ORDER[d.getDay()]
}

export function dayNumberForDate(iso: string): number | null {
  const start = new Date(`${TRIP_START}T00:00:00`).getTime()
  const target = new Date(`${iso}T00:00:00`).getTime()
  const diff = Math.round((target - start) / 86_400_000) + 1
  if (diff < 1 || diff > TRIP_DAYS) return null
  return diff
}

export function currentDayNumber(now: Date = new Date()): number {
  const iso = now.toISOString().slice(0, 10)
  if (iso < TRIP_START) return 1
  if (iso > TRIP_END) return TRIP_DAYS
  return dayNumberForDate(iso) ?? 1
}
