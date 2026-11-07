import { useT } from '../i18n'
import { useUI } from '../store/uiStore'

/** Fades the screen to a starry night while sleeping. */
export function SleepOverlay() {
  const t = useT()
  const sleeping = useUI((s) => s.sleeping)
  return (
    <div
      aria-hidden={!sleeping}
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-linear-to-b from-[#1d2550] to-[#3a3170] text-gold-light transition-opacity duration-700 ${
        sleeping ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {[
        [12, 18],
        [80, 12],
        [30, 70],
        [70, 64],
        [50, 30],
        [88, 80],
      ].map(([x, y], i) => (
        <span key={i} className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 300}ms` }} />
      ))}
      <p className="animate-sway font-display text-5xl font-extrabold">{t('sleep.title')}</p>
      <p className="text-sm font-bold opacity-80">{t('sleep.subtitle')}</p>
    </div>
  )
}
