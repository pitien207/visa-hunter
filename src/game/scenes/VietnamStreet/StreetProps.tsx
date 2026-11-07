import { useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import {
  benchShapes,
  cafeTableSetShapes,
  motorbikeShapes,
  place,
  plantShapes,
  treeShapes,
} from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { BENCHES, CAFE_TABLES, MOTORBIKES, PLANTS, TREES } from './layout'

/** All sidewalk props merged into one mesh, with simple colliders in one fixed body. */
export function StreetProps() {
  const shapes = useMemo<ShapeItem[]>(
    () => [
      ...TREES.map((t, i) => place(treeShapes(t.variant), t.at, i * 1.3, t.scale ?? 1)),
      ...PLANTS.map((at, i) => place(plantShapes(), at, i * 0.9)),
      ...MOTORBIKES.map((m) => place(motorbikeShapes(m.color), m.at, m.rotY)),
      ...CAFE_TABLES.map((t) => place(cafeTableSetShapes(t.stools), t.at, 0.3)),
      ...BENCHES.map((b) => place(benchShapes(), b.at, b.rotY)),
    ],
    [],
  )

  return (
    <>
      <Shapes shapes={shapes} />
      <RigidBody type="fixed" colliders={false}>
        {TREES.map((t, i) => (
          <CylinderCollider key={`tree${i}`} args={[0.8, 0.22 * (t.scale ?? 1)]} position={[t.at[0], 0.8, t.at[2]]} />
        ))}
        {PLANTS.map((at, i) => (
          <CylinderCollider key={`plant${i}`} args={[0.35, 0.24]} position={[at[0], 0.35, at[2]]} />
        ))}
        {MOTORBIKES.map((m, i) => (
          <CuboidCollider
            key={`bike${i}`}
            args={[0.24, 0.55, 0.78]}
            position={[m.at[0], 0.55, m.at[2]]}
            rotation={[0, m.rotY, 0]}
          />
        ))}
        {CAFE_TABLES.map((t, i) => (
          <CylinderCollider key={`table${i}`} args={[0.4, 0.75]} position={[t.at[0], 0.4, t.at[2]]} />
        ))}
        {BENCHES.map((b, i) => (
          <CuboidCollider
            key={`bench${i}`}
            args={[0.8, 0.45, 0.25]}
            position={[b.at[0], 0.45, b.at[2]]}
            rotation={[0, b.rotY, 0]}
          />
        ))}
      </RigidBody>
    </>
  )
}
