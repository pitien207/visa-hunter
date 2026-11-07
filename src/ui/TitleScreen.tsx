import { useEffect, useMemo } from 'react'
import { LANGUAGE_NAMES, useT } from '../i18n'
import { useSettings, type Language } from '../store/settingsStore'
import { Lantern } from './LoadingScreen'

/** Day number of the saved game, if there is one (read without loading the game code). */
function savedDay(): number | null {
  try {
    const raw = localStorage.getItem('visa-hunter-save')
    if (!raw) return null
    const day = (JSON.parse(raw) as { time?: { day?: unknown } }).time?.day
    return typeof day === 'number' ? day : null
  } catch {
    return null
  }
}

/**
 * Title screen (M9): shows instantly, unlocks audio with the first tap, and only then
 * loads the 3D game. `loading` = the game code is on its way.
 */
export function TitleScreen({ onPlay, loading = false }: { onPlay?: () => void; loading?: boolean }) {
  const t = useT()
  const language = useSettings((s) => s.language)
  const setLanguage = useSettings((s) => s.setLanguage)
  const day = useMemo(savedDay, [])

  // Desktop: Enter / Space starts the game.
  useEffect(() => {
    if (loading || !onPlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        onPlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, onPlay])

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#ffd9a8] via-[#ffe9cc] to-paper text-ink">
      <div className="absolute inset-x-0 top-0 flex justify-around px-4">
        <Lantern color="#d4473b" delay={0} size={40} />
        <Lantern color="#f4c04e" delay={400} size={30} />
        <Lantern color="#d4473b" delay={800} size={46} />
        <Lantern color="#ff9b8f" delay={200} size={32} />
        <Lantern color="#d4473b" delay={600} size={40} />
      </div>

      <h1 className="font-display text-6xl font-extrabold tracking-tight text-lacquer drop-shadow-[0_4px_0_#f4c04e]">Visa Hunter</h1>
      <p className="mt-1 px-6 text-center text-sm font-bold text-ink/75">{t('loading.subtitle')}</p>

      {loading ? (
        <>
          <div className="mt-8 flex gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-3 w-3 animate-bounce rounded-full bg-lacquer" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
          <p className="mt-2 font-bold text-ink/70">{t('loading.text')}</p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onPlay}
            className="mt-8 flex flex-col items-center rounded-full btn-lacquer px-12 py-3 font-display text-3xl font-extrabold active:translate-y-1 active:shadow-none"
          >
            ▶ {day ? t('title.continue') : t('title.play')}
            {day && <span className="font-sans text-xs font-black opacity-90">{t('hud.day', { day })}</span>}
          </button>
          <div className="mt-6 flex gap-1 rounded-full bg-ink/10 p-1" role="group" aria-label={t('settings.language')}>
            {(Object.keys(LANGUAGE_NAMES) as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                aria-pressed={language === l}
                className={`min-w-11 rounded-full px-3 py-1.5 text-sm font-extrabold ${language === l ? 'bg-[#a8322a] text-white shadow' : 'text-ink/80'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="absolute bottom-3 px-6 text-center text-xs font-bold text-ink/75" style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {t('title.hint')}
      </p>
    </div>
  )
}
