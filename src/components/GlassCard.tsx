import type { HTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<
  {
    as?: keyof HTMLElementTagNameMap
    strong?: boolean
  } & HTMLAttributes<HTMLElement>
>

export function GlassCard({
  children,
  as = 'div',
  strong = false,
  className = '',
  ...rest
}: Props) {
  const Tag = as as 'div'
  const glass = strong ? 'glass-strong' : 'glass'
  return (
    <Tag className={`${glass} rounded-3xl ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
