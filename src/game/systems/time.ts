import { CONFIG } from '../../data/config'
import { useDialogue } from '../../store/dialogueStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { useUI } from '../../store/uiStore'
import { useWork } from '../../store/workStore'
import { useMinigame } from '../../store/minigameStore'
import { useCare } from '../../store/careStore'

export const hourOf = (minutes: number) => minutes / 60

export function formatClock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.floor(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "3h", "45'", "1h 30'" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}'`
  return m === 0 ? `${h}h` : `${h}h ${m}'`
}

/** 0 = Monday … 6 = Sunday. Day 1 is a Monday. */
export const weekdayIndex = (day: number) => (((day - 1) % 7) + 7) % 7

/** The clock stops while menus, conversations, shifts or sleep are on screen. */
export function isTimePaused() {
  const ui = useUI.getState()
  return (
    !ui.sceneReady ||
    ui.settingsOpen ||
    ui.panel !== null ||
    ui.sleeping ||
    ui.transition !== null ||
    useDialogue.getState().npcId !== null ||
    useWork.getState().session !== null ||
    useCare.getState().session !== null ||
    useMinigame.getState().active !== null
  )
}

/** Passive needs while time passes: energy drains, mood drifts back toward its baseline. */
export function applyNeeds(minutes: number) {
  const hours = minutes / 60
  const { needs } = CONFIG
  const player = usePlayer.getState()
  player.spendEnergy(needs.energyDrainPerHour * hours)
  const toBaseline = needs.moodBaseline - player.mood
  const drift = Math.sign(toBaseline) * Math.min(Math.abs(toBaseline), needs.moodDriftPerHour * hours)
  if (drift !== 0) player.changeMood(drift)
}

/** Advance the clock for an action (eating, working…). Needs aren't applied: the action has its own costs. */
export function spendTime(minutes: number) {
  if (minutes > 0) useTime.getState().advance(minutes)
}

export function isLateNight(minutes: number) {
  return minutes >= CONFIG.time.passOutHour * 60 && minutes < CONFIG.time.wakeHour * 60
}

export function canSleep() {
  const { minutes } = useTime.getState()
  const hour = hourOf(minutes)
  const lowEnergy = usePlayer.getState().energy < CONFIG.time.sleepIfEnergyBelow
  return lowEnergy || hour >= CONFIG.time.sleepFromHour || hour < CONFIG.time.wakeHour
}
