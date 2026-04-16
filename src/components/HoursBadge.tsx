import { useTranslation } from 'react-i18next'
import type { OpeningHours, Weekday } from '../data/trip.schema'

type Props = {
  hours?: OpeningHours
  weekdayOnDate: Weekday
}

export function HoursBadge({ hours, weekdayOnDate }: Props) {
  const { t } = useTranslation()

  if (!hours) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs opacity-60"
        dir="ltr"
      >
        <span aria-hidden>⏱</span>
        <span>{t('place.hoursUnknown')}</span>
      </span>
    )
  }

  const todayValue = hours[weekdayOnDate]
  const notes = hours.notes

  if (todayValue === 'closed') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium text-red-500"
        dir="ltr"
      >
        <span aria-hidden>⚠</span>
        <span>{t('place.closedToday')}</span>
      </span>
    )
  }

  if (todayValue) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs opacity-80"
        dir="ltr"
      >
        <span aria-hidden>⏱</span>
        <span>{todayValue}</span>
      </span>
    )
  }

  if (notes) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs opacity-70"
        dir="ltr"
      >
        <span aria-hidden>ℹ️</span>
        <span>{notes}</span>
      </span>
    )
  }

  return null
}
