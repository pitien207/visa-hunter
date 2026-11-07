import { useMemo } from 'react'
import { PALETTE as P } from '../shared/palette'
import { place, treeShapes } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { ROAD, SIDE_ROAD } from './layout'

/**
 * Distant pastel city blocks that fade into the fog.
 * Kept beyond ~28 m from the centre so the follow camera never ends up inside one.
 */
const COLORS = [P.peach, P.butter, P.mint, P.sky2, P.lilac, P.rose, P.cream]
const MIN_RADIUS = 28

/** Deterministic pseudo-random so the skyline looks the same on every load. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function onRoad(x: number, z: number, sideRoad: boolean, lake: boolean) {
  // Hồ Gươm lies to the south of the Hà Nội street: no buildings there.
  if (lake && z > ROAD.maxZ + 3) return true
  const onMain = z > ROAD.minZ - 3.5 && z < ROAD.maxZ + 3.5
  const onSide = sideRoad && x > SIDE_ROAD.minX - 3 && x < SIDE_ROAD.maxX + 3 && z < ROAD.minZ
  return onMain || onSide
}

function backdropShapes(colors: string[], roof: string, sideRoad: boolean, tree: 'green' | 'linden', lake: boolean): ShapeItem[] {
  const s: ShapeItem[] = []
  let seed = 1
  for (let ring = 0; ring < 2; ring++) {
    const radius = MIN_RADIUS + ring * 9
    const count = 26 + ring * 8
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + ring * 0.2
      const r = radius + rand(seed++) * 4
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      if (onRoad(x, z, sideRoad, lake)) continue
      const w = 4 + rand(seed++) * 4
      const d = 4 + rand(seed++) * 3
      const h = 5 + rand(seed++) * (ring === 0 ? 8 : 14)
      const color = colors[Math.floor(rand(seed++) * colors.length)]
      const rotY = -a + Math.PI / 2
      s.push({ box: [w, h, d], at: [x, h / 2, z], rot: [0, rotY, 0], color })
      s.push({ box: [w + 0.2, 0.3, d + 0.2], at: [x, h + 0.15, z], rot: [0, rotY, 0], color: roof })
      if (rand(seed++) > 0.5) {
        const variant = tree === 'linden' ? 'linden' : rand(seed++) > 0.7 ? 'blossom' : 'green'
        s.push(place(treeShapes(variant), [x * 0.92, 0, z * 0.92], a, 1.3))
      }
    }
  }
  return s
}

export function Backdrop({
  colors = COLORS,
  roof = P.cream,
  sideRoad = true,
  tree = 'green',
  lake = false,
}: {
  colors?: string[]
  roof?: string
  sideRoad?: boolean
  tree?: 'green' | 'linden'
  lake?: boolean
}) {
  const shapes = useMemo(() => backdropShapes(colors, roof, sideRoad, tree, lake), [colors, roof, sideRoad, tree, lake])
  return <Shapes shapes={shapes} castShadow={false} receiveShadow={false} />
}
