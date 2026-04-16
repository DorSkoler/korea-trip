import type { Lang } from '../i18n'

export function pick(
  lang: Lang,
  he: string | undefined,
  en: string | undefined,
): string | undefined {
  if (lang === 'he') return he ?? en
  return en ?? he
}
