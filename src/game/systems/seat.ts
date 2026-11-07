import type { Seat } from '../scenes/interiors'
import { useUI } from '../../store/uiStore'
import { focusCamera, resetCameraFocus } from './cameraState'
import { playerState, releasePlayer, teleportPlayer } from './playerState'

/**
 * Sit the player down at a fixed seat (school desk, exam desk, study desk) for a
 * mini-game. The camera turns to look over the player's shoulder.
 */
export function sitAt(seat: Seat, cameraYaw = 0, zoom = 0.72) {
  teleportPlayer(seat.x, seat.z)
  playerState.locked = true
  playerState.path = []
  playerState.faceYaw = seat.yaw
  playerState.pose = { sitY: seat.sitY, held: null, sipping: false }
  useUI.getState().setMovementLocked(true)
  focusCamera(cameraYaw, zoom)
}

export function standUp() {
  releasePlayer()
  resetCameraFocus()
}
