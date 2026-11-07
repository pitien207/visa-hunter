import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import type { Vec3 } from '../../data/config'
import { triggerPrimary, useInteraction, type InteractableDef } from '../../store/interactionStore'
import { glowMaterial } from '../scenes/shared/materials'
import { PALETTE } from '../scenes/shared/palette'
import { Shapes, type ShapeItem } from '../scenes/shared/Shapes'
import { isInZone, playerState } from '../systems/playerState'

/** Register an interactable while mounted (null = nothing). Pass a memoized `def`. */
export function useInteractable(def: InteractableDef | null) {
  const register = useInteraction((s) => s.register)
  const unregister = useInteraction((s) => s.unregister)
  const id = def?.id
  useEffect(() => {
    if (def) register(def)
  }, [def, register])
  useEffect(
    () => () => {
      if (id) unregister(id)
    },
    [id, unregister],
  )
}

/**
 * Picks which interactable the player is standing at (plan §4: buttons appear only
 * near an interactable). Runs every frame but only writes the store on change.
 */
export function InteractionSystem() {
  useFrame(() => {
    const { items, focusedId, setFocused } = useInteraction.getState()
    const p = playerState.position
    let best: InteractableDef | null = null
    let bestDist = Infinity
    for (const def of Object.values(items)) {
      if (!isInZone(p, def.zone)) continue
      const dist = Math.hypot(p.x - def.zone.x, p.z - def.zone.z)
      const better =
        !best || (def.priority ?? 0) > (best.priority ?? 0) || ((def.priority ?? 0) === (best.priority ?? 0) && dist < bestDist)
      if (better) {
        best = def
        bestDist = dist
      }
    }
    const id = best?.id ?? null
    if (id !== focusedId) setFocused(id)
  })
  return null
}

/** Moving the pointer further than this between down and up is a camera drag, not a tap. */
const TAP_SLOP_PX = 8

/**
 * Invisible box you can tap/click to trigger an interactable's main action
 * (plan §4: "Tap on NPC/object also triggers interaction").
 */
export function InteractableHitArea({ id, position, size }: { id: string; position: Vec3; size: Vec3 }) {
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > TAP_SLOP_PX) return
    e.stopPropagation()
    triggerPrimary(id)
  }
  return (
    <mesh
      position={position}
      visible={false}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <boxGeometry args={size} />
    </mesh>
  )
}

const MARKER_SHAPES: ShapeItem[] = [
  { sphere: [0.17, 16, 12], at: [0, 0.28, 0], color: PALETTE.butter },
  { cyl: [0.13, 0, 0.3, 12], at: [0, 0.06, 0], color: PALETTE.butter },
  { sphere: [0.07, 10, 8], at: [0, 0.28, 0.13], color: PALETTE.coral },
]

/** Bobbing pin that says "something to do here". Hidden once in reach (the buttons take over). */
export function InteractMarker({ id, position, visible = true }: { id: string; position: Vec3; visible?: boolean }) {
  const ref = useRef<Group>(null)
  const scale = useRef(1)
  const focused = useInteraction((s) => s.focusedId === id)
  const shapes = useMemo(() => MARKER_SHAPES, [])

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.position.y = position[1] + Math.sin(t * 2.6) * 0.08
    g.rotation.y = t * 1.6
    scale.current += ((focused ? 0 : 1) - scale.current) * Math.min(1, dt * 8)
    g.scale.setScalar(Math.max(0.001, scale.current))
  })

  return (
    <group ref={ref} position={position} visible={visible}>
      <Shapes shapes={shapes} material={glowMaterial} castShadow={false} receiveShadow={false} />
    </group>
  )
}
