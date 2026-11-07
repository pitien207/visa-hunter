import { findRequest, filledSlots } from '../game/systems/work'
import { useT } from '../i18n'
import { useWork } from '../store/workStore'
import { ActionIcon } from './ActionIcon'
import { CloseIcon } from './icons'

function meterColor(value: number) {
  if (value >= 66) return 'bg-[#6fcf97]'
  if (value >= 33) return 'bg-butter'
  return 'bg-rose'
}

/** Shift HUD: time left, satisfaction meter and the current customer's order. */
export function WorkPanel() {
  const t = useT()
  const task = useWork((s) => s.task)
  const working = useWork((s) => s.session?.phase === 'working')
  const timeLeft = useWork((s) => Math.ceil(s.session?.timeLeft ?? 0))
  const meter = useWork((s) => Math.round(s.session?.meter ?? 0))
  const requestId = useWork((s) => s.session?.order?.requestId ?? null)
  const added = useWork((s) => s.session?.order?.added)
  const status = useWork((s) => s.session?.order?.status ?? null)
  // Quantised so the panel re-renders a few times per second, not every frame.
  const patience = useWork((s) => {
    const o = s.session?.order
    return o ? Math.round((o.patienceLeft / o.patienceMax) * 50) * 2 : 0
  })
  const quit = useWork((s) => s.quit)

  if (!task || !working) return null
  const request = requestId ? findRequest(task, requestId) : undefined
  const slots = request && added ? filledSlots(request.needs, added) : []
  const waiting = status === 'waiting' && request

  return (
    <div
      className="absolute inset-x-0 z-10 flex justify-center px-3"
      style={{ top: 'calc(max(0.625rem, env(safe-area-inset-top)) + 6.4rem)' }}
    >
      <section
        aria-live="polite"
        className="panel pointer-events-auto w-full max-w-sm p-3 text-ink"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full ribbon px-3 py-0.5 text-sm">{t(task.nameKey)}</span>
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-sm font-black tabular-nums ${
              timeLeft <= 10 ? 'animate-pulse bg-lacquer text-gold-light' : 'bg-ink/10'
            }`}
          >
            ⏱ {timeLeft}s
          </span>
          <button
            type="button"
            onClick={quit}
            className="flex items-center gap-1 rounded-full bg-ink/10 py-0.5 pr-2.5 pl-1.5 text-sm font-extrabold"
          >
            <CloseIcon className="text-base" />
            {t('work.quit')}
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-extrabold whitespace-nowrap">{t('work.satisfaction')}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div className={`h-full rounded-full transition-all duration-300 ${meterColor(meter)}`} style={{ width: `${meter}%` }} />
          </div>
          <span className="w-9 text-right text-xs font-black tabular-nums">{meter}%</span>
        </div>

        <div className="mt-2 min-h-18 rounded-2xl bg-white/85 p-2 shadow-[inset_0_0_0_2px_#f1dcb6]">
          {waiting ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-black">{t(request.labelKey)}</span>
                <div className="flex gap-1">
                  {request.needs.map((id, i) => {
                    const action = task.actions.find((a) => a.id === id)
                    return (
                      <span
                        key={i}
                        className={`relative grid h-8 w-8 place-items-center rounded-xl text-xl transition ${
                          slots[i] ? 'bg-mint' : 'bg-ink/10'
                        }`}
                      >
                        {action && <ActionIcon name={action.icon} className={slots[i] ? '' : 'opacity-60'} />}
                        {slots[i] && (
                          <span className="absolute -right-1 -bottom-1 grid h-4 w-4 place-items-center rounded-full bg-[#4fae7f] text-[10px] font-black text-white">
                            ✓
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
                    patience > 50 ? 'bg-mint' : patience > 25 ? 'bg-butter' : 'bg-rose'
                  }`}
                  style={{ width: `${patience}%` }}
                />
              </div>
            </>
          ) : (
            <p className="grid h-14 place-items-center text-sm font-bold text-ink/60">{t('work.waiting')}</p>
          )}
        </div>
      </section>
    </div>
  )
}
