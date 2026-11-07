import { useMemo } from 'react'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { QuadraticBezierCurve3, TubeGeometry, Vector3 } from 'three'
import type { Vec3 } from '../../../data/config'
import { glowMaterial } from './materials'
import { PALETTE as P } from './palette'
import { Shapes, type ShapeItem } from './Shapes'
import { PROP_GROUPS } from '../../systems/collisionGroups'

export interface PoleSpec {
  x: number
  z: number
  /** Adds a street lamp arm pointing toward +Z (the road). */
  lamp?: boolean
  transformer?: boolean
  /** Poles outside the play area don't need colliders. */
  collider?: boolean
}

export interface PowerLinesProps {
  poles: PoleSpec[]
  /** Pairs of pole indices connected by a bundle of wires. */
  spans: [number, number][]
  /** Single droopy wires from a pole to a point on a building. */
  drops: { from: number; to: Vec3 }[]
}

// Tall like real Vietnamese poles: the wires run above the follow camera, not through the view.
const POLE_HEIGHT = 10
const WIRE_HEIGHTS = [9.45, 9.2, 8.95, 8.7]
const WIRE_OFFSETS = [-0.5, -0.18, 0.18, 0.5]

function wire(a: Vector3, b: Vector3, sag: number): ShapeItem {
  // A quadratic Bézier's midpoint sits halfway to the control point, so drop it by 2× sag.
  const control = a.clone().add(b).multiplyScalar(0.5)
  control.y -= sag * 2
  const curve = new QuadraticBezierCurve3(a, control, b)
  return { geometry: new TubeGeometry(curve, 14, 0.022, 4, false), color: P.wire }
}

function poleShapes(p: PoleSpec): ShapeItem[] {
  const { x, z } = p
  const items: ShapeItem[] = [
    { cyl: [0.11, 0.16, POLE_HEIGHT, 8], at: [x, POLE_HEIGHT / 2, z], color: P.concrete },
    { box: [0.12, 0.12, 1.4], at: [x, 9.55, z], color: '#bdb5aa' },
    // The famous tangle of spare cable coiled around the pole.
    { torus: [0.26, 0.05, 5, 14], at: [x, 7.7, z], rot: [Math.PI / 2 + 0.2, 0, 0], color: P.wire },
    { torus: [0.21, 0.045, 5, 14], at: [x, 7.45, z], rot: [Math.PI / 2 - 0.25, 0.3, 0], color: P.wire },
    // A couple of faded posters.
    { box: [0.34, 0.45, 0.02], at: [x, 1.6, z + 0.15], color: P.butter },
    { box: [0.3, 0.3, 0.02], at: [x, 2.15, z + 0.15], rot: [0, 0, 0.1], color: P.sky2 },
  ]
  for (const off of WIRE_OFFSETS) {
    items.push({ cyl: [0.035, 0.035, 0.12, 6], at: [x, 9.67, z + off], color: P.white })
  }
  if (p.transformer) {
    items.push({ cyl: [0.28, 0.28, 0.8, 10], at: [x + 0.38, 6.8, z], color: P.steel })
    items.push({ box: [0.5, 0.06, 0.3], at: [x + 0.2, 6.35, z], color: '#bdb5aa' })
  }
  if (p.lamp) {
    items.push({ box: [0.08, 0.08, 1.3], at: [x, 7.6, z + 0.6], rot: [-0.15, 0, 0], color: P.darkSteel })
    items.push({ box: [0.26, 0.12, 0.5], at: [x, 7.68, z + 1.3], color: P.white })
  }
  return items
}

export function PowerLines({ poles, spans, drops }: PowerLinesProps) {
  const poleItems = useMemo(() => poles.flatMap(poleShapes), [poles])
  // Lamp lenses are unlit so they read as glowing, especially at night.
  const lensItems = useMemo<ShapeItem[]>(
    () => poles.filter((p) => p.lamp).map((p) => ({ box: [0.2, 0.03, 0.4], at: [p.x, 7.61, p.z + 1.3], color: '#fff2b3' })),
    [poles],
  )

  const wireItems = useMemo(() => {
    const items: ShapeItem[] = []
    spans.forEach(([ia, ib], spanIndex) => {
      const a = poles[ia]
      const b = poles[ib]
      // Spread the bundle perpendicular to the span direction.
      const dx = b.x - a.x
      const dz = b.z - a.z
      const len = Math.hypot(dx, dz) || 1
      const px = -dz / len
      const pz = dx / len
      WIRE_HEIGHTS.forEach((h, i) => {
        const off = WIRE_OFFSETS[i]
        const sag = 0.3 + ((i * 7 + spanIndex * 3) % 5) * 0.1
        items.push(
          wire(new Vector3(a.x + px * off, h, a.z + pz * off), new Vector3(b.x + px * off, h, b.z + pz * off), sag),
        )
      })
    })
    drops.forEach(({ from, to }, i) => {
      const p = poles[from]
      items.push(wire(new Vector3(p.x, 8.3 - (i % 2) * 0.3, p.z), new Vector3(...to), 0.45 + (i % 3) * 0.15))
    })
    return items
  }, [poles, spans, drops])

  return (
    <>
      <Shapes shapes={poleItems} />
      <Shapes shapes={lensItems} material={glowMaterial} castShadow={false} receiveShadow={false} />
      {/* Thin wires look noisy as shadows, so they don't cast any. */}
      <Shapes shapes={wireItems} castShadow={false} receiveShadow={false} />
      <RigidBody type="fixed" colliders={false}>
        {poles
          .filter((p) => p.collider !== false)
          .map((p) => (
            <CylinderCollider key={`${p.x},${p.z}`} args={[1.5, 0.2]} position={[p.x, 1.5, p.z]} collisionGroups={PROP_GROUPS} />
          ))}
      </RigidBody>
    </>
  )
}
