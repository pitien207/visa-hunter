import { memo, useMemo } from 'react'
import { NPCS } from '../../../data/npcs'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { NPC } from '../../components/npc/NPC'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes } from '../shared/props'
import { Room } from '../shared/Room'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/** Departure hall (end of chapter 2): say goodbye to the family, then board. */

const W = 12
const D = 8
const STYLE = { wall: '#f2f6fa', wallLow: '#e1e8f0', floor: '#e8eef4', floorAlt: '#dbe4ee', trim: '#ffffff', window: '#bfe3ff' }
const BOARD: SignOptions = {
  title: 'FRANKFURT  ✈  08:45',
  subtitle: 'Gate 7 · Đang lên máy bay · Boarding',
  background: '#2f2f38',
  border: '#4a4a55',
  color: '#ffd166',
  accent: '#a8e6cf',
  aspect: 4.5,
}

function hall(): ShapeItem[] {
  const s: ShapeItem[] = []
  // Check-in counter with a luggage belt
  s.push({ box: [3.2, 1.0, 0.8], at: [-3.6, 0.5, -2.6], color: '#a9c8e8' })
  s.push({ box: [3.3, 0.06, 0.9], at: [-3.6, 1.03, -2.6], color: P.white })
  s.push({ box: [1.0, 0.3, 0.7], at: [-1.6, 0.15, -2.6], color: P.darkSteel })
  s.push({ box: [0.5, 0.4, 0.3], at: [-1.6, 0.5, -2.6], color: '#ff9b8f' })
  // Gate area: sign pillar + seats
  s.push({ box: [0.3, 2.4, 0.3], at: [4.6, 1.2, -2.8], color: '#f4c04e' })
  s.push({ box: [0.9, 0.5, 0.1], at: [4.6, 2.2, -2.62], color: '#2f2f38' })
  for (const x of [2.4, 3.0, 3.6]) {
    s.push({ box: [0.5, 0.06, 0.5], at: [x, 0.45, -0.5], color: '#7fb8e8' })
    s.push({ box: [0.5, 0.5, 0.06], at: [x, 0.72, -0.75], color: '#7fb8e8' })
  }
  // Family luggage
  s.push({ box: [0.5, 0.7, 0.3], at: [0.6, 0.35, 0.4], color: '#d4473b' })
  s.push({ cyl: [0.02, 0.02, 0.4, 4], at: [0.6, 0.9, 0.4], color: P.darkSteel })
  s.push({ box: [0.6, 0.35, 0.45], at: [1.2, 0.18, 0.5], color: '#f4c04e' })
  s.push(place(plantShapes(P.leafDark, P.white), [-5.4, 0, 2.8], 0, 1.3))
  s.push(place(plantShapes(P.leaf, P.white), [5.4, 0, 2.8], 0, 1.3))
  return s
}

/** A plane waiting outside the windows. */
const PLANE: ShapeItem[] = [
  { cyl: [0.9, 0.9, 9, 16], at: [0, 2.4, -7.5], rot: [0, 0, Math.PI / 2], color: P.white },
  { sphere: [0.9, 16, 10], at: [4.5, 2.4, -7.5], scale: [1.4, 1, 1], color: P.white },
  { box: [2.6, 0.12, 9], at: [0, 2.0, -7.5], color: '#e1e8f0' },
  { box: [1.6, 2.0, 0.12], at: [-4.2, 3.6, -7.5], color: '#d4473b' },
  { box: [9, 0.3, 1.82], at: [0, 2.6, -7.5], color: '#a9d6ff' },
]

const GATE: SpotAction[] = [{ id: 'board', labelKey: 'action.board', icon: 'passport', action: 'flight.depart', primary: true, if: { flag: 'visa.flight' } }]
const EXIT: SpotAction[] = [{ id: 'exit', labelKey: 'action.exitHome', icon: 'door', action: 'xeOm.home', primary: true }]

const Airport = memo(function Airport() {
  const shapes = useMemo(hall, [])
  return (
    <>
      <Room w={W} d={D} style={STYLE} windows={[-3.5, 0, 3.5]} furniture={shapes} blockers={[[-3.6, -2.6, 1.7, 0.45], [4.6, -2.8, 0.2, 0.2]]} />
      <Shapes shapes={PLANE} castShadow={false} />
      <SignBoard options={BOARD} width={4} position={[0, 2.75, -3.98]} />
      <NPC def={NPCS.me} at={{ x: -1.0, z: -0.4 }} yaw={0.1} zone={{ x: -0.6, z: 0.4, halfX: 1.8, halfZ: 1.4 }} />
      <NPC def={NPCS.bo} at={{ x: -2.1, z: -0.6 }} yaw={0.3} />
      <NPC def={NPCS.emGai} at={{ x: 0.0, z: -0.2 }} yaw={-0.2} scale={0.8} />
      <ActionSpot
        id="gate"
        nameKey="interact.gate"
        zone={{ x: 4.3, z: -1.7, halfX: 1.4, halfZ: 1.3 }}
        actions={GATE}
        marker={{ at: [4.6, 2.9, -2.5], when: { flag: 'visa.flight' } }}
      />
      <ActionSpot id="airport-exit" nameKey="interact.exit" zone={{ x: -5.0, z: 3.2, halfX: 1.0, halfZ: 0.8 }} actions={EXIT} />
    </>
  )
})

export default Airport
