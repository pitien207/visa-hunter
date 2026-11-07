import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { Vec3 } from '../../../data/config'
import { BUILDING_GROUPS } from '../../systems/collisionGroups'
import { PALETTE as P } from '../shared/palette'
import { Shapes, type ShapeItem } from '../shared/Shapes'

export interface AltbauOptions {
  width: number
  depth: number
  floors: number
  wall: string
  trim: string
  roof: string
  /** x of the front door (local), or null for a shop front. */
  doorX: number | null
  flowers?: boolean
}

const FLOOR_H = 3

/** A pastel German "Altbau" townhouse: window grid, cornices, flower boxes, gabled roof. */
function altbauShapes(o: AltbauOptions): ShapeItem[] {
  const { width: w, depth: d, floors } = o
  const H = floors * FLOOR_H + 0.4
  const f = d / 2
  const s: ShapeItem[] = []
  s.push({ box: [w, H, d], at: [0, H / 2, 0], color: o.wall })
  s.push({ box: [w + 0.1, 0.7, 0.12], at: [0, 0.35, f + 0.04], color: '#b8aa98' })
  for (let i = 1; i <= floors; i++) {
    s.push({ box: [w + 0.16, 0.16, 0.18], at: [0, i * FLOOR_H + 0.3, f + 0.06], color: o.trim })
  }
  s.push({ box: [w + 0.3, 0.3, 0.3], at: [0, H, f + 0.05], color: o.trim })

  // Gabled roof: a triangular prism (3-sided cylinder) squashed in height.
  const r = d / Math.sqrt(3) + 0.15
  const k = 0.42
  s.push({ cyl: [r, r, w + 0.25, 3], at: [0, H + 0.5 * r * k, 0], rot: [-Math.PI / 2, 0, Math.PI / 2], scale: [1, 1, k], color: o.roof })
  // Dormers and a chimney
  const dormers = Math.max(1, Math.floor(w / 2.6))
  for (let i = 0; i < dormers; i++) {
    const x = -w / 2 + (w / dormers) * (i + 0.5)
    s.push({ box: [0.9, 0.9, 0.8], at: [x, H + 0.75, f - 1.2], color: o.wall })
    s.push({ box: [0.6, 0.55, 0.05], at: [x, H + 0.75, f - 0.78], color: '#a9c8dc' })
    s.push({ box: [1.05, 0.12, 0.95], at: [x, H + 1.25, f - 1.2], color: o.roof })
  }
  s.push({ box: [0.5, 1.3, 0.5], at: [w * 0.3, H + 1.5, -0.6], color: '#b5524a' })

  // Windows on the upper floors
  const cols = Math.max(2, Math.floor((w - 0.6) / 1.45))
  for (let fl = 1; fl < floors; fl++) {
    const y = fl * FLOOR_H + 1.45
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + (w / cols) * (c + 0.5)
      s.push({ box: [0.95, 1.6, 0.06], at: [x, y, f + 0.01], color: P.white })
      s.push({ box: [0.78, 1.42, 0.07], at: [x, y, f + 0.02], color: '#a9c8dc' })
      s.push({ box: [0.05, 1.42, 0.09], at: [x, y, f + 0.03], color: P.white })
      s.push({ box: [0.78, 0.05, 0.09], at: [x, y + 0.25, f + 0.03], color: P.white })
      s.push({ box: [1.05, 0.08, 0.22], at: [x, y - 0.84, f + 0.1], color: o.trim })
      if (o.flowers && (fl + c) % 2 === 0) {
        s.push({ box: [0.8, 0.18, 0.2], at: [x, y - 0.7, f + 0.18], color: '#b5524a' })
        for (let k2 = 0; k2 < 3; k2++) s.push({ ico: [0.1], at: [x - 0.25 + k2 * 0.25, y - 0.56, f + 0.2], color: k2 % 2 ? '#ff6b5e' : '#e0485a' })
        s.push({ ico: [0.12], at: [x, y - 0.6, f + 0.25], color: P.leafDark })
      }
    }
  }

  // Front door with a fanlight and a house number
  if (o.doorX !== null) {
    const x = o.doorX
    s.push({ box: [1.5, 2.7, 0.08], at: [x, 1.35, f + 0.02], color: o.trim })
    s.push({ box: [1.2, 2.4, 0.1], at: [x, 1.2, f + 0.04], color: '#6a4a3a' })
    s.push({ cyl: [0.6, 0.6, 0.1, 12], at: [x, 2.4, f + 0.04], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5], color: '#a9c8dc' })
    s.push({ sphere: [0.05, 6, 6], at: [x + 0.4, 1.15, f + 0.12], color: '#c9a64a' })
    s.push({ box: [1.6, 0.14, 0.7], at: [x, 0.07, f + 0.35], color: '#b8aa98' })
    s.push({ box: [0.3, 0.22, 0.03], at: [x + 1.0, 2.0, f + 0.06], color: '#4f6fa8' })
    // Ground-floor windows beside the door
    for (const side of [-1, 1]) {
      const wx = x + side * 2.0
      if (Math.abs(wx) > w / 2 - 0.5) continue
      s.push({ box: [0.95, 1.3, 0.06], at: [wx, 1.6, f + 0.01], color: P.white })
      s.push({ box: [0.78, 1.12, 0.07], at: [wx, 1.6, f + 0.02], color: '#a9c8dc' })
    }
  }
  return s
}

export function Altbau({ position, ...o }: AltbauOptions & { position: Vec3 }) {
  const { width, depth, floors, wall, trim, roof, doorX, flowers } = o
  const shapes = useMemo(
    () => altbauShapes({ width, depth, floors, wall, trim, roof, doorX, flowers }),
    [width, depth, floors, wall, trim, roof, doorX, flowers],
  )
  const H = floors * FLOOR_H + 0.4
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <Shapes shapes={shapes} />
      <CuboidCollider args={[width / 2, H / 2 + 0.5, depth / 2]} position={[0, H / 2 + 0.5, 0]} collisionGroups={BUILDING_GROUPS} />
    </RigidBody>
  )
}
