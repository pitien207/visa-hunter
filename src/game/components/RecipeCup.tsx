import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { Vec3 } from '../../data/config'
import type { TaskDef } from '../../data/tasks'
import { useWork } from '../../store/workStore'
import { glassMaterial, solidMaterial } from '../scenes/shared/materials'
import { PALETTE } from '../scenes/shared/palette'
import { Shapes, type ShapeItem } from '../scenes/shared/Shapes'

const LAYER_H = 0.045
const CUP_R = 0.085

const GLASS: ShapeItem[] = [
  { cyl: [CUP_R + 0.012, CUP_R - 0.005, 0.22, 14], at: [0, 0.11, 0], color: PALETTE.glass },
  { cyl: [CUP_R + 0.02, CUP_R + 0.02, 0.015, 14], at: [0, 0.005, 0], color: PALETTE.white },
]

/**
 * The drink being made, on the counter in front of the player. Each pressed action
 * adds a layer in that ingredient's colour, so the buttons visibly "do" something.
 */
export function RecipeCup({ task, position }: { task: TaskDef; position: Vec3 }) {
  const added = useWork((s) => (s.task?.id === task.id ? s.session?.order?.added : undefined))
  const status = useWork((s) => (s.task?.id === task.id ? s.session?.order?.status : undefined))
  const ref = useRef<Group>(null)
  const pop = useRef(0)
  const lastCount = useRef(0)

  const layers = useMemo<ShapeItem[]>(() => {
    if (!added || added.length === 0) return []
    return added.map((id, i) => ({
      cyl: [CUP_R - 0.004, CUP_R - 0.006, LAYER_H, 14],
      at: [0, 0.02 + LAYER_H * (i + 0.5), 0],
      color: task.actions.find((a) => a.id === id)?.color ?? PALETTE.white,
    }))
  }, [added, task])

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const count = added?.length ?? 0
    if (count !== lastCount.current) {
      if (count > lastCount.current) pop.current = 1
      lastCount.current = count
    }
    pop.current = Math.max(0, pop.current - dt * 5)
    const s = 1 + pop.current * 0.18
    g.scale.set(s, 1 + pop.current * 0.1, s)
  })

  if (added === undefined || status !== 'waiting') return null

  return (
    <group ref={ref} position={position}>
      <Shapes shapes={GLASS} material={glassMaterial} castShadow={false} receiveShadow={false} />
      {layers.length > 0 && <Shapes shapes={layers} material={solidMaterial} castShadow={false} />}
    </group>
  )
}
