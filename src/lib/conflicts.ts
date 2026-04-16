import type { Day, PlaceItem, Weekday } from '../data/trip.schema'
import { weekdayFromISODate } from './dates'

export type Conflict = {
  placeId: string
  placeName: string
  dayNumber: number
  weekday: Weekday
  severity: 'error' | 'warning' | 'info'
  messageEn: string
}

function isClosedOn(place: PlaceItem, weekday: Weekday): boolean {
  const hours = place.openingHours
  if (!hours) return false
  const value = hours[weekday]
  return value === 'closed'
}

export function computeDayConflicts(day: Day): Conflict[] {
  const weekday = weekdayFromISODate(day.date)
  const out: Conflict[] = []
  for (const item of day.items) {
    if (item.kind !== 'place') continue
    if (!item.openingHours) continue
    if (isClosedOn(item, weekday)) {
      out.push({
        placeId: item.id,
        placeName: item.name,
        dayNumber: day.dayNumber,
        weekday,
        severity: 'error',
        messageEn: `Closed on ${weekday.toUpperCase()}`,
      })
    }
  }
  return out
}

export function computeTripConflicts(days: Day[]): Conflict[] {
  return days.flatMap(computeDayConflicts)
}
