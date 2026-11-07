import { interactionGroups } from '@react-three/rapier'

/**
 * Rapier collision groups (0–15).
 * Everything still collides with everything; groups only tag colliders
 * so queries (like the camera ray) can pick what they care about.
 */
export const GROUP = {
  world: 0,
  /** Large solid things the camera must not clip through (buildings). */
  cameraBlocker: 1,
  player: 2,
  query: 15,
} as const

export const BUILDING_GROUPS = interactionGroups([GROUP.world, GROUP.cameraBlocker])
/** Props and invisible bounds: block walking but never pull the camera in. */
export const PROP_GROUPS = interactionGroups([GROUP.world])
export const PLAYER_GROUPS = interactionGroups([GROUP.player])
/** For ray casts that should only hit camera blockers. */
export const CAMERA_RAY_GROUPS = interactionGroups([GROUP.query], [GROUP.cameraBlocker])
