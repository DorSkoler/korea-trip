import type { TransportItem as TransportItemType } from '../data/trip.schema'
import { useUIStore } from '../store/useUIStore'
import { TRANSPORT_ICON } from '../lib/icons'
import { pick } from '../lib/pick'

type Props = {
  item: TransportItemType
}

export function TransportItem({ item }: Props) {
  const lang = useUIStore((s) => s.lang)
  const icon = TRANSPORT_ICON[item.mode]
  const note = pick(lang, item.notesHe, item.notesEn)
  return (
    <div
      className="mx-10 flex items-center gap-2 text-xs opacity-70"
      role="note"
    >
      <span aria-hidden className="text-base">
        {icon}
      </span>
      {item.durationMin && (
        <span dir="ltr" className="font-medium tabular-nums">
          {item.durationMin} min
          {item.mode === 'ktx' ? ' · KTX' : ''}
        </span>
      )}
      {item.fromTo && (
        <span className="truncate" dir="ltr" lang="en">
          · {item.fromTo}
        </span>
      )}
      {note && (
        <span className="truncate opacity-80">
          · {note}
        </span>
      )}
    </div>
  )
}
