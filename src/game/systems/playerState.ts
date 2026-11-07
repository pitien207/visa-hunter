import { Vector3 } from 'three'
import { useUI } from '../../store/uiStore'

/**
 * Mutable player state shared outside React's render cycle.
 * The Player component writes `position` every frame and consumes the requests below.
 */

export interface PointXZ {
  x: number
  z: number
}

/** Sitting / holding something (e.g. sipping trà đá). */
export interface PlayerPose {
  sitY: number
  held: 'glass' | null
  sipping: boolean
}

export const playerState = {
  /** Physics position of the player's feet (world space). */
  position: new Vector3(),
  /** When locked, input is ignored; the player only follows `path`. */
  locked: false,
  path: [] as PointXZ[],
  pathTime: 0,
  onArrive: null as null | (() => void),
  /** Yaw the player turns to when standing still (null = keep facing). */
  faceYaw: null as number | null,
  pose: null as PlayerPose | null,
  /** Consumed by the Player on the next frame. */
  teleportTo: null as PointXZ | null,
}

/** Lock input and walk the player along waypoints; `onArrive` fires at the last one. */
export function walkTo(path: PointXZ[], onArrive: () => void) {
  playerState.locked = true
  playerState.path = path.map((p) => ({ ...p }))
  playerState.pathTime = 0
  playerState.onArrive = onArrive
  playerState.faceYaw = null
  playerState.pose = null
  useUI.getState().setMovementLocked(true)
}

/** Give control back to the player. */
export function releasePlayer() {
  playerState.locked = false
  playerState.path = []
  playerState.onArrive = null
  playerState.faceYaw = null
  playerState.pose = null
  useUI.getState().setMovementLocked(false)
}

export function teleportPlayer(x: number, z: number) {
  playerState.teleportTo = { x, z }
}

export interface ZoneXZ {
  x: number
  z: number
  halfX: number
  halfZ: number
}

export function isInZone(p: PointXZ, zone: ZoneXZ) {
  return Math.abs(p.x - zone.x) <= zone.halfX && Math.abs(p.z - zone.z) <= zone.halfZ
}
