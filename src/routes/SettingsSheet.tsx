import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassCard } from '../components/GlassCard'
import { InstallPrompt } from '../components/InstallPrompt'
import { LanguageToggle } from '../components/LanguageToggle'
import { clearLiveHoursCache } from '../lib/livePlaces'
import { useTripStore } from '../store/useTripStore'

type Props = {
  open: boolean
  onClose: () => void
}

export function SettingsSheet({ open, onClose }: Props) {
  const { t } = useTranslation()
  const resetProgress = useTripStore((s) => s.resetProgress)
  const exportBackup = useTripStore((s) => s.exportBackup)
  const importBackup = useTripStore((s) => s.importBackup)
  const doneCount = useTripStore((s) => Object.keys(s.overlay.done).length)
  const totalPlaces = useTripStore((s) => s.totalPlaces)
  const [importError, setImportError] = useState<string | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  function handleExport() {
    const json = exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `korea-trip-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    setImportError(null)
    setImportMessage(null)
    fileRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      importBackup(text)
      setImportMessage('Backup restored ✓')
    } catch (err) {
      setImportError((err as Error).message)
    } finally {
      e.target.value = ''
    }
  }

  function handleReset() {
    if (
      !confirm('Reset all check-offs? This does not affect the itinerary itself.')
    )
      return
    resetProgress()
    setImportMessage('Progress reset ✓')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('settings.title')}
            className="fixed inset-x-0 bottom-0 z-50 p-4"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <GlassCard strong className="p-5 space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold flex-1">
                  {t('settings.title')}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="glass rounded-full h-8 w-8 grid place-items-center hover:scale-105 active:scale-95 transition-transform"
                >
                  ✕
                </button>
              </div>

              <section className="flex items-center justify-between">
                <span className="text-sm opacity-80">
                  Language &middot; שפה
                </span>
                <LanguageToggle />
              </section>

              <section className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm opacity-80">Progress</span>
                  <span
                    className="text-xs opacity-60 ms-auto"
                    dir="ltr"
                    lang="en"
                  >
                    {doneCount} / {totalPlaces}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-current/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: totalPlaces
                        ? `${(doneCount / totalPlaces) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <div className="flex gap-2 flex-wrap" dir="ltr">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="glass rounded-full px-3 py-1.5 text-xs font-medium hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    Reset all edits & check-offs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearLiveHoursCache()
                      setImportMessage('Live-hours cache cleared ✓')
                    }}
                    className="glass rounded-full px-3 py-1.5 text-xs font-medium hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    Clear live-hours cache
                  </button>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-sm opacity-80" dir="ltr">
                  Install &middot; התקנה
                </p>
                <InstallPrompt />
              </section>

              <section className="space-y-2">
                <p className="text-sm opacity-80">
                  Backup &middot; גיבוי
                </p>
                <div className="flex gap-2 flex-wrap" dir="ltr">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="glass rounded-full px-3 py-1.5 text-xs font-medium hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    ⬇ Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="glass rounded-full px-3 py-1.5 text-xs font-medium hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    ⬆ Import JSON
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>
                {importMessage && (
                  <p className="text-xs text-emerald-500">{importMessage}</p>
                )}
                {importError && (
                  <p className="text-xs text-red-500" dir="ltr">
                    {importError}
                  </p>
                )}
              </section>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
