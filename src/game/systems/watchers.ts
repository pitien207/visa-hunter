import { ACHIEVEMENTS } from '../../data/achievements'
import { EVENT_CHANCE, EVENTS } from '../../data/events'
import { QUESTS, type QuestDef } from '../../data/quests'
import { currentLanguage, localize } from '../../i18n/localized'
import { useFlags } from '../../store/flagsStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { pushToast } from '../../store/toastStore'
import { useWorld } from '../../store/worldStore'
import { playSfx } from './audio'
import { bumpFlag, check, flagNumber, getFlag, setFlag } from './conditions'
import { useUI } from '../../store/uiStore'
import { useSettings } from '../../store/settingsStore'
import { shortDate } from './calendar'
import { chargeRent } from './germany'

/**
 * Background game logic that reacts to state changes: quest progress, achievements,
 * daily events and rent. Started once from main.tsx.
 */

const stepFlag = (id: string) => `quest.${id}`

export function stepDone(id: string): boolean {
  return !!getFlag(stepFlag(id))
}

export function questComplete(q: QuestDef): boolean {
  return q.steps.every((s) => stepDone(s.id))
}

/** A later main quest is already complete: this one was skipped or done out of order. */
function superseded(q: QuestDef): boolean {
  if (q.side) return false
  return QUESTS.slice(QUESTS.indexOf(q) + 1).some((later) => !later.side && questComplete(later))
}

export function questVisible(q: QuestDef): boolean {
  if (!q.after) return true
  const prev = QUESTS.find((p) => p.id === q.after)
  return !prev || questComplete(prev) || superseded(prev) || superseded(q)
}

/** The next thing to do: first unfinished step of the first open main quest. */
export function currentObjective() {
  for (const q of QUESTS) {
    if (q.side || !questVisible(q) || questComplete(q) || superseded(q)) continue
    const s = q.steps.find((st) => !stepDone(st.id))
    if (s) return { quest: q, step: s }
  }
  return null
}

let busy = false

function evaluate() {
  if (busy) return
  busy = true
  try {
    // Quest steps are "sticky": once done, they stay done.
    // Steps of quests that aren't open yet are marked silently, so doing things
    // out of order still counts once the quest shows up.
    for (const q of QUESTS) {
      const visible = questVisible(q)
      const wasComplete = questComplete(q)
      for (const s of q.steps) {
        if (stepDone(s.id) || !check(s.done)) continue
        setFlag(stepFlag(s.id), true)
        bumpFlag('log.steps')
        if (visible) pushToast('toast.stepDone', 'good', { step: localize(s.text, currentLanguage()) })
      }
      if (visible && !wasComplete && questComplete(q)) {
        playSfx('success')
        pushToast('toast.questDone', 'good', { quest: localize(q.title, currentLanguage()) })
      }
    }
    for (const a of ACHIEVEMENTS) {
      const key = `achv.got.${a.id}`
      if (getFlag(key) || !check(a.when)) continue
      setFlag(key, true)
      playSfx('success')
      pushToast('toast.achievement', 'good', { icon: a.icon, name: localize(a.name, currentLanguage()) })
    }
  } finally {
    busy = false
  }
}

/** Remember where the day started, for tomorrow's summary card. */
function snapshotDay(day: number) {
  const p = usePlayer.getState()
  setFlag('log.day', day)
  setFlag('log.money', p.money)
  setFlag('log.cur', p.currency)
  setFlag('log.germanXp', 0)
  setFlag('log.steps', 0)
}

/** The day rolled over (midnight or sleep): prepare yesterday's summary. */
function closeDay(day: number) {
  const p = usePlayer.getState()
  const sameCurrency = getFlag('log.cur') === p.currency
  useUI.getState().setDaySummary({
    day,
    money: sameCurrency ? Math.round((p.money - flagNumber('log.money')) * 100) / 100 : 0,
    currency: p.currency,
    germanXp: flagNumber('log.germanXp'),
    steps: flagNumber('log.steps'),
    passedOut: false,
  })
  snapshotDay(day)
  // Still up at midnight: a quiet note instead of the full card.
  if (!useUI.getState().sleeping) pushToast('toast.midnight', 'info', { date: shortDate(day, useSettings.getState().language) })
}

/** A random morning event, at most once per day. */
function morningEvent(day: number) {
  if (getFlag('event.day') === day) return
  setFlag('event.day', day)
  if (Math.random() > EVENT_CHANCE) return
  const pool = EVENTS.filter((e) => check(e.when))
  const total = pool.reduce((s, e) => s + (e.weight ?? 1), 0)
  let roll = Math.random() * total
  const event = pool.find((e) => (roll -= e.weight ?? 1) <= 0)
  if (!event) return
  const p = usePlayer.getState()
  if (event.money) p.addMoney(event.money)
  if (event.energy) (event.energy > 0 ? p.restoreEnergy : p.spendEnergy)(Math.abs(event.energy))
  if (event.mood) p.changeMood(event.mood)
  window.setTimeout(() => pushToast('toast.event', event.mood && event.mood < 0 ? 'bad' : 'info', { text: localize(event.text, currentLanguage()) }), 2600)
}

export function startWatchers(): () => void {
  let timer: number | undefined
  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(evaluate, 120)
  }
  let lastDay = useTime.getState().day
  const unsubs = [
    useFlags.subscribe(schedule),
    usePlayer.subscribe(schedule),
    useWorld.subscribe(schedule),
    useTime.subscribe((s) => {
      if (s.day !== lastDay) {
        lastDay = s.day
        closeDay(s.day)
        chargeRent()
        morningEvent(s.day)
      }
      schedule()
    }),
  ]
  if (getFlag('log.day') === undefined) snapshotDay(useTime.getState().day)
  // Quietly mark anything already true at startup (no toasts for loaded progress).
  for (const q of QUESTS) for (const s of q.steps) if (!stepDone(s.id) && check(s.done)) setFlag(stepFlag(s.id), true)
  for (const a of ACHIEVEMENTS) if (!getFlag(`achv.got.${a.id}`) && check(a.when)) setFlag(`achv.got.${a.id}`, true)
  return () => {
    window.clearTimeout(timer)
    unsubs.forEach((u) => u())
  }
}
