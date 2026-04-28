import type { NoteItem as NoteItemType } from '../data/trip.schema'
import { useUIStore } from '../store/useUIStore'
import { pick } from '../lib/pick'

type Props = {
  item: NoteItemType
}

export function NoteItem({ item }: Props) {
  const lang = useUIStore((s) => s.lang)
  const text = pick(lang, item.textHe, item.textEn)
  if (!text) return null
  return (
    <div
      className="glass rounded-2xl px-4 py-3 mx-2 flex items-start gap-3 text-sm"
      role="note"
    >
      {item.emoji && (
        <span aria-hidden className="text-base leading-none mt-0.5">
          {item.emoji}
        </span>
      )}
      <p
        className="flex-1 min-w-0 leading-snug"
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        {text}
      </p>
    </div>
  )
}
