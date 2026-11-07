const TAU = Math.PI * 2

/** Frame-rate independent smoothing factor for exponential damping. */
export function dampFactor(sharpness: number, dt: number) {
  return 1 - Math.exp(-sharpness * dt)
}

export function damp(current: number, target: number, sharpness: number, dt: number) {
  return current + (target - current) * dampFactor(sharpness, dt)
}

/** Damp an angle along the shortest arc. */
export function dampAngle(current: number, target: number, sharpness: number, dt: number) {
  let delta = (target - current) % TAU
  if (delta > Math.PI) delta -= TAU
  if (delta < -Math.PI) delta += TAU
  return current + delta * dampFactor(sharpness, dt)
}
