import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { PerspectiveCamera, Vector3, type Object3D } from 'three'
import { CONFIG } from '../../data/config'
import { cameraState } from '../systems/cameraState'
import { occlusion } from '../scenes/shared/materials'
import { CAMERA_RAY_GROUPS } from '../systems/collisionGroups'
import { damp, dampAngle, dampFactor } from '../systems/math'

const _target = new Vector3()
const _look = new Vector3()
const _desired = new Vector3()
const _dir = new Vector3()

/** Gap kept between the camera and a wall it was pulled in front of. */
const WALL_PADDING = 0.35

/**
 * Third-person follow camera (plan §2): high angle, smooth follow, drag to rotate.
 * Must live inside <Physics> — it ray-casts against buildings so they never hide the player.
 */
export function CameraRig({ target }: { target: RefObject<Object3D | null> }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const { world, rapier } = useRapier()

  const ray = useRef<InstanceType<typeof rapier.Ray> | null>(null)
  const lookAt = useRef(new Vector3())
  const distance = useRef<number>(CONFIG.camera.distance)
  const zoom = useRef(1)
  const initialized = useRef(false)

  // Drag anywhere on the 3D view (mouse or a finger not on the joystick) to orbit.
  useEffect(() => {
    const el = gl.domElement
    let activePointer: number | null = null
    let lastX = 0

    const onDown = (e: PointerEvent) => {
      if (activePointer !== null) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      activePointer = e.pointerId
      lastX = e.clientX
      cameraState.targetYaw = null // the player takes over
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return
      cameraState.yaw -= (e.clientX - lastX) * CONFIG.camera.dragSensitivity
      lastX = e.clientX
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return
      activePointer = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  // Default priority (0): runs after the player (-100) and the physics step (-50).
  useFrame((state, rawDt) => {
    const t = target.current
    if (!t) return
    const dt = Math.min(rawDt, 0.1)
    const cfg = CONFIG.camera

    t.getWorldPosition(_target)
    _look.copy(_target)
    _look.y += cfg.lookHeight

    // Portrait phones see less horizontally: widen the FOV and back off a little.
    const aspect = state.size.width / Math.max(1, state.size.height)
    const portrait = aspect >= 1 ? 0 : Math.min(1, (1 - aspect) / 0.5)
    zoom.current = damp(zoom.current, cameraState.zoom * cameraState.baseZoom, 3, dt)
    let wanted = cfg.distance * (1 + (cfg.portraitDistanceScale - 1) * portrait) * zoom.current
    const fov = cfg.fov + (cfg.portraitFov - cfg.fov) * portrait
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    const pitch = (cfg.pitchDeg * Math.PI) / 180
    if (cameraState.targetYaw !== null) {
      cameraState.yaw = dampAngle(cameraState.yaw, cameraState.targetYaw, 4, dt)
      if (Math.abs(Math.sin((cameraState.yaw - cameraState.targetYaw) / 2)) < 0.005) cameraState.targetYaw = null
    }
    const yaw = cameraState.yaw
    _dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))

    // Pull the camera in if a building is between it and the player.
    ray.current ??= new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })
    ray.current.origin = { x: _look.x, y: _look.y, z: _look.z }
    ray.current.dir = { x: _dir.x, y: _dir.y, z: _dir.z }
    const hit = world.castRay(ray.current, wanted, true, undefined, CAMERA_RAY_GROUPS)
    if (hit) wanted = Math.min(wanted, Math.max(cfg.minDistance, hit.timeOfImpact - WALL_PADDING))

    // Snap in instantly when blocked, ease back out when clear.
    distance.current =
      wanted < distance.current ? wanted : distance.current + (wanted - distance.current) * dampFactor(3, dt)

    _desired.copy(_look).addScaledVector(_dir, distance.current)

    if (!initialized.current || cameraState.snap) {
      if (cameraState.snap) {
        zoom.current = cameraState.zoom * cameraState.baseZoom
        distance.current = wanted
        _desired.copy(_look).addScaledVector(_dir, distance.current)
        cameraState.snap = false
      }
      camera.position.copy(_desired)
      lookAt.current.copy(_look)
      initialized.current = true
    } else {
      const k = dampFactor(cfg.followSharpness, dt)
      camera.position.lerp(_desired, k)
      lookAt.current.lerp(_look, Math.min(1, k * 1.5))
    }
    camera.lookAt(lookAt.current)
    occlusion.target.value.copy(_look)
  })

  return null
}
