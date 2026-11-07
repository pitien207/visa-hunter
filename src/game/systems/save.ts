import { CONFIG } from '../../data/config'
import { useFlags } from '../../store/flagsStore'
import { useInventory } from '../../store/inventoryStore'
import { initialStats, usePlayer, type PlayerStats } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { useWorld, type SceneId } from '../../store/worldStore'
import { SCENES } from '../scenes/registry'
import { cameraState } from './cameraState'
import { playerState } from './playerState'

/**
 * Save / load (plan §5.8): one versioned JSON blob in localStorage, written
 * automatically shortly after anything changes, plus export/import as a text code.
 */

const KEY = 'visa-hunter-save'
const VERSION = 1

export interface SaveData {
  version: number
  savedAt: number
  player: PlayerStats
  time: { day: number; minutes: number }
  inventory: Record<string, number>
  flags: Record<string, number | boolean | string>
  position: { x: number; z: number; yaw: number } | null
  /** Added in 0.4 — older saves start in Vietnam. */
  scene?: SceneId
}

function collect(): SaveData {
  const { money, currency, energy, maxEnergy, mood, skills, german, outfit, wardrobe } = usePlayer.getState()
  const { day, minutes } = useTime.getState()
  const p = playerState.position
  const hasPosition = Number.isFinite(p.x) && Number.isFinite(p.z) && (p.x !== 0 || p.z !== 0)
  return {
    version: VERSION,
    savedAt: Date.now(),
    player: { money, currency, energy, maxEnergy, mood, skills, german, outfit, wardrobe },
    time: { day, minutes },
    inventory: useInventory.getState().items,
    flags: useFlags.getState().flags,
    position: hasPosition ? { x: p.x, z: p.z, yaw: cameraState.yaw } : null,
    scene: useWorld.getState().scene,
  }
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function isSaveData(v: unknown): v is SaveData {
  if (!isObj(v) || v.version !== VERSION) return false
  const { player, time, inventory, flags } = v
  return (
    isObj(player) &&
    isNum(player.money) &&
    isNum(player.energy) &&
    isNum(player.maxEnergy) &&
    isNum(player.mood) &&
    isObj(player.skills) &&
    isObj(time) &&
    isNum(time.day) &&
    isNum(time.minutes) &&
    isObj(inventory) &&
    isObj(flags)
  )
}

function apply(data: SaveData) {
  usePlayer.getState().hydrate({ ...initialStats(), ...data.player })
  useTime.getState().setTime(Math.max(1, Math.floor(data.time.day)), Math.max(0, data.time.minutes % 1440))
  useInventory.getState().hydrate(data.inventory)
  useFlags.getState().hydrate(data.flags)
  const scene = data.scene && data.scene in SCENES ? data.scene : 'vietnam'
  useWorld.getState().setScene(scene)
  cameraState.baseZoom = SCENES[scene].cameraZoom ?? 1
  if (data.position) {
    playerState.teleportTo = { x: data.position.x, z: data.position.z }
    cameraState.yaw = data.position.yaw
  }
}

/** Load the saved game into the stores. Returns true if a save was found. */
export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return false
    const data: unknown = JSON.parse(raw)
    if (!isSaveData(data)) return false
    apply(data)
    return true
  } catch {
    return false
  }
}

let suspended = false

/** Stop all saving (before reloading into an imported save or a fresh start). */
export function suspendSaving() {
  suspended = true
}

export function saveGame() {
  if (suspended) return
  try {
    localStorage.setItem(KEY, JSON.stringify(collect()))
  } catch {
    // Storage full or blocked (private mode): the game keeps running without saving.
  }
}

/** Save shortly after any change, every few seconds for the position, and when the page is hidden. */
export function startAutosave(): () => void {
  let timer: number | undefined
  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(saveGame, CONFIG.save.debounceMs)
  }
  const unsubscribers = [
    useWorld.subscribe(schedule),
    usePlayer.subscribe(schedule),
    useTime.subscribe(schedule),
    useInventory.subscribe(schedule),
    useFlags.subscribe(schedule),
  ]
  const interval = window.setInterval(saveGame, CONFIG.save.positionIntervalMs)
  const onHide = () => {
    if (document.visibilityState === 'hidden') saveGame()
  }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', saveGame)
  return () => {
    window.clearTimeout(timer)
    window.clearInterval(interval)
    unsubscribers.forEach((u) => u())
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', saveGame)
  }
}

// UTF-8 safe base64 so the save code can be copied anywhere.
function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function fromBase64(code: string) {
  const binary = atob(code.trim())
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function exportSave(): string {
  return toBase64(JSON.stringify(collect()))
}

/** Validate and store a save code. The caller reloads the page to apply it. */
export function importSave(code: string): boolean {
  try {
    const data: unknown = JSON.parse(fromBase64(code))
    if (!isSaveData(data)) return false
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function resetSave() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
