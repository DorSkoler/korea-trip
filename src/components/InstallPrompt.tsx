import { useState } from 'react'
import { useInstallPrompt } from '../lib/useInstallPrompt'

export function InstallPrompt() {
  const state = useInstallPrompt()
  const [result, setResult] = useState<string | null>(null)

  if (state.kind === 'installed') {
    return (
      <p className="text-xs opacity-70" dir="ltr">
        ✓ Installed on this device
      </p>
    )
  }

  if (state.kind === 'ios') {
    return (
      <p className="text-xs opacity-80 leading-snug" dir="ltr" lang="en">
        On iPhone: tap the Share icon in Safari → "Add to Home Screen" to
        install.
      </p>
    )
  }

  if (state.kind === 'ready') {
    return (
      <div className="flex gap-2 items-center flex-wrap" dir="ltr">
        <button
          type="button"
          onClick={async () => {
            const outcome = await state.prompt()
            setResult(outcome === 'accepted' ? 'Installed ✓' : 'Dismissed')
          }}
          className="glass rounded-full px-3 py-1.5 text-xs font-medium hover:scale-[1.02] active:scale-95 transition-transform"
        >
          📲 Install app
        </button>
        {result && <span className="text-xs opacity-70">{result}</span>}
      </div>
    )
  }

  return (
    <p className="text-xs opacity-60" dir="ltr">
      Install prompt not offered by this browser.
    </p>
  )
}
