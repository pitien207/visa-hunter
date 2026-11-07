import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { useUI } from '../store/uiStore'
import { HanoiScenery } from './HanoiScenery'

/** Covers the screen until the 3D scene has rendered a few frames, then fades out. */
export function LoadingScreen() {
  const t = useT()
  const ready = useUI((s) => s.sceneReady)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => setGone(true), 600)
    return () => window.clearTimeout(id)
  }, [ready])

  if (gone) return null

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#bfe3ff] via-[#ffe9cc] to-[#ffd9a8] transition-opacity duration-500 ${
        ready ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <HanoiScenery className="absolute inset-x-0 bottom-0 h-[42%] w-full" />

      <h1 className="relative -mt-[18vh] font-display text-6xl font-extrabold tracking-tight text-lacquer drop-shadow-[0_4px_0_#f4c04e]">Visa Hunter</h1>
      <p className="mt-1 px-6 text-center text-sm font-bold text-ink/75">{t('loading.subtitle')}</p>
      <div className="mt-5 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-3 w-3 animate-bounce rounded-full bg-lacquer" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <p className="mt-2 font-bold text-ink/70">{t('loading.text')}</p>
    </div>
  )
}
