import { useEffect, useState } from 'react'
import { CONFIG } from '../data/config'
import { useT } from '../i18n'
import { useUI } from '../store/uiStore'
import { useIsTouch } from './useIsTouch'

/** A short "how to move" bubble shown after loading. */
export function ControlsHint() {
  const t = useT()
  const isTouch = useIsTouch()
  const ready = useUI((s) => s.sceneReady)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => setVisible(false), CONFIG.ui.hintDurationMs)
    return () => window.clearTimeout(id)
  }, [ready])

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-10 flex justify-center px-6 transition-opacity duration-700 ${
        ready && visible ? 'opacity-100' : 'opacity-0'
      }`}
      // Above the joystick, clear of the HUD and the quest tracker.
      style={{ bottom: 'calc(max(1rem, env(safe-area-inset-bottom)) + 9.5rem)' }}
    >
      <p className="max-w-md rounded-2xl bg-ink/75 px-4 py-2 text-center text-sm font-bold text-cream shadow-[inset_0_0_0_2px_rgba(244,192,78,0.35)]">
        {t(isTouch ? 'hint.touch' : 'hint.desktop')}
      </p>
    </div>
  )
}
