import { CONFIG } from '../../data/config'
import { translate, type I18nKey } from '../../i18n'
import type { Localized } from '../../i18n/localized'
import type { Language } from '../../store/settingsStore'
import { useTime } from '../../store/timeStore'
import { pushToast } from '../../store/toastStore'
import { useUI } from '../../store/uiStore'
import { weekdayIndex } from './time'

/**
 * The calendar (dates for the HUD and the new-day card) and waiting / fast-forwarding.
 * Day 1 = CONFIG.time.startDate, a Monday.
 */

const DAY_MS = 24 * 60 * 60 * 1000
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function dateOf(day: number) {
  const { year, month, day: d } = CONFIG.time.startDate
  const date = new Date(Date.UTC(year, month - 1, d) + (day - 1) * DAY_MS)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "01/09" · "1 Sep" · "01.09." */
export function shortDate(day: number, language: Language) {
  const d = dateOf(day)
  if (language === 'en') return `${d.day} ${MONTHS_EN[d.month - 1]}`
  if (language === 'de') return `${pad(d.day)}.${pad(d.month)}.`
  return `${pad(d.day)}/${pad(d.month)}`
}

/** "Thứ Hai, 01/09/2025" · "Monday, 1 Sep 2025" · "Montag, 01.09.2025" */
export function longDate(day: number, language: Language) {
  const d = dateOf(day)
  const weekday = translate(language, `weekday.${weekdayIndex(day)}` as I18nKey)
  if (language === 'en') return `${weekday}, ${d.day} ${MONTHS_EN[d.month - 1]} ${d.year}`
  if (language === 'de') return `${weekday}, ${pad(d.day)}.${pad(d.month)}.${d.year}`
  return `${weekday}, ${pad(d.day)}/${pad(d.month)}/${d.year}`
}

/** How long you could still wait today before it's bedtime (game minutes). */
export function waitableMinutes() {
  const { minutes } = useTime.getState()
  const limit = CONFIG.time.waitUntilHourMax * 60
  // After midnight (before waking hours) it's already too late.
  if (minutes < CONFIG.time.wakeHour * 60) return 0
  return Math.max(0, limit - minutes)
}

/**
 * Let time pass quickly: the clock spins, the sky changes, needs drain as usual.
 * Capped at the bedtime limit. Returns false when it's too late to wait.
 */
export function waitFor(minutes: number, label: Localized | null = null, onDone?: () => void) {
  const ui = useUI.getState()
  if (ui.fastForward || ui.transition || ui.sleeping) return false
  const amount = Math.min(minutes, waitableMinutes())
  if (amount < 5) {
    pushToast('toast.tooLateToWait', 'info')
    return false
  }
  ui.closePanel()
  ui.setFastForward({ remaining: amount, total: amount, label, onDone })
  return true
}

/** Minutes until a given hour today (0 if it has passed). */
export function minutesUntil(hour: number) {
  return Math.max(0, hour * 60 - useTime.getState().minutes)
}
