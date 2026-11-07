import { useEffect } from 'react'
import { CARE_ACTIONS, type CareActionId } from '../data/care'
import { SKILLS } from '../data/skills'
import { formatDuration } from '../game/systems/time'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useCare } from '../store/careStore'
import { ActionIcon } from './ActionIcon'
import { CloseIcon } from './icons'

const LEGEND: CareActionId[] = ['feed', 'wipe', 'chat', 'comfort', 'wheel']

/** Care-shift HUD (M7): time left, satisfaction, what each icon means. */
export function CarePanel() {
  const t = useT()
  const working = useCare((s) => s.session?.phase === 'working')
  const timeLeft = useCare((s) => Math.ceil(s.session?.timeLeft ?? 0))
  const meter = useCare((s) => Math.round(s.session?.meter ?? 0))
  const quit = useCare((s) => s.quit)
  if (!working) return null
  return (
    <div className="absolute inset-x-0 z-10 flex justify-center px-3" style={{ top: 'calc(max(0.625rem, env(safe-area-inset-top)) + 6.4rem)' }}>
      <section className="panel pointer-events-auto w-full max-w-sm p-3 text-ink">
        <div className="flex items-center gap-2">
          <span className="rounded-full ribbon px-3 py-0.5 text-sm">{t('care.title')}</span>
          <span className={`ml-auto rounded-full px-2.5 py-0.5 text-sm font-black tabular-nums ${timeLeft <= 15 ? 'animate-pulse bg-lacquer text-gold-light' : 'bg-ink/10'}`}>
            ⏱ {timeLeft}s
          </span>
          <button type="button" onClick={quit} className="flex items-center gap-1 rounded-full bg-ink/10 py-0.5 pr-2.5 pl-1.5 text-sm font-extrabold">
            <CloseIcon className="text-base" />
            {t('work.quit')}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-extrabold whitespace-nowrap">{t('work.satisfaction')}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div className={`h-full rounded-full transition-all duration-300 ${meter >= 66 ? 'bg-jade' : meter >= 33 ? 'bg-gold' : 'bg-lacquer'}`} style={{ width: `${meter}%` }} />
          </div>
          <span className="w-9 text-right text-xs font-black tabular-nums">{meter}%</span>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {LEGEND.map((id) => (
            <span key={id} className="flex items-center gap-1 rounded-full bg-white/80 py-0.5 pr-2 pl-1 text-[11px] font-extrabold">
              <span className="text-base">
                <ActionIcon name={CARE_ACTIONS[id].icon} />
              </span>
              {t(CARE_ACTIONS[id].labelKey)}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

/** End-of-workday summary; pay is added when collected. */
export function CareResults() {
  const t = useT()
  const session = useCare((s) => (s.session?.phase === 'finished' ? s.session : null))
  const reward = useCare((s) => s.reward)
  const claim = useCare((s) => s.claim)

  useEffect(() => {
    if (!reward) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault()
        claim()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reward, claim])

  if (!session || !reward) return null
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="panel animate-pop relative w-full max-w-xs p-5 pt-7 text-ink">
        <h2 className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full ribbon px-6 py-1 text-2xl whitespace-nowrap">{t('results.feierabend')}</h2>
        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-mint/60 p-2">
            <div className="text-xl font-black tabular-nums">{session.helped}</div>
            <div className="text-xs font-bold">{t('care.helpedCount')}</div>
          </div>
          <div className="rounded-2xl bg-rose/40 p-2">
            <div className="text-xl font-black tabular-nums">{session.missed + session.wrong}</div>
            <div className="text-xs font-bold">{t('results.missed')}</div>
          </div>
          <div className="rounded-2xl bg-butter/70 p-2">
            <div className="text-xl font-black tabular-nums">{Math.round(session.meter)}%</div>
            <div className="text-xs leading-tight font-bold">{t('work.satisfaction')}</div>
          </div>
        </div>
        <div className="flex items-center justify-between py-1 text-lg font-black">
          <span>{t('results.wage')}</span>
          <span className="tabular-nums">{formatMoney(reward.pay, 'EUR')}</span>
        </div>
        <p className="mt-1 text-center text-xs font-bold text-ink/60">
          {t('results.xp', { xp: reward.xp, skill: t(SKILLS.pflege.nameKey) })} · {t('results.energy', { energy: reward.energy })} ·{' '}
          {t('results.time', { time: formatDuration(reward.minutes) })}
        </p>
        <button type="button" autoFocus onClick={claim} className="mt-4 w-full rounded-2xl btn-lacquer py-3 font-display text-xl font-extrabold active:translate-y-1 active:shadow-none">
          {t('results.claim')}
        </button>
      </div>
    </div>
  )
}
