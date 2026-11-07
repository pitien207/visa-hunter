import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { useUI } from '../store/uiStore'

/** A Hội An-style silk lantern drawn in SVG. */
export function Lantern({ color, delay, size }: { color: string; delay: number; size: number }) {
  return (
    <div className="animate-sway origin-top" style={{ animationDelay: `${delay}ms` }}>
      <div className="mx-auto h-8 w-px bg-ink/40" />
      <svg viewBox="0 0 40 64" width={size} height={size * 1.6} aria-hidden="true">
        <rect x="14" y="0" width="12" height="5" rx="1.5" fill="#b9822a" />
        <ellipse cx="20" cy="30" rx="18" ry="24" fill={color} />
        <path d="M20 6v48M8 12c-4 12-4 24 0 36M32 12c4 12 4 24 0 36" stroke="rgba(255,230,166,0.55)" strokeWidth="1.5" fill="none" />
        <rect x="14" y="52" width="12" height="5" rx="1.5" fill="#b9822a" />
        <path d="M17 57l-2 7M20 57v7M23 57l2 7" stroke="#f4c04e" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

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
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#ffd9a8] via-[#ffe9cc] to-paper transition-opacity duration-500 ${
        ready ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-x-0 top-0 flex justify-around px-4">
        <Lantern color="#d4473b" delay={0} size={40} />
        <Lantern color="#f4c04e" delay={400} size={30} />
        <Lantern color="#d4473b" delay={800} size={46} />
        <Lantern color="#ff9b8f" delay={200} size={32} />
        <Lantern color="#d4473b" delay={600} size={40} />
      </div>

      <h1 className="font-display text-6xl font-extrabold tracking-tight text-lacquer drop-shadow-[0_4px_0_#f4c04e]">Visa Hunter</h1>
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
