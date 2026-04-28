import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  isLast: boolean
  timeStart?: string
  timeBadge?: string
  /** Visual style of the dot on the rail */
  variant: 'place' | 'transport' | 'note'
  mustDo?: boolean
  setNodeRef?: (el: HTMLElement | null) => void
  rowStyle?: CSSProperties
  rowProps?: HTMLAttributes<HTMLDivElement>
}>

export function TimelineRow({
  children,
  isLast,
  timeStart,
  timeBadge,
  variant,
  mustDo = false,
  setNodeRef,
  rowStyle,
  rowProps,
}: Props) {
  const dotSize = variant === 'place' ? 'h-3 w-3' : 'h-2 w-2'
  const dotColor =
    variant === 'place'
      ? mustDo
        ? 'bg-yellow-400'
        : 'bg-emerald-500'
      : 'bg-current opacity-30'
  const dotRing =
    variant === 'place' ? 'ring-[3px] ring-current/10' : ''
  const padBottom = variant === 'place' ? 'pb-3' : 'pb-2'

  return (
    <div
      ref={setNodeRef as never}
      style={rowStyle}
      {...rowProps}
      className={`flex items-stretch gap-2 ${padBottom}`}
    >
      {/* Time column (start side) */}
      <div className="w-[3.25rem] shrink-0 text-end pt-2.5 leading-none">
        {timeStart && (
          <div className="text-base font-bold tabular-nums" dir="ltr">
            {timeStart}
          </div>
        )}
        {timeBadge && (
          <div
            className="text-[10px] opacity-60 mt-1 tabular-nums"
            dir="ltr"
          >
            {timeBadge}
          </div>
        )}
      </div>

      {/* Rail with dot + connector */}
      <div className="relative w-3 shrink-0 flex justify-center">
        <span
          className={`mt-3.5 ${dotSize} rounded-full ${dotColor} ${dotRing} relative z-10`}
        />
        {!isLast && (
          <span className="absolute top-0 bottom-[-0.75rem] inset-x-0 mx-auto w-px bg-current/15" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
