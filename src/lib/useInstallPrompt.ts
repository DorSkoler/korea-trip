import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallState =
  | { kind: 'unsupported' }
  | { kind: 'installed' }
  | { kind: 'ios' }
  | { kind: 'ready'; prompt: () => Promise<'accepted' | 'dismissed'> }

function isIOS(): boolean {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function useInstallPrompt(): InstallState {
  const [state, setState] = useState<InstallState>(() => {
    if (isStandalone()) return { kind: 'installed' }
    if (isIOS()) return { kind: 'ios' }
    return { kind: 'unsupported' }
  })

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      setState({
        kind: 'ready',
        prompt: async () => {
          await evt.prompt()
          const choice = await evt.userChoice
          return choice.outcome
        },
      })
    }
    function onInstalled() {
      setState({ kind: 'installed' })
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return state
}
