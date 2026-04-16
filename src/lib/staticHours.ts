import type { OpeningHours } from '../data/trip.schema'

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABEL_EN: Record<(typeof DAY_ORDER)[number], string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

export function staticWeekdayDescriptions(
  hours: OpeningHours | undefined,
): string[] | null {
  if (!hours) return null
  const lines: string[] = []
  let anyDaySet = false
  for (const d of DAY_ORDER) {
    const v = hours[d]
    if (v === undefined) {
      lines.push(`${DAY_LABEL_EN[d]}: —`)
    } else if (v === 'closed') {
      lines.push(`${DAY_LABEL_EN[d]}: Closed`)
      anyDaySet = true
    } else {
      lines.push(`${DAY_LABEL_EN[d]}: ${v}`)
      anyDaySet = true
    }
  }
  return anyDaySet ? lines : null
}

export function staticHoursNote(
  hours: OpeningHours | undefined,
): string | null {
  return hours?.notes ?? null
}
