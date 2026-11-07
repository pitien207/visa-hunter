import { useEffect } from 'react'
import { SKILLS } from '../data/skills'
import { formatDuration } from '../game/systems/time'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useWork } from '../store/workStore'
import { CoinIcon } from './icons'

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${strong ? 'text-lg font-black' : 'font-bold'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

/** End-of-shift summary. Pay is only added when the player collects it. */
export function WorkResults() {
  const t = useT()
  const task = useWork((s) => s.task)
  const session = useWork((s) => (s.session?.phase === 'finished' ? s.session : null))
  const reward = useWork((s) => s.reward)
  const claim = useWork((s) => s.claim)

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

  if (!task || !session || !reward) return null
  const skillName = t(SKILLS[task.skill].nameKey)

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="results-title"
        className="panel animate-pop relative w-full max-w-xs p-5 pt-7 text-ink"
      >
        <h2 id="results-title" className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full ribbon px-6 py-1 text-2xl whitespace-nowrap">
          {t('results.title')}
        </h2>
        <p className="mb-3 text-center text-sm font-bold text-ink/60">{t(task.nameKey)}</p>

        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-mint/60 p-2">
            <div className="text-xl font-black tabular-nums">{session.served}</div>
            <div className="text-xs font-bold">{t('results.served')}</div>
          </div>
          <div className="rounded-2xl bg-rose/40 p-2">
            <div className="text-xl font-black tabular-nums">{session.failed}</div>
            <div className="text-xs font-bold">{t('results.missed')}</div>
          </div>
          <div className="rounded-2xl bg-butter/70 p-2">
            <div className="text-xl font-black tabular-nums">{Math.round(session.meter)}%</div>
            <div className="text-xs leading-tight font-bold">{t('work.satisfaction')}</div>
          </div>
        </div>

        <Row label={t('results.wage')} value={formatMoney(reward.wage)} />
        <Row label={t('results.tips')} value={formatMoney(reward.tips)} />
        <div className="my-1 border-t-2 border-dashed border-ink/15" />
        <Row label={t('results.total')} value={formatMoney(reward.total)} strong />
        <p className="mt-1 text-center text-xs font-bold text-ink/60">
          {t('results.xp', { xp: reward.xp, skill: skillName })} · {t('results.energy', { energy: reward.energy })} ·{' '}
          {t('results.time', { time: formatDuration(reward.minutes) })}
        </p>

        <button
          type="button"
          autoFocus
          onClick={claim}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl btn-lacquer py-3 font-display text-xl font-extrabold active:translate-y-1 active:shadow-none"
        >
          <CoinIcon className="text-2xl" />
          {t('results.claim')}
        </button>
      </div>
    </div>
  )
}
