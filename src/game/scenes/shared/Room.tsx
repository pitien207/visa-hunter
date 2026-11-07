import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { BUILDING_GROUPS, PROP_GROUPS } from '../../systems/collisionGroups'
import { groundMaterial } from './materials'
import { Shapes, type ShapeItem } from './Shapes'

export interface RoomStyle {
  wall: string
  wallLow: string
  floor: string
  floorAlt: string
  trim: string
  window?: string
}

export interface RoomProps {
  /** Width (x) and depth (z) of the floor; the room is centred on the origin. */
  w: number
  d: number
  h?: number
  style: RoomStyle
  /** Window centres along the back wall (x positions). */
  windows?: number[]
  /** Extra shapes (furniture) merged with the room. */
  furniture?: ShapeItem[]
  /** Solid furniture footprints [x, z, halfX, halfZ]. */
  blockers?: [number, number, number, number][]
}

/**
 * A "dollhouse" interior: chequered floor, a full back wall with windows, low side walls
 * and an open front so the follow camera can look in from outside.
 */
export function Room({ w, d, h = 3, style, windows = [], furniture = [], blockers = [] }: RoomProps) {
  const floor = useMemo<ShapeItem[]>(() => {
    const s: ShapeItem[] = []
    const tile = 1
    for (let x = -w / 2; x < w / 2 - 0.01; x += tile) {
      for (let z = -d / 2; z < d / 2 - 0.01; z += tile) {
        const alt = (Math.round(x + w) + Math.round(z + d)) % 2 === 0
        s.push({ box: [tile, 0.04, tile], at: [x + tile / 2, 0.02, z + tile / 2], color: alt ? style.floor : style.floorAlt })
      }
    }
    // A strip of floor outside the open front, so the room sits on a little stage.
    s.push({ box: [w + 1.2, 0.2, d + 1.2], at: [0, -0.1, 0], color: style.trim })
    return s
  }, [w, d, style])

  const shell = useMemo<ShapeItem[]>(() => {
    const s: ShapeItem[] = []
    const t = 0.2
    s.push({ box: [w + t * 2, h, t], at: [0, h / 2, -d / 2 - t / 2], color: style.wall })
    s.push({ box: [w + t * 2, 0.15, t + 0.04], at: [0, 0.07, -d / 2 - t / 2 + 0.02], color: style.trim })
    s.push({ box: [w + t * 2, 0.12, t + 0.06], at: [0, h - 0.06, -d / 2 - t / 2 + 0.03], color: style.trim })
    for (const side of [-1, 1]) {
      // Side walls step down toward the front so the camera sees in.
      s.push({ box: [t, h, d * 0.55], at: [side * (w / 2 + t / 2), h / 2, -d / 2 + (d * 0.55) / 2], color: style.wall })
      s.push({ box: [t, 1.0, d * 0.45], at: [side * (w / 2 + t / 2), 0.5, d / 2 - (d * 0.45) / 2], color: style.wallLow })
      s.push({ box: [t + 0.06, 0.08, d * 0.45], at: [side * (w / 2 + t / 2), 1.04, d / 2 - (d * 0.45) / 2], color: style.trim })
    }
    for (const x of windows) {
      s.push({ box: [1.5, 1.3, 0.06], at: [x, 1.75, -d / 2 + 0.01], color: style.trim })
      s.push({ box: [1.3, 1.1, 0.07], at: [x, 1.75, -d / 2 + 0.02], color: style.window ?? '#bfe6f2' })
      s.push({ box: [0.05, 1.1, 0.09], at: [x, 1.75, -d / 2 + 0.03], color: style.trim })
      s.push({ box: [1.6, 0.08, 0.2], at: [x, 1.08, -d / 2 + 0.08], color: style.trim })
    }
    return [...s, ...furniture]
  }, [w, d, h, style, windows, furniture])

  return (
    <>
      <Shapes shapes={floor} material={groundMaterial} castShadow={false} />
      <Shapes shapes={shell} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[w / 2 + 0.3, h / 2, 0.2]} position={[0, h / 2, -d / 2 - 0.2]} collisionGroups={BUILDING_GROUPS} />
        <CuboidCollider args={[0.2, h / 2, d / 2 + 0.3]} position={[-w / 2 - 0.2, h / 2, 0]} collisionGroups={BUILDING_GROUPS} />
        <CuboidCollider args={[0.2, h / 2, d / 2 + 0.3]} position={[w / 2 + 0.2, h / 2, 0]} collisionGroups={BUILDING_GROUPS} />
        {/* Invisible front edge: leave through the door, not the open side. */}
        <CuboidCollider args={[w / 2 + 0.3, 1.5, 0.2]} position={[0, 1.5, d / 2 + 0.35]} collisionGroups={PROP_GROUPS} />
        {blockers.map(([x, z, hx, hz], i) => (
          <CuboidCollider key={i} args={[hx, 0.6, hz]} position={[x, 0.6, z]} collisionGroups={PROP_GROUPS} />
        ))}
      </RigidBody>
    </>
  )
}
