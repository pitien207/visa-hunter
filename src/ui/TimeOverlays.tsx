import { useEffect, useState } from 'react'
import { currentObjective } from '../game/systems/watchers'
import { longDate } from '../game/systems/calendar'
import { formatClock } from '../game/systems/time'
import { isRainyDay } from '../game/systems/weather'
import { SCENES } from '../game/scenes/registry'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { usePlayer } from '../store/playerStore'
import { useSettings } from '../store/settingsStore'
import { useTime } from '../store/timeStore'
import { useUI } from '../store/uiStore'
import { useWorld } from '../store/worldStore'
import { useMinigame } from '../store/minigameStore'
import { useDialogue } from '../store/dialogueStore'

/** While waiting: the clock spins in the middle of the screen. */
export function FastForwardOverlay() {
  const t = useT()
  const localize = useLocalize()
  const ff = useUI((s) => s.fastForward)
  const minutes = useTime((s) => Math.floor(s.minutes))
  if (!ff) return null
  const progress = 1 - ff.remaining / Math.max(1, ff.total)
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle,rgba(43,36,64,0.15),rgba(43,36,64,0.55))]">
      <div className="panel flex min-w-56 flex-col items-center gap-1 px-6 py-4">
        <span className="animate-spin text-3xl [animation-duration:1.2s]">⏳</span>
        <span className="font-display text-5xl leading-none font-extrabold tabular-nums">{formatClock(minutes)}</span>
        <span className="text-sm font-extrabold text-ink/75">{ff.label ? localize(ff.label) : t('clock.waiting')}</span>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-jade" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

/** After waking up: the date, today's weather, yesterday in numbers, what to do next. */
export function NewDayCard() {
  const t = useT()
  const localize = useLocalize()
  const open = useUI((s) => s.newDayOpen)
  const summary = useUI((s) => s.daySummary)
  const setOpen = useUI((s) => s.setNewDayOpen)
  const day = useTime((s) => s.day)
  const language = useSettings((s) => s.language)
  const scene = useWorld((s) => s.scene)
  const currency = usePlayer((s) => s.currency)
  const [, rerender] = useState(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    // The objective may update a moment after waking (quest watchers run debounced).
    const id = window.setTimeout(() => rerender((n) => n + 1), 300)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(id)
    }
  }, [open, setOpen])

  if (!open) return null
  const country = SCENES[scene].country
  const rainy = isRainyDay(day, country)
  const objective = currentObjective()
  const s = summary && summary.day === day ? summary : null
  const moneyText = s && s.money !== 0 ? `${s.money > 0 ? '+' : '−'}${formatMoney(Math.abs(s.money), currency)}` : '±0'

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 grid place-items-center bg-linear-to-b from-[#ffd9a8]/85 via-[#ffe9cc]/80 to-[#bfe3ff]/80 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="panel animate-pop relative w-full max-w-xs p-5 pt-8 text-center text-ink">
        <span className="absolute -top-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-gold text-3xl shadow-[0_3px_0_#c9962a]">
          {rainy ? '🌧' : '🌅'}
        </span>
        <p className="text-xs font-black tracking-wide text-lacquer uppercase">{t('newDay.title', { day })}</p>
        <p className="font-display text-2xl leading-tight font-extrabold">{longDate(day, language)}</p>
        <p className="mt-1 text-sm font-bold text-ink/75">
          {rainy ? (country === 'vn' ? t('newDay.drizzle') : t('newDay.rain')) : t('newDay.sunny')}
        </p>

        {s && (
          <div className="mt-3 rounded-2xl bg-white/80 p-2.5 text-left shadow-[inset_0_0_0_2px_#f1dcb6]">
            <p className="mb-1 text-xs font-black text-ink/70 uppercase">{t('newDay.yesterday')}</p>
            <ul className="grid grid-cols-3 gap-1 text-center text-[12px] font-extrabold">
              <li className="rounded-xl bg-butter/60 px-1 py-1.5">
                💰
                <br />
                <span className="tabular-nums">{moneyText}</span>
              </li>
              <li className="rounded-xl bg-mint/60 px-1 py-1.5">
                📚
                <br />
                <span className="tabular-nums">+{s.germanXp} XP</span>
              </li>
              <li className="rounded-xl bg-rose/40 px-1 py-1.5">
                ✅
                <br />
                <span className="tabular-nums">{t('newDay.steps', { n: s.steps })}</span>
              </li>
            </ul>
            {s.passedOut && <p className="mt-1.5 text-center text-xs font-bold text-lacquer">{t('newDay.passedOut')}</p>}
          </div>
        )}

        {objective && (
          <p className="mt-3 rounded-2xl bg-jade/10 px-3 py-2 text-sm font-bold">
            🎯 {localize(objective.step.text)}
          </p>
        )}

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 w-full rounded-2xl btn-lacquer py-3 font-display text-xl font-extrabold active:translate-y-1 active:shadow-none"
        >
          {t('newDay.start')}
        </button>
      </div>
    </div>
  )
}

/**
 * Arriving somewhere: a street-name plaque slides in for a few seconds —
 * Hà Nội's blue enamel street signs, a German street sign, or a room nameplate.
 */
export function LocationCard() {
  const localize = useLocalize()
  const scene = useWorld((s) => s.scene)
  const ready = useUI((s) => s.sceneReady)
  const transition = useUI((s) => s.transition)
  const [shown, setShown] = useState<{ scene: typeof scene; key: number } | null>(null)
  const playing = useMinigame((s) => s.active !== null)
  const talking = useDialogue((s) => s.npcId !== null)

  useEffect(() => {
    if (!ready || transition) return
    setShown({ scene, key: Date.now() })
    const id = window.setTimeout(() => setShown(null), 3200)
    return () => window.clearTimeout(id)
  }, [scene, ready, transition])

  if (!shown || playing || talking) return null
  const plaque = SCENES[shown.scene].plaque
  const style =
    plaque.style === 'hanoi'
      ? 'plaque-hanoi'
      : plaque.style === 'german'
        ? 'plaque-german'
        : 'plaque-room'
  return (
    <div key={shown.key} className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-6" style={{ top: 'calc(max(0.625rem, env(safe-area-inset-top)) + 12.5rem)' }}>
      <div className={`animate-plaque ${style} flex flex-col items-center px-5 py-1.5 text-center`}>
        <span className="font-display text-xl leading-tight font-extrabold tracking-wide">{localize(plaque.title)}</span>
        {plaque.subtitle && <span className="text-[11px] font-bold opacity-90">{localize(plaque.subtitle)}</span>}
      </div>
    </div>
  )
}
