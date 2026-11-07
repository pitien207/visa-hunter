import { CONFIG } from '../data/config'
import { VISA_PATH_NAMES } from '../data/visa'
import { runAction } from '../game/systems/actions'
import { getFlag } from '../game/systems/conditions'
import { docProgress, docsComplete, docsFor, doDocStep, stepCost, terminDay, visaPath, visaReady } from '../game/systems/visa'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { useFlags } from '../store/flagsStore'
import { usePlayer } from '../store/playerStore'
import { useTime } from '../store/timeStore'
import { useUI } from '../store/uiStore'
import { Sheet } from './Sheet'

/** The visa file (M5): document checklist, finances, Termin, interview, flight. */
export function VisaPanel() {
  const t = useT()
  const localize = useLocalize()
  const panel = useUI((s) => s.panel)
  const closePanel = useUI((s) => s.closePanel)
  useFlags((s) => s.flags)
  const day = useTime((s) => s.day)
  const money = usePlayer((s) => s.money)
  if (panel?.type !== 'visa') return null

  const path = visaPath()
  const docs = docsFor(path)
  const done = docs.filter((d) => docProgress(d) >= d.steps.length).length
  const termin = terminDay()
  const ready = visaReady()
  const readyDay = getFlag('visa.readyDay')

  return (
    <Sheet title={t('visa.title')} onClose={closePanel}>
      {path && (
        <p className="mb-2 text-center text-sm font-extrabold">
          {localize(VISA_PATH_NAMES[path])} · {t('visa.docsCount', { done, total: docs.length })}
        </p>
      )}
      <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-jade transition-all" style={{ width: `${(done / Math.max(1, docs.length)) * 100}%` }} />
      </div>

      <ul className="flex flex-col gap-1.5">
        {docs.map((doc) => {
          const progress = docProgress(doc)
          const complete = progress >= doc.steps.length
          const step = doc.steps[progress]
          const cost = step ? stepCost(step) : 0
          const readyAt = getFlag(`doc.${doc.id}.ready`)
          return (
            <li key={doc.id} className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 shadow-[inset_0_0_0_2px_#f1dcb6]">
              <span className="text-lg">{complete ? '✅' : progress > 0 ? '📝' : '📄'}</span>
              <span className="flex-1">
                <span className="block text-[13px] leading-tight font-extrabold">{localize(doc.name)}</span>
                {!complete && step && (
                  <span className="text-[11px] font-bold text-ink/60">
                    {step.auto
                      ? typeof readyAt === 'number'
                        ? t('visa.waitUntil', { day: readyAt })
                        : localize(step.label)
                      : `${progress + 1}/${doc.steps.length}`}
                  </span>
                )}
              </span>
              {!complete && step && !step.auto && (
                <button
                  type="button"
                  onClick={() => doDocStep(doc.id)}
                  className={`shrink-0 rounded-xl px-2.5 py-1.5 text-[12px] font-black active:translate-y-0.5 ${cost > money ? 'bg-ink/15 text-ink/50' : 'btn-jade'}`}
                >
                  {localize(step.label)}
                  {cost > 0 && <span className="ml-1 opacity-90">· {formatMoney(cost)}</span>}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-3 rounded-2xl bg-white/80 p-3 text-center shadow-[inset_0_0_0_2px_#f1dcb6]">
        {ready ? (
          <>
            <p className="font-display text-lg font-extrabold text-jade">🛂 {t('visa.ready')}</p>
            {!getFlag('visa.flight') ? (
              <button type="button" onClick={() => runAction('visa.buyFlight')} className="mt-2 w-full rounded-2xl btn-lacquer py-2.5 font-extrabold">
                ✈ {t('visa.buyFlight')} · {formatMoney(CONFIG.visa.flightCost)}
              </button>
            ) : (
              <p className="mt-1 text-sm font-bold">{t('visa.goAirport')}</p>
            )}
          </>
        ) : typeof readyDay === 'number' ? (
          <p className="text-sm font-extrabold">{t('visa.processing', { day: readyDay })}</p>
        ) : termin && termin >= day ? (
          <p className="text-sm font-extrabold">📅 {t('visa.terminOn', { day: termin })}</p>
        ) : (
          <>
            <p className="mb-2 text-[13px] font-bold text-ink/70">{docsComplete() ? t('visa.readyForTermin') : t('visa.terminHint')}</p>
            <button type="button" onClick={() => runAction('visa.termin')} className="w-full rounded-2xl btn-lacquer py-2.5 font-extrabold">
              📅 {t('visa.huntTermin')}
            </button>
          </>
        )}
      </div>
    </Sheet>
  )
}
