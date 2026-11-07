import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { SOLO_LINES } from '../../../data/chatter'
import { CONFIG } from '../../../data/config'
import { RIDER_OUTFITS, type Outfit } from '../../../data/npcs'
import { useBubbles } from '../../../store/bubbleStore'
import { PALETTE as P } from '../../scenes/shared/palette'
import { bicycleShapes, carShapes, motorbikeShapes } from '../../scenes/shared/props'
import { Shapes } from '../../scenes/shared/Shapes'
import { damp } from '../../systems/math'
import { playerState } from '../../systems/playerState'
import { ChibiModel, type MotionState } from '../ChibiModel'
import { SpeechBubble } from './SpeechBubble'

export interface Lane {
  z: number
  /** +1 drives toward +X, −1 toward −X. */
  dir: 1 | -1
}

const BIKE_COLORS = [P.rose, P.sky2, P.butter, P.mint, P.lilac, P.peach]

export type VehicleKind = 'motorbike' | 'car' | 'bicycle'

const VEHICLE = {
  motorbike: { shapes: motorbikeShapes, rider: { seatY: 0.86, z: -0.2 }, half: [0.28, 0.6, 0.85], speed: 1, honk: 'biker' },
  bicycle: { shapes: bicycleShapes, rider: { seatY: 0.98, z: -0.15 }, half: [0.25, 0.6, 0.8], speed: 0.55, honk: 'cyclist' },
  car: { shapes: carShapes, rider: null, half: [0.6, 0.7, 1.2], speed: 1.05, honk: 'driver' },
} as const
const LANE_HALF_WIDTH = 1.1

interface BikeProps {
  id: string
  kind: VehicleKind
  lane: Lane
  startX: number
  color: string
  outfit: Outfit
}

/** One scooter + helmeted rider cruising a lane. Slows, stops and honks for the player. */
function TrafficBike({ id, kind, lane, startX, color, outfit }: BikeProps) {
  const vehicle = VEHICLE[kind]
  const group = useRef<Group>(null)
  const rb = useRef<RapierRigidBody>(null)
  const rider = useRef<MotionState>({ speed: 0, sit: 1, seatY: vehicle.rider?.seatY ?? 0.86, arms: 1 })
  const shapes = useMemo(() => vehicle.shapes(color), [vehicle, color])
  const cfg = CONFIG.traffic
  const st = useRef<{ x: number; cruise: number; speed: number; honked: boolean; t: number } | null>(null)
  if (!st.current) {
    const cruise = (cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin)) * vehicle.speed
    st.current = { x: startX, cruise, speed: cruise, honked: false, t: Math.random() * 10 }
  }

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = st.current
    if (!s) return
    const p = playerState.position
    const ahead = (p.x - s.x) * lane.dir
    const inLane = Math.abs(p.z - lane.z) < LANE_HALF_WIDTH
    let target = s.cruise
    if (inLane && ahead > 0 && ahead < cfg.slowDistance) {
      target = ahead <= cfg.stopDistance ? 0 : (s.cruise * (ahead - cfg.stopDistance)) / (cfg.slowDistance - cfg.stopDistance)
      if (!s.honked) {
        s.honked = true
        const lines = SOLO_LINES[vehicle.honk] ?? SOLO_LINES.biker
        useBubbles.getState().say(id, lines[Math.floor(Math.random() * lines.length)], 1800)
      }
    } else if (!inLane || ahead < -1.5) {
      s.honked = false
    }
    s.speed = damp(s.speed, target, target < s.speed ? 6 : 2, dt)
    s.x += lane.dir * s.speed * dt
    if (s.x * lane.dir > cfg.wrapX) {
      s.x = -lane.dir * cfg.wrapX
      s.cruise = (cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin)) * vehicle.speed
    }
    s.t += dt

    const g = group.current
    if (g) {
      g.position.set(s.x, Math.abs(Math.sin(s.t * 9)) * 0.015 * Math.min(1, s.speed), lane.z)
    }
    rb.current?.setNextKinematicTranslation({ x: s.x, y: 0, z: lane.z })
  })

  const yaw = lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2
  return (
    <>
      <group ref={group} position={[startX, 0, lane.z]} rotation={[0, yaw, 0]}>
        <Shapes shapes={shapes} />
        {vehicle.rider && (
          <group position={[0, 0, vehicle.rider.z]}>
            <ChibiModel motion={rider} outfit={outfit} />
          </group>
        )}
        <SpeechBubble id={id} y={2.45} />
      </group>
      <RigidBody ref={rb} type="kinematicPosition" colliders={false} position={[startX, 0, lane.z]} rotation={[0, yaw, 0]}>
        <CuboidCollider args={[vehicle.half[0], vehicle.half[1], vehicle.half[2]]} position={[0, vehicle.half[1], 0]} />
      </RigidBody>
    </>
  )
}

/** Motorbike traffic on the main road — the soundtrack of every Vietnamese street. */
export function Traffic({ lanes, perLane = 2, kinds = ['motorbike'], outfits = RIDER_OUTFITS }: { lanes: Lane[]; perLane?: number; kinds?: VehicleKind[]; outfits?: Outfit[] }) {
  const bikes = useMemo(() => {
    const list: BikeProps[] = []
    let n = 0
    for (const lane of lanes) {
      for (let i = 0; i < perLane; i++) {
        list.push({
          id: `bike-${n}`,
          kind: kinds[n % kinds.length],
          lane,
          startX: -CONFIG.traffic.wrapX + ((i + 0.5) / perLane) * 2 * CONFIG.traffic.wrapX + n * 3,
          color: BIKE_COLORS[n % BIKE_COLORS.length],
          outfit: outfits[n % outfits.length],
        })
        n++
      }
    }
    return list
  }, [lanes, perLane, kinds, outfits])

  return (
    <>
      {bikes.map((b) => (
        <TrafficBike key={b.id} {...b} />
      ))}
    </>
  )
}
