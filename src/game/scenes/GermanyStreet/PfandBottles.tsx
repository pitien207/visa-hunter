import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CONFIG } from '../../../data/config'
import { usePfand, type Bottle } from '../../../store/pfandStore'
import { pickUpBottle } from '../../systems/pfand'
import { playerState } from '../../systems/playerState'
import { Shapes, type ShapeItem } from '../shared/Shapes'

/** Where bottles can turn up: sidewalks, benches, the park strip. */
const SPOTS: [number, number][] = [
  [-12, -2.2], [-8, -1.5], [-6, -2.6], [-4.5, 0.2], [-1, -1.8], [0.6, 0.9], [3.2, -2.2], [5.2, 0.5],
  [7.2, -1.6], [8.6, -0.2], [11, -1.4], [13, 0.4], [-11, 9.8], [-7, 10.4], [-1, 10.2], [1.6, 10.0],
  [6, 10.6], [9.5, 10.0], [11.8, 10.6], [-13, 11],
]

const COLORS = ['#5fa06a', '#a8754f', '#cfe8f6']
const bottleShapes = (kind: number): ShapeItem[] => [
  { cyl: [0.06, 0.07, 0.24, 8], at: [0, 0.12, 0], color: COLORS[kind] },
  { cyl: [0.025, 0.05, 0.1, 8], at: [0, 0.29, 0], color: COLORS[kind] },
  { cyl: [0.028, 0.028, 0.03, 8], at: [0, 0.35, 0], color: '#f4c04e' },
]
const SHAPES = [bottleShapes(0), bottleShapes(1), bottleShapes(2)]
const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a)

let nextId = 1
function spawnAt(taken: Bottle[]): Bottle | null {
  const free = SPOTS.filter(([x, z]) => !taken.some((b) => b.x === x && b.z === z))
  if (!free.length) return null
  const [x, z] = free[Math.floor(Math.random() * free.length)]
  return { id: nextId++, x, z, kind: Math.floor(Math.random() * 3) }
}

/** Deposit bottles on the German street (M8). Walk over one to pick it up. */
export function PfandBottles() {
  const bottles = usePfand((s) => s.bottles)
  const respawns = useRef<number[]>([])
  const shapes = useMemo(() => SHAPES, [])

  useEffect(() => {
    const list: Bottle[] = []
    for (let i = 0; i < CONFIG.pfand.onStreet; i++) {
      const b = spawnAt(list)
      if (b) list.push(b)
    }
    usePfand.getState().setBottles(list)
    respawns.current = []
    return () => usePfand.getState().setBottles([])
  }, [])

  useFrame((_, dt) => {
    const { bottles: current, setBottles } = usePfand.getState()
    const p = playerState.position
    const r = CONFIG.pfand.pickupRadius
    const picked = current.find((b) => Math.hypot(b.x - p.x, b.z - p.z) < r)
    if (picked) {
      setBottles(current.filter((b) => b.id !== picked.id))
      respawns.current.push(rand(CONFIG.pfand.respawnSec))
      pickUpBottle()
      return
    }
    if (respawns.current.length) {
      respawns.current = respawns.current.map((t) => t - dt)
      if (respawns.current[0] <= 0) {
        respawns.current.shift()
        const b = spawnAt(current)
        if (b) setBottles([...current, b])
      }
    }
  })

  return (
    <>
      {bottles.map((b) => (
        <group key={b.id} position={[b.x, 0, b.z]} rotation={[0, b.id, b.kind === 2 ? Math.PI / 2 : 0]}>
          <Shapes shapes={shapes[b.kind]} castShadow={false} />
        </group>
      ))}
    </>
  )
}
