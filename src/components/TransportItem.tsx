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
      className="flex items-center gap-2 text-xs opacity-70 py-1.5"
      role="note"
    >
      <span aria-hidden className="text-base">
        {icon}
      </span>
      {item.fromTo && (
        <span className="truncate" dir="ltr" lang="en">
          {item.fromTo}
        </span>
      )}
      {note && (
        <span className="truncate opacity-80">
          · {note}
        </span>
      )}
      {item.mode === 'ktx' && (
        <span className="text-[10px] opacity-70" dir="ltr">
          KTX
        </span>
      )}
    </div>
  )
}
