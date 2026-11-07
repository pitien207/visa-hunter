import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { SOLO_LINES } from '../../../data/chatter'
import type { NpcDef } from '../../../data/npcs'
import { useBubbles } from '../../../store/bubbleStore'
import { Shapes, type ShapeItem } from '../../scenes/shared/Shapes'
import type { PointXZ } from '../../systems/playerState'
import { ChibiModel, type MotionState } from '../ChibiModel'
import { SpeechBubble } from './SpeechBubble'

/** The shuttlecock: a weighted rubber base with a plume of feathers. */
const SHUTTLE: ShapeItem[] = [
  { cyl: [0.05, 0.06, 0.04, 10], color: '#d4473b' },
  { cyl: [0.09, 0.02, 0.16, 8], at: [0, 0.1, 0], color: '#ffffff' },
  { cyl: [0.07, 0.015, 0.14, 8], at: [0, 0.1, 0], rot: [0, 0.4, 0], color: '#9fe0f0' },
]

const FLIGHT_SEC = 1.15
const PEAK = 1.9
const KICK_HEIGHT = 0.45
const MISS_CHANCE = 0.14

const say = (id: string) => {
  const lines = SOLO_LINES.kids
  useBubbles.getState().say(id, lines[Math.floor(Math.random() * lines.length)], 1800)
}

/** Two kids kicking a đá cầu shuttlecock back and forth on the sidewalk. */
export function DaCauKids({ a, b, kidA, kidB }: { a: PointXZ; b: PointXZ; kidA: NpcDef; kidB: NpcDef }) {
  const shuttle = useRef<Group>(null)
  const motionA = useRef<MotionState>({ speed: 0 })
  const motionB = useRef<MotionState>({ speed: 0 })
  const st = useRef({ fromA: true, t: 0, miss: false, waitT: 0, kickA: 0, kickB: 0 })

  const yawA = Math.atan2(b.x - a.x, b.z - a.z)
  const yawB = yawA + Math.PI

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = st.current
    s.kickA = Math.max(0, s.kickA - dt)
    s.kickB = Math.max(0, s.kickB - dt)
    motionA.current.kick = s.kickA > 0 ? 1 : 0
    motionB.current.kick = s.kickB > 0 ? 1 : 0

    const from = s.fromA ? a : b
    const to = s.fromA ? b : a
    const g = shuttle.current
    if (!g) return

    if (s.waitT > 0) {
      // Missed: the shuttle lies on the ground for a moment, then gets served again.
      s.waitT -= dt
      if (s.waitT <= 0) {
        s.fromA = !s.fromA
        s.t = 0
        s.miss = false
        if (s.fromA) s.kickA = 0.25
        else s.kickB = 0.25
      }
      return
    }

    s.t += dt
    const u = Math.min(1, s.t / FLIGHT_SEC)
    const overshoot = s.miss ? 1.35 : 1
    const k = u * overshoot
    const x = from.x + (to.x - from.x) * k
    const z = from.z + (to.z - from.z) * k
    let y = KICK_HEIGHT + 4 * PEAK * u * (1 - u)
    if (s.miss) y = Math.max(0.03, KICK_HEIGHT + 4 * PEAK * u * (1 - u) - u * u * KICK_HEIGHT * 1.2)
    g.position.set(x, y, z)
    g.rotation.z = Math.sin(s.t * 6) * 0.3

    if (u >= 1) {
      if (s.miss) {
        g.position.y = 0.03
        s.waitT = 1.6
        say(s.fromA ? kidA.id : kidB.id)
        return
      }
      // The receiver kicks it back.
      if (s.fromA) s.kickB = 0.25
      else s.kickA = 0.25
      s.fromA = !s.fromA
      s.t = 0
      s.miss = Math.random() < MISS_CHANCE
      if (Math.random() < 0.12) say(s.fromA ? kidA.id : kidB.id)
    }
  })

  return (
    <>
      <group position={[a.x, 0, a.z]} rotation={[0, yawA, 0]}>
        <group scale={0.8}>
          <ChibiModel motion={motionA} outfit={kidA.outfit} />
        </group>
        <SpeechBubble id={kidA.id} y={1.7} />
      </group>
      <group position={[b.x, 0, b.z]} rotation={[0, yawB, 0]}>
        <group scale={0.8}>
          <ChibiModel motion={motionB} outfit={kidB.outfit} />
        </group>
        <SpeechBubble id={kidB.id} y={1.7} />
      </group>
      <group ref={shuttle} position={[a.x, KICK_HEIGHT, a.z]}>
        <Shapes shapes={SHUTTLE} />
      </group>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.45, 0.28]} position={[a.x, 0.45, a.z]} />
        <CylinderCollider args={[0.45, 0.28]} position={[b.x, 0.45, b.z]} />
      </RigidBody>
    </>
  )
}
