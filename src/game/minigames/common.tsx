import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useT } from '../../i18n'
import type { MinigameResult } from '../../store/minigameStore'

export function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Up to `count` distinct items (by key). */
export function sample<T>(list: T[], count: number, key: (t: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of shuffle(list)) {
    const k = key(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
    if (out.length >= count) break
  }
  return out
}

/** Remaining fraction (1 → 0) of a countdown that restarts whenever `key` changes. */
export function useCountdown(seconds: number, key: unknown, running: boolean, onTimeout: () => void) {
  const [left, setLeft] = useState(1)
  const timeout = useRef(onTimeout)
  timeout.current = onTimeout
  useEffect(() => {
    setLeft(1)
    if (!running) return
    const start = performance.now()
    const id = window.setInterval(() => {
      const f = 1 - (performance.now() - start) / (seconds * 1000)
      if (f <= 0) {
        window.clearInterval(id)
        setLeft(0)
        timeout.current()
      } else {
        setLeft(f)
      }
    }, 80)
    return () => window.clearInterval(id)
  }, [seconds, key, running])
  return left
}

export const ARTICLE_STYLE: Record<string, string> = {
  der: 'bg-[#4f86d9] text-white shadow-[0_4px_0_#2f5fa8]',
  die: 'bg-lacquer text-gold-light shadow-[0_4px_0_var(--color-lacquer-dark)]',
  das: 'bg-jade text-white shadow-[0_4px_0_var(--color-jade-dark)]',
}

/**
 * Where the mini-game happens changes its look: a chalkboard in Thầy Minh's class,
 * an exam sheet in the exam room, a squared school notebook (vở ô li) at home.
 */
export type MinigameTheme = 'paper' | 'chalk' | 'exam' | 'notebook'
export const MinigameThemeContext = createContext<MinigameTheme>('paper')

const FRAME: Record<MinigameTheme, { backdrop: string; section: string }> = {
  paper: { backdrop: 'bg-ink/40 backdrop-blur-sm', section: 'panel text-ink' },
  chalk: { backdrop: 'bg-ink/25', section: 'chalkboard mg-chalk rounded-3xl text-[#f4f1e6]' },
  exam: { backdrop: 'bg-ink/30', section: 'exam-paper rounded-2xl text-ink' },
  notebook: { backdrop: 'bg-ink/30', section: 'notebook-paper rounded-2xl text-ink' },
}

export function MinigameFrame({
  title,
  step,
  total,
  timer,
  children,
}: {
  title: string
  step?: number
  total?: number
  /** 0–1 remaining, or undefined for no timer. */
  timer?: number
  children: ReactNode
}) {
  const theme = useContext(MinigameThemeContext)
  const t = useT()
  const look = FRAME[theme]
  return (
    <div className={`pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-3 ${look.backdrop}`}>
      <section className={`animate-sheet relative flex max-h-[94dvh] w-full max-w-md flex-col p-4 pt-7 ${look.section}`} role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="absolute -top-4 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full ribbon px-5 py-1 text-lg whitespace-nowrap">{title}</h2>
        {theme === 'exam' && (
          <p className="mb-2 flex justify-between border-b-2 border-dashed border-ink/25 pb-1 text-[11px] font-black text-ink/70 uppercase">
            <span>{t('mg.examSheet')}</span>
            <span className="tabular-nums">SBD 0427</span>
          </p>
        )}
        {step !== undefined && total !== undefined && (
          <div className="mb-2 flex justify-center gap-1">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`h-2 w-5 rounded-full ${i < step ? 'bg-jade' : i === step ? 'bg-gold' : theme === 'chalk' ? 'bg-white/25' : 'bg-ink/15'}`} />
            ))}
          </div>
        )}
        {timer !== undefined && (
          <div className={`mb-3 h-2 overflow-hidden rounded-full ${theme === 'chalk' ? 'bg-white/15' : 'bg-ink/10'}`}>
            <div
              className={`h-full rounded-full ${timer > 0.5 ? 'bg-jade' : timer > 0.25 ? 'bg-gold' : 'bg-lacquer'}`}
              style={{ width: `${Math.max(0, timer) * 100}%` }}
            />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }}>
          {children}
        </div>
      </section>
    </div>
  )
}

export function ResultView({
  title,
  result,
  extra,
  onContinue,
}: {
  title: string
  result: MinigameResult
  extra?: ReactNode
  onContinue: () => void
}) {
  const t = useT()
  return (
    <MinigameFrame title={title}>
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <div className="text-5xl">{result.perfect ? '🌟' : result.passed ? '🎉' : '💪'}</div>
        <p className="mg-heading font-display text-2xl font-extrabold text-lacquer">
          {result.perfect ? t('mg.perfect') : result.passed ? t('mg.passed') : t('mg.failed')}
        </p>
        <p className="font-bold">{t('mg.score', { correct: result.correct, total: result.total })}</p>
        {extra}
        <button
          type="button"
          autoFocus
          onClick={onContinue}
          className="mt-3 w-full rounded-2xl btn-lacquer py-3 font-display text-lg font-extrabold active:translate-y-1 active:shadow-none"
        >
          {t('mg.continue')}
        </button>
      </div>
    </MinigameFrame>
  )
}

/** Big answer button with right/wrong feedback states. */
export function AnswerButton({
  children,
  state,
  onClick,
  disabled,
}: {
  children: ReactNode
  state: 'idle' | 'right' | 'wrong' | 'dim'
  onClick: () => void
  disabled?: boolean
}) {
  const chalk = useContext(MinigameThemeContext) === 'chalk'
  const style =
    chalk && state === 'idle'
      ? 'bg-white/10 text-[#f4f1e6] shadow-[inset_0_0_0_2px_rgba(244,241,230,0.6)]'
      : chalk && state === 'dim'
        ? 'bg-white/5 text-[#f4f1e6]/40 shadow-[inset_0_0_0_2px_rgba(244,241,230,0.2)]'
        : state === 'right'
      ? 'bg-jade text-white shadow-[0_4px_0_var(--color-jade-dark)]'
      : state === 'wrong'
        ? 'bg-lacquer text-gold-light shadow-[0_4px_0_var(--color-lacquer-dark)]'
        : state === 'dim'
          ? 'bg-white/60 text-ink/50 shadow-[inset_0_0_0_2px_#f1dcb6]'
          : 'bg-white text-ink shadow-[inset_0_0_0_2px_#f1dcb6,0_3px_0_rgba(91,70,54,0.18)]'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left text-[15px] leading-snug font-extrabold transition active:translate-y-0.5 ${style}`}
    >
      {children}
    </button>
  )
}
