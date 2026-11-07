import type { Localized } from '../../i18n/localized'
import { useUI } from '../../store/uiStore'
import { useWorld, type SceneId } from '../../store/worldStore'
import { SCENES } from '../scenes/registry'
import { cameraState, resetCameraFocus } from './cameraState'
import { playerState, releasePlayer, teleportPlayer } from './playerState'
import { spendTime } from './time'

const FADE_MS = 450

/** Put the player at a spawn point of the current scene, camera snapped behind them. */
export function placeAtSpawn(scene: SceneId, spawnKey = 'default') {
  const info = SCENES[scene]
  const spawn = info.spawns[spawnKey] ?? info.spawns.default
  teleportPlayer(spawn.x, spawn.z)
  cameraState.yaw = spawn.yaw
  cameraState.baseZoom = info.cameraZoom ?? 1
  cameraState.snap = true
}

export interface TravelOptions {
  /** In-game minutes the trip takes. */
  minutes?: number
  /** Caption on the fade screen (defaults to the destination's name). */
  label?: Localized | null
  /** Hold the caption longer (flights). */
  long?: boolean
  /** Runs while the screen is black, after the scene switched. */
  onArrive?: () => void
  /** Runs once the screen has faded back in and the player is free again. */
  onDone?: () => void
  icon?: string
  subtitle?: Localized | null
  tone?: 'night' | 'chalk' | 'paper'
}

/** Fade out, switch scene, place the player, fade in. */
export function travelTo(scene: SceneId, spawnKey = 'default', opts: TravelOptions = {}) {
  const ui = useUI.getState()
  if (ui.transition) return
  ui.setTransition({
    label: opts.label === undefined ? SCENES[scene].name : opts.label,
    long: !!opts.long,
    icon: opts.icon,
    subtitle: opts.subtitle,
    tone: opts.tone,
  })
  playerState.locked = true
  playerState.path = []
  ui.setMovementLocked(true)
  resetCameraFocus()

  window.setTimeout(() => {
    useWorld.getState().setScene(scene)
    placeAtSpawn(scene, spawnKey)
    if (opts.minutes) spendTime(opts.minutes)
    opts.onArrive?.()
    window.setTimeout(
      () => {
        useUI.getState().setTransition(null)
        releasePlayer()
        opts.onDone?.()
      },
      opts.long ? 2600 : 700,
    )
  }, FADE_MS)
}
