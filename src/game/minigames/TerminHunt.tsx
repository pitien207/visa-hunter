import { useEffect, useRef, useState } from 'react'
import { useT, type I18nKey } from '../../i18n'
import { useTime } from '../../store/timeStore'
import { playSfx } from '../systems/audio'
import { weekdayIndex } from '../systems/time'
import { MinigameFrame, useCountdown } from './common'

const DAYS = 14
const GAME_SECONDS = 25
/** How long a freed slot stays bookable. */
const SLOT_MS = 950
const REFRESH_COOLDOWN_MS = 700

/**
 * Termin hunting (plan §6): the booking calendar is always full. Hit "Aktualisieren",
 * and now and then a slot frees up for a split second — tap it before someone else does.
 */
export function TerminHunt({ title, onComplete }: { title: string; onComplete: (correct: number, total: number, dayOffset?: number) => void }) {
  const t = useT()
  const today = useTime((s) => s.day)
  const [open, setOpen] = useState<number | null>(null)
  const [refreshes, setRefreshes] = useState(0)
  const [cooling, setCooling] = useState(false)
  const [message, setMessage] = useState<I18nKey>('mg.terminNone')
  const [booked, setBooked] = useState<number | null>(null)
  const done = useRef(false)
  const hideTimer = useRef<number | undefined>(undefined)

  const finish = (dayOffset: number | null) => {
    if (done.current) return
    done.current = true
    window.setTimeout(() => onComplete(dayOffset !== null ? 1 : 0, 1, dayOffset ?? undefined), dayOffset !== null ? 1400 : 600)
  }

  const timer = useCountdown(GAME_SECONDS, 'termin', booked === null, () => finish(null))

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const refresh = () => {
    if (cooling || booked !== null) return
    setCooling(true)
    window.setTimeout(() => setCooling(false), REFRESH_COOLDOWN_MS)
    const n = refreshes + 1
    setRefreshes(n)
    // Each refresh is a little more likely to show a free slot.
    if (Math.random() < Math.min(0.75, 0.25 + n * 0.08)) {
      const slot = 2 + Math.floor(Math.random() * (DAYS - 3))
      window.setTimeout(() => {
        setOpen(slot)
        setMessage('mg.terminHint')
        window.clearTimeout(hideTimer.current)
        hideTimer.current = window.setTimeout(() => {
          setOpen((cur) => (cur === slot ? null : cur))
          setMessage('mg.terminGone')
        }, SLOT_MS)
      }, 150 + Math.random() * 300)
    } else {
      setMessage('mg.terminNone')
    }
  }

  const tapDay = (offset: number) => {
    if (booked !== null) return
    if (offset === open) {
      window.clearTimeout(hideTimer.current)
      setBooked(offset)
      setOpen(null)
      playSfx('success')
      finish(offset)
    } else {
      playSfx('wrong')
    }
  }

  return (
    <MinigameFrame title={title} timer={timer}>
      <div className="mb-2 rounded-xl bg-[#e9eef5] px-3 py-1.5 text-center text-[13px] font-bold text-[#3b4a66]">
        {booked !== null
          ? t('mg.terminGot', { date: `${t(`weekday.${weekdayIndex(today + booked)}` as I18nKey)}, ${t('hud.day', { day: today + booked })}` })
          : t(message)}
      </div>
      <div className="mb-3 grid grid-cols-7 gap-1">
        {Array.from({ length: DAYS }, (_, i) => {
          const offset = i + 1
          const isOpen = offset === open
          const isBooked = offset === booked
          return (
            <button
              key={i}
              type="button"
              onClick={() => tapDay(offset)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-[11px] font-black transition ${
                isBooked
                  ? 'bg-jade text-white'
                  : isOpen
                    ? 'animate-pulse bg-[#6fcf97] text-white shadow-[0_0_0_3px_#ffe6a6]'
                    : 'bg-ink/10 text-ink/40 line-through'
              }`}
            >
              <span>{t(`weekday.${weekdayIndex(today + offset)}` as I18nKey).replace(/^(Thứ |Chủ )/, '').slice(0, 3)}</span>
              <span className="text-sm">{today + offset}</span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={refresh}
        disabled={cooling || booked !== null}
        className="w-full rounded-2xl btn-jade py-3 font-display text-lg font-extrabold disabled:opacity-50"
      >
        ⟳ {t('mg.terminRefresh')}
      </button>
    </MinigameFrame>
  )
}
