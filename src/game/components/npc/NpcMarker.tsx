import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import type { Group } from 'three'
import { overlayMaterial } from '../../scenes/shared/materials'
import { Shapes, type ShapeItem } from '../../scenes/shared/Shapes'

/** Red lacquer badge with a gold "!" — "this person has something to say". */
const BADGE: ShapeItem[] = [
  { cyl: [0.2, 0.2, 0.04, 20], rot: [Math.PI / 2, 0, 0], color: '#d4473b' },
  { torus: [0.2, 0.025, 6, 24], color: '#ffe6a6' },
  { box: [0.07, 0.18, 0.03], at: [0, 0.05, 0.03], color: '#ffe6a6' },
  { sphere: [0.042, 10, 8], at: [0, -0.1, 0.03], color: '#ffe6a6' },
]

export function NpcMarker({ visible, y = 2.15 }: { visible: boolean; y?: number }) {
  const ref = useRef<Group>(null)
  const scale = useRef(0)

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    scale.current += ((visible ? 1 : 0) - scale.current) * Math.min(1, dt * 8)
    g.visible = scale.current > 0.02
    g.scale.setScalar(Math.max(0.001, scale.current))
    g.position.y = y + Math.sin(state.clock.elapsedTime * 3) * 0.07
  })

  return (
    <group ref={ref} position={[0, y, 0]}>
      <Billboard>
        <Shapes shapes={BADGE} material={overlayMaterial} renderOrder={20} castShadow={false} receiveShadow={false} />
      </Billboard>
    </group>
  )
}
