import { useUIStore } from '../store/useUIStore'

export function LanguageToggle() {
  const lang = useUIStore((s) => s.lang)
  const toggle = useUIStore((s) => s.toggleLang)
  const label = lang === 'he' ? 'EN' : 'HE'
  const aria = lang === 'he' ? 'Switch to English' : 'החלף לעברית'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={aria}
      title={aria}
      className="glass rounded-full h-9 px-3 text-xs font-semibold tracking-wide hover:scale-105 active:scale-95 transition-transform"
      dir="ltr"
    >
      {label}
    </button>
  )
}
