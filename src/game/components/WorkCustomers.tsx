import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import { CUSTOMER_OUTFITS, type Outfit } from '../../data/npcs'
import { useWork } from '../../store/workStore'
import type { PointXZ } from '../systems/playerState'
import { dampAngle } from '../systems/math'
import { ChibiModel, type MotionState } from './ChibiModel'

type Mood = 'happy' | 'sad' | null

interface Customer {
  seq: number
  outfit: Outfit
  leaving: boolean
  mood: Mood
}

const WALK_SPEED = 3.1

interface CustomerProps extends Customer {
  door: PointXZ
  spot: PointXZ
  onGone: (seq: number) => void
}

/**
 * One customer: walks from the door to the counter, waits (fidgets when impatient),
 * reacts, walks back out and disappears. Coordinates are in the parent group's space.
 */
function CustomerNPC({ seq, outfit, leaving, mood, door, spot, onGone }: CustomerProps) {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const motion = useRef<MotionState>({ speed: 0 })
  const st = useRef({ x: door.x, z: door.z, yaw: Math.PI, reactT: 0, scale: 0, gone: false })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = st.current
    const g = root.current
    if (!g || s.gone) return

    const target = leaving && s.reactT > 0.7 ? door : spot
    if (leaving) s.reactT += dt

    const dx = target.x - s.x
    const dz = target.z - s.z
    const dist = Math.hypot(dx, dz)
    const moving = dist > 0.05 && (!leaving || s.reactT > 0.7)
    if (moving) {
      const step = Math.min(dist, WALK_SPEED * dt)
      s.x += (dx / dist) * step
      s.z += (dz / dist) * step
      s.yaw = dampAngle(s.yaw, Math.atan2(dx, dz), 12, dt)
    } else if (!leaving) {
      s.yaw = dampAngle(s.yaw, Math.atan2(0, -1), 8, dt) // face the counter (-Z)
    }
    motion.current.speed += ((moving ? 1 : 0) - motion.current.speed) * Math.min(1, dt * 10)

    // Pop in at the door, shrink away when leaving through it.
    const fadeOut = leaving && s.reactT > 0.7 && dist < 0.6
    s.scale += ((fadeOut ? 0 : 1) - s.scale) * Math.min(1, dt * 10)
    if (fadeOut && s.scale < 0.05) {
      s.gone = true
      onGone(seq)
      return
    }

    g.position.set(s.x, 0, s.z)
    g.rotation.y = s.yaw
    g.scale.setScalar(Math.max(0.001, s.scale))

    // Reactions: happy hop, sad slump, impatient fidget.
    const b = body.current
    if (b) {
      let hop = 0
      let lean = 0
      let wiggle = 0
      if (leaving && mood === 'happy' && s.reactT < 0.7) hop = Math.abs(Math.sin(s.reactT * 9)) * 0.25
      if (leaving && mood === 'sad') lean = 0.25
      if (!leaving) {
        const order = useWork.getState().session?.order
        if (order?.seq === seq && order.arriveLeft <= 0) {
          const left = order.patienceLeft / order.patienceMax
          if (left < 0.35) wiggle = Math.sin(performance.now() / 60) * 0.08 * (1 - left / 0.35)
        }
      }
      b.position.y = hop
      b.rotation.x = lean
      b.rotation.z = wiggle
    }
  })

  return (
    <group ref={root} position={[door.x, 0, door.z]} scale={0.001}>
      <group ref={body}>
        <ChibiModel motion={motion} outfit={outfit} />
      </group>
      {leaving && mood && (
        <Html center position={[0, 2.05, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="animate-emote text-3xl select-none">{mood === 'happy' ? '💖' : '💢'}</div>
        </Html>
      )}
    </group>
  )
}

/** Spawns a customer per order of the active shift for `taskId`. */
export function WorkCustomers({ taskId, door, spot }: { taskId: string; door: PointXZ; spot: PointXZ }) {
  const active = useWork((s) => s.task?.id === taskId)
  const seq = useWork((s) => (s.task?.id === taskId ? (s.session?.order?.seq ?? null) : null))
  const status = useWork((s) => (s.task?.id === taskId ? (s.session?.order?.status ?? null) : null))
  const working = useWork((s) => s.task?.id === taskId && s.session?.phase === 'working')
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    if (seq === null) return
    setCustomers((cs) =>
      cs.some((c) => c.seq === seq)
        ? cs
        : [
            ...cs.map((c) => ({ ...c, leaving: true })),
            { seq, outfit: CUSTOMER_OUTFITS[(seq - 1) % CUSTOMER_OUTFITS.length], leaving: false, mood: null },
          ],
    )
  }, [seq])

  useEffect(() => {
    if (seq === null || status === null || status === 'waiting') return
    const mood: Mood = status === 'served' ? 'happy' : 'sad'
    setCustomers((cs) => cs.map((c) => (c.seq === seq ? { ...c, leaving: true, mood } : c)))
  }, [seq, status])

  useEffect(() => {
    if (!working) setCustomers((cs) => (cs.some((c) => !c.leaving) ? cs.map((c) => ({ ...c, leaving: true })) : cs))
  }, [working, active])

  const onGone = (gone: number) => setCustomers((cs) => cs.filter((c) => c.seq !== gone))

  return (
    <>
      {customers.map((c) => (
        <CustomerNPC key={c.seq} {...c} door={door} spot={spot} onGone={onGone} />
      ))}
    </>
  )
}
