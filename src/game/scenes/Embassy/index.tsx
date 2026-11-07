import { memo, useMemo } from 'react'
import { NPCS } from '../../../data/npcs'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { NPC } from '../../components/npc/NPC'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes } from '../shared/props'
import { Room } from '../shared/Room'
import type { ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/** The German embassy's visa section (M5): wait, then the interview at the counter. */

const W = 10
const D = 7

const STYLE = { wall: '#e9eef5', wallLow: '#d7dfe9', floor: '#f4f1ea', floorAlt: '#e6e1d6', trim: '#ffffff', window: '#cfe8f6' }
const SIGN: SignOptions = {
  title: 'ĐẠI SỨ QUÁN ĐỨC',
  subtitle: 'Visastelle · Phòng thị thực',
  background: '#ffffff',
  border: '#2f3a4d',
  color: '#2f3a4d',
  accent: '#d4473b',
  aspect: 4.5,
}

function chair(x: number, z: number): ShapeItem[] {
  return [
    { box: [0.5, 0.06, 0.5], at: [x, 0.45, z], color: '#5b7cc4' },
    { box: [0.5, 0.5, 0.06], at: [x, 0.72, z + 0.25], color: '#5b7cc4' },
    { box: [0.05, 0.45, 0.05], at: [x - 0.2, 0.22, z - 0.2], color: P.darkSteel },
    { box: [0.05, 0.45, 0.05], at: [x + 0.2, 0.22, z - 0.2], color: P.darkSteel },
    { box: [0.05, 0.45, 0.05], at: [x - 0.2, 0.22, z + 0.2], color: P.darkSteel },
    { box: [0.05, 0.45, 0.05], at: [x + 0.2, 0.22, z + 0.2], color: P.darkSteel },
  ]
}

function furniture(): ShapeItem[] {
  const s: ShapeItem[] = []
  // Counter with glass partitions and three windows
  s.push({ box: [6.4, 1.05, 0.7], at: [0.8, 0.52, -2.3], color: '#c9d3e0' })
  s.push({ box: [6.6, 0.06, 0.85], at: [0.8, 1.07, -2.3], color: P.white })
  s.push({ box: [6.4, 1.15, 0.04], at: [0.8, 1.68, -2.3], color: '#d6eef8' })
  for (const x of [-2.4, -0.3, 1.8, 3.9]) s.push({ box: [0.08, 1.2, 0.1], at: [x, 1.68, -2.3], color: P.white })
  for (const [i, x] of [-1.35, 0.75, 2.85].entries()) {
    s.push({ box: [0.5, 0.3, 0.05], at: [x, 2.45, -2.28], color: '#2f3a4d' })
    s.push({ box: [0.12, 0.16, 0.02], at: [x, 2.45, -2.25], color: i === 1 ? '#ff6b5e' : '#6b7a8f' })
  }
  // Waiting chairs (two rows) and a number display
  for (const z of [0.3, 1.4]) for (const x of [-4.1, -3.5, -2.9, -2.3]) s.push(...chair(x, z))
  s.push({ box: [1.4, 0.55, 0.08], at: [-3.2, 2.35, -3.45], color: '#2f2f38' })
  s.push({ box: [1.1, 0.3, 0.02], at: [-3.2, 2.35, -3.4], color: '#ff6b5e' })
  // Flag on a stand (black-red-gold)
  s.push({ cyl: [0.03, 0.03, 2.3, 6], at: [4.4, 1.15, -2.9], color: P.steel })
  s.push({ box: [0.9, 0.18, 0.02], at: [4.85, 2.05, -2.9], color: '#2f2f38' })
  s.push({ box: [0.9, 0.18, 0.02], at: [4.85, 1.87, -2.9], color: '#d4473b' })
  s.push({ box: [0.9, 0.18, 0.02], at: [4.85, 1.69, -2.9], color: '#f4c04e' })
  // Plants, rope barrier, brochure rack
  s.push(place(plantShapes(P.leafDark, P.white), [-4.5, 0, -3.0], 0, 1.3))
  s.push(place(plantShapes(P.leaf, P.white), [4.5, 0, 2.6], 0, 1.2))
  for (const x of [-1.2, 0.8, 2.8]) s.push({ cyl: [0.04, 0.08, 0.95, 8], at: [x, 0.47, -0.9], color: '#c9a64a' })
  s.push({ cyl: [0.02, 0.02, 4.0, 4], at: [0.8, 0.85, -0.9], rot: [0, 0, Math.PI / 2], color: '#d4473b' })
  s.push({ box: [0.8, 1.3, 0.25], at: [4.2, 0.65, 0.6], color: P.wood })
  for (let i = 0; i < 3; i++) s.push({ box: [0.6, 0.25, 0.04], at: [4.2, 0.45 + i * 0.35, 0.74], color: ['#a9d6ff', '#ffe08a', '#ffb3c7'][i] })
  return s
}

const EXIT: SpotAction[] = [{ id: 'exit', labelKey: 'action.exitHome', icon: 'door', action: 'xeOm.home', primary: true }]

const Embassy = memo(function Embassy() {
  const shapes = useMemo(furniture, [])
  return (
    <>
      <Room w={W} d={D} style={STYLE} windows={[-2.5, 2.5]} furniture={shapes} blockers={[[0.8, -2.3, 3.3, 0.45], [-3.2, 0.85, 1.2, 0.9], [4.2, 0.6, 0.45, 0.2]]} />
      <SignBoard options={SIGN} width={3.4} position={[0.8, 2.75, -3.48]} />
      <NPC def={NPCS.officer} at={{ x: 0.75, z: -3.0 }} yaw={0} zone={{ x: 0.8, z: -1.6, halfX: 2.6, halfZ: 0.9 }} />
      <NPC def={NPCS.chiLan} at={{ x: -2.9, z: 0.3 }} yaw={Math.PI} seatY={0.48} />
      <ActionSpot id="embassy-exit" nameKey="interact.exit" zone={{ x: -4.0, z: 2.6, halfX: 1.0, halfZ: 0.9 }} actions={EXIT} />
    </>
  )
})

export default Embassy
