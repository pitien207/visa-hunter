import { CONFIG } from '../../data/config'

/**
 * Camera state shared between the CameraRig (reads/writes) and gameplay code.
 * yaw = 0 → camera sits on +Z looking toward -Z.
 */
export const cameraState = {
  yaw: CONFIG.camera.initialYaw,
  /** If set, the rig eases `yaw` toward this, then clears it. Dragging cancels it. */
  targetYaw: null as number | null,
  /** Distance multiplier for interactions (1 = normal, < 1 = zoomed in), eased by the rig. */
  zoom: 1,
  /** Per-scene distance multiplier (rooms are viewed closer). */
  baseZoom: 1,
  /** Jump to the target next frame instead of easing (after a scene change). */
  snap: false,
}

/** Turn and zoom the camera for an interaction; call `resetCameraFocus()` afterwards. */
export function focusCamera(yaw: number, zoom: number) {
  cameraState.targetYaw = yaw
  cameraState.zoom = zoom
}

export function resetCameraFocus() {
  cameraState.targetYaw = null
  cameraState.zoom = 1
}
