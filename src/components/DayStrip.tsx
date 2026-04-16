import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRIP_DAYS } from '../lib/dates'

type Props = {
  current: number
}

export function DayStrip({ current }: Props) {
  const navigate = useNavigate()
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [current])

  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-3 py-2 no-scrollbar"
      dir="ltr"
      role="tablist"
      aria-label="Trip days"
    >
      {Array.from({ length: TRIP_DAYS }, (_, i) => i + 1).map((n) => {
        const active = n === current
        return (
          <button
            key={n}
            ref={active ? activeRef : null}
            role="tab"
            aria-selected={active}
            onClick={() => navigate(`/day/${n}`)}
            className={`h-8 min-w-8 shrink-0 rounded-full text-xs font-semibold transition-all ${
              active
                ? 'bg-emerald-500 text-white shadow-md scale-110 px-3'
                : 'glass opacity-70 hover:opacity-100 px-2'
            }`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
