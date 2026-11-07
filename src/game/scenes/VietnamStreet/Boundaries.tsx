import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { PALETTE as P } from '../shared/palette'
import { barrierShapes, coneShapes, place } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { PLAY, ROAD, SIDE_ROAD } from './layout'

const WALL_H = 4
const T = 0.5 // half thickness of the invisible walls

/** A row of puffy low-poly hedge blobs between two points. */
function hedge(from: [number, number], to: [number, number]): ShapeItem[] {
  const [x0, z0] = from
  const [x1, z1] = to
  const len = Math.hypot(x1 - x0, z1 - z0)
  const n = Math.max(2, Math.round(len / 0.9))
  const s: ShapeItem[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    s.push({
      ico: [0.55 + (i % 3) * 0.06],
      at: [x0 + (x1 - x0) * t, 0.45, z0 + (z1 - z0) * t],
      rot: [i * 0.7, i * 1.3, 0],
      color: i % 4 === 0 ? P.leafLight : P.leafDark,
    })
  }
  return s
}

/** Visible edges of the playable area (hedges, back wall, road barriers) + invisible walls. */
export function Boundaries() {
  const shapes = useMemo<ShapeItem[]>(() => {
    const s: ShapeItem[] = []
    const { minX, maxX, minZ, maxZ } = PLAY

    // Back wall behind the buildings (stops at the side road)
    const wallLen = SIDE_ROAD.minX - minX + 0.4
    const wallX = minX - 0.4 + wallLen / 2
    s.push({ box: [wallLen, 1.8, 0.4], at: [wallX, 0.9, minZ - 0.2], color: P.cream })
    s.push({ box: [wallLen + 0.1, 0.14, 0.5], at: [wallX, 1.85, minZ - 0.2], color: P.peach })

    // Hedges along the west, south and east edges (gaps where the roads pass)
    s.push(...hedge([minX - 0.35, -4.2], [minX - 0.35, ROAD.minZ - 0.4]))
    s.push(...hedge([minX - 0.35, ROAD.maxZ + 0.4], [minX - 0.35, maxZ + 0.35]))
    s.push(...hedge([minX - 0.35, maxZ + 0.35], [maxX + 0.35, maxZ + 0.35]))
    s.push(...hedge([maxX + 0.35, ROAD.maxZ + 0.4], [maxX + 0.35, maxZ + 0.35]))
    s.push(...hedge([maxX + 0.35, minZ], [maxX + 0.35, ROAD.minZ - 0.4]))

    // The main road stays open for traffic (invisible walls stop the player);
    // the side road is closed off. Cones mark the sidewalk corners.
    const sideW = SIDE_ROAD.maxX - SIDE_ROAD.minX
    s.push(place(barrierShapes(sideW), [(SIDE_ROAD.minX + SIDE_ROAD.maxX) / 2, 0, minZ - 0.2]))
    s.push(place(coneShapes(), [minX + 0.4, 0, ROAD.minZ - 0.5]))
    s.push(place(coneShapes(), [minX + 0.4, 0, ROAD.maxZ + 0.5]))
    s.push(place(coneShapes(), [maxX - 0.4, 0, ROAD.minZ - 0.5]))
    s.push(place(coneShapes(), [maxX - 0.4, 0, ROAD.maxZ + 0.5]))
    s.push(place(coneShapes(), [SIDE_ROAD.minX + 0.8, 0, minZ + 0.6]))
    return s
  }, [])

  const { minX, maxX, minZ, maxZ } = PLAY
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  const halfW = (maxX - minX) / 2 + 2 * T
  const halfD = (maxZ - minZ) / 2 + 2 * T

  return (
    <>
      <Shapes shapes={shapes} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[T, WALL_H, halfD]} position={[minX - T, WALL_H, cz]} />
        <CuboidCollider args={[T, WALL_H, halfD]} position={[maxX + T, WALL_H, cz]} />
        <CuboidCollider args={[halfW, WALL_H, T]} position={[cx, WALL_H, minZ - T]} />
        <CuboidCollider args={[halfW, WALL_H, T]} position={[cx, WALL_H, maxZ + T]} />
      </RigidBody>
    </>
  )
}
