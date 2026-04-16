import { useTranslation } from 'react-i18next'
import type { TimeOfDay } from '../data/trip.schema'
import { TIME_OF_DAY_EMOJI } from '../lib/icons'

type Props = {
  timeOfDay: TimeOfDay
}

export function TimeOfDayHeader({ timeOfDay }: Props) {
  const { t } = useTranslation()
  return (
    <div className="mt-6 mb-2 flex items-center gap-2 px-2">
      <span className="text-xl" aria-hidden>
        {TIME_OF_DAY_EMOJI[timeOfDay]}
      </span>
      <h2 className="text-sm font-semibold opacity-75 tracking-wide uppercase">
        {t(`timeOfDay.${timeOfDay}`)}
      </h2>
      <div className="flex-1 h-px bg-current opacity-10 ms-2" />
    </div>
  )
}
