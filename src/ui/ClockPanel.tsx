import { CONFIG } from '../data/config'
import { isOpen, SCHEDULE } from '../data/schedule'
import { longDate, minutesUntil, waitableMinutes, waitFor } from '../game/systems/calendar'
import { formatClock, formatDuration, weekdayIndex } from '../game/systems/time'
import { isRainyDay } from '../game/systems/weather'
import { SCENES } from '../game/scenes/registry'
import { useT, type I18nKey } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { useSettings, type TimeSpeed } from '../store/settingsStore'
import { useTime } from '../store/timeStore'
import { useUI } from '../store/uiStore'
import { useWorld } from '../store/worldStore'
import { Sheet } from './Sheet'

const SPEEDS: TimeSpeed[] = ['slow', 'normal', 'fast']

/** Hand positions for a little analogue clock face. */
function ClockFace({ minutes }: { minutes: number }) {
  const h = ((minutes / 60) % 12) * 30
  const m = (minutes % 60) * 6
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#fffaf2" stroke="#c8322b" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="31" y="6" width="2" height={i % 3 === 0 ? 7 : 4} rx="1" fill="#5b4636" transform={`rotate(${i * 30} 32 32)`} />
      ))}
      <rect x="30.5" y="17" width="3" height="16" rx="1.5" fill="#5b4636" transform={`rotate(${h} 32 32)`} />
      <rect x="31.2" y="10" width="1.6" height="23" rx="0.8" fill="#3f7d5c" transform={`rotate(${m} 32 32)`} />
      <circle cx="32" cy="32" r="2.6" fill="#c8322b" />
    </svg>
  )
}

/**
 * Tap the HUD clock: today's date, the weather, opening hours of the places in this
 * country, time speed, and "wait" buttons (the clock spins forward).
 */
export function ClockPanel() {
  const t = useT()
  const localize = useLocalize()
  const panel = useUI((s) => s.panel)
  const closePanel = useUI((s) => s.closePanel)
  const minutes = useTime((s) => s.minutes)
  const day = useTime((s) => s.day)
  const scene = useWorld((s) => s.scene)
  const language = useSettings((s) => s.language)
  const timeSpeed = useSettings((s) => s.timeSpeed)
  const setTimeSpeed = useSettings((s) => s.setTimeSpeed)
  if (panel?.type !== 'clock') return null

  const country = SCENES[scene].country
  const hour = minutes / 60
  const weekday = weekdayIndex(day)
  const waitable = waitableMinutes()
  const rainToday = isRainyDay(day, country)
  const rainTomorrow = isRainyDay(day + 1, country)
  const weatherKey = (rain: boolean): I18nKey => (rain ? (country === 'vn' ? 'clock.drizzle' : 'clock.rain') : 'clock.dry')

  const waits: { key: string; label: string; minutes: number }[] = [
    { key: '30', label: t('clock.wait', { time: formatDuration(30) }), minutes: 30 },
    { key: '60', label: t('clock.wait', { time: formatDuration(60) }), minutes: 60 },
    { key: '180', label: t('clock.wait', { time: formatDuration(180) }), minutes: 180 },
  ]
  if (hour < 18) waits.push({ key: 'evening', label: t('clock.untilEvening'), minutes: minutesUntil(18) })

  return (
    <Sheet title={t('clock.title')} onClose={closePanel}>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-[inset_0_0_0_2px_#f1dcb6]">
        <ClockFace minutes={minutes} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-3xl leading-none font-extrabold tabular-nums">{formatClock(minutes)}</p>
          <p className="mt-1 text-sm font-extrabold">{longDate(day, language)}</p>
          <p className="text-xs font-bold text-ink/70">
            {t('clock.journeyDay', { day })} · {localize(SCENES[scene].name)}
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm font-extrabold">
        <div className="rounded-2xl bg-white/70 p-2 text-center shadow-[inset_0_0_0_2px_#f1dcb6]">
          <div className="text-xs text-ink/70">{t('clock.today')}</div>
          {rainToday ? '🌧' : '☀️'} {t(weatherKey(rainToday))}
        </div>
        <div className="rounded-2xl bg-white/70 p-2 text-center shadow-[inset_0_0_0_2px_#f1dcb6]">
          <div className="text-xs text-ink/70">{t('clock.tomorrow')}</div>
          {rainTomorrow ? '🌧' : '☀️'} {t(weatherKey(rainTomorrow))}
        </div>
      </div>

      <h3 className="mb-1.5 font-display text-base font-extrabold text-lacquer">{t('clock.waitTitle')}</h3>
      {waitable < 5 ? (
        <p className="mb-3 rounded-xl bg-ink/10 px-3 py-2 text-sm font-bold">{t('clock.tooLate')}</p>
      ) : (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {waits.map((w) => (
            <button
              key={w.key}
              type="button"
              disabled={w.minutes < 5}
              onClick={() => waitFor(w.minutes, null)}
              className="rounded-xl btn-jade px-2 py-2 text-sm font-black active:translate-y-0.5 disabled:opacity-40"
            >
              ⏩ {w.label}
            </button>
          ))}
        </div>
      )}

      <h3 className="mb-1.5 font-display text-base font-extrabold text-lacquer">{t('clock.speed')}</h3>
      <div className="mb-3 flex rounded-full bg-ink/10 p-1" role="group" aria-label={t('clock.speed')}>
        {SPEEDS.map((sp) => (
          <button
            key={sp}
            type="button"
            aria-pressed={timeSpeed === sp}
            onClick={() => setTimeSpeed(sp)}
            className={`flex-1 rounded-full px-2 py-1.5 text-[13px] font-extrabold ${timeSpeed === sp ? 'bg-jade text-white shadow' : 'text-ink/75'}`}
          >
            {t(`clock.speed.${sp}` as I18nKey)}
            <span className="ml-1 text-[11px] opacity-80">×{CONFIG.time.speeds[sp]}</span>
          </button>
        ))}
      </div>

      <h3 className="mb-1.5 font-display text-base font-extrabold text-lacquer">{t('clock.hours')}</h3>
      <ul className="flex flex-col gap-1">
        {SCHEDULE.filter((p) => p.country === country).map((p) => {
          const open = isOpen(p, weekday, hour)
          return (
            <li key={p.id} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5 text-sm font-bold">
              <span className="text-base">{p.icon}</span>
              <span className="min-w-0 flex-1 truncate">{localize(p.name)}</span>
              <span className="text-xs tabular-nums text-ink/70">
                {p.hours[0]}–{p.hours[1]}h{p.closedDays?.length ? ` · ${t(p.closedDays.length > 1 ? 'clock.weekdaysOnly' : 'clock.closedSunday')}` : ''}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${open ? 'bg-jade text-white' : 'bg-ink/15 text-ink/70'}`}>
                {open ? t('clock.open') : t('clock.closed')}
              </span>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
