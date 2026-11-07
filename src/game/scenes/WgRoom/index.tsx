import { memo, useMemo } from 'react'
import { NPCS } from '../../../data/npcs'
import { useFlags } from '../../../store/flagsStore'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { NPC } from '../../components/npc/NPC'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes } from '../shared/props'
import { Room } from '../shared/Room'
import type { ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/** The WG (M6): your room (bed, laptop) and the shared kitchen with Lena and Jonas. */

const W = 9
const D = 7
const STYLE = { wall: '#fdf0e0', wallLow: '#f3dcc0', floor: '#d9b48f', floorAlt: '#cfa983', trim: '#ffffff', window: '#cfe8f6' }
const PUTZPLAN: SignOptions = {
  title: 'PUTZPLAN',
  subtitle: 'Mo: Lena · Mi: Jonas · Fr: DU!',
  background: '#ffffff',
  border: '#7fb8e8',
  color: '#2f3a4d',
  accent: '#d4473b',
  aspect: 1.5,
}

function furniture(): ShapeItem[] {
  const s: ShapeItem[] = []
  // Bedroom (left): bed, desk + laptop, wardrobe, rug
  s.push({ box: [1.1, 0.35, 2.0], at: [-3.6, 0.18, -2.3], color: P.woodDark })
  s.push({ box: [1.05, 0.15, 1.95], at: [-3.6, 0.43, -2.3], color: P.white })
  s.push({ box: [1.06, 0.12, 1.2], at: [-3.6, 0.52, -1.95], color: '#a9d6ff' })
  s.push({ box: [0.6, 0.14, 0.35], at: [-3.6, 0.57, -3.05], color: '#fff6e3' })
  s.push({ box: [1.4, 0.06, 0.6], at: [-1.6, 0.76, -3.15], color: P.wood })
  for (const dx of [-0.6, 0.6]) s.push({ box: [0.06, 0.75, 0.55], at: [-1.6 + dx, 0.38, -3.15], color: P.woodDark })
  s.push({ box: [0.5, 0.03, 0.35], at: [-1.6, 0.8, -3.15], color: '#4a4a55' })
  s.push({ box: [0.5, 0.32, 0.03], at: [-1.6, 0.97, -3.32], rot: [-0.2, 0, 0], color: '#a9d6ff' })
  s.push({ box: [1.0, 2.0, 0.55], at: [-4.0, 1.0, 0.2], color: '#f3dcc0' })
  s.push({ box: [0.03, 1.9, 0.02], at: [-4.0, 1.0, 0.48], color: P.woodDark })
  s.push({ cyl: [0.9, 0.9, 0.02, 20], at: [-2.6, 0.03, -1.2], color: '#ffb3c7' })
  // Kitchen (right): counter, stove, fridge, table + chairs
  s.push({ box: [2.6, 0.95, 0.65], at: [2.9, 0.48, -3.1], color: '#f6f6f2' })
  s.push({ box: [2.7, 0.05, 0.7], at: [2.9, 0.97, -3.1], color: '#8a9a7a' })
  s.push({ box: [0.6, 0.04, 0.5], at: [2.4, 1.0, -3.1], color: '#2f2f38' })
  s.push({ cyl: [0.18, 0.15, 0.2, 12], at: [2.4, 1.12, -3.1], color: '#d4473b' })
  s.push({ box: [0.7, 1.9, 0.65], at: [4.2, 0.95, -2.2], color: '#e9eef5' })
  s.push({ box: [1.4, 0.06, 0.9], at: [2.4, 0.76, -0.2], color: P.wood })
  s.push({ cyl: [0.05, 0.05, 0.74, 6], at: [2.4, 0.38, -0.2], color: P.woodDark })
  s.push({ cyl: [0.12, 0.1, 0.12, 10], at: [2.6, 0.85, -0.1], color: '#7fb8e8' })
  s.push({ box: [0.4, 0.06, 0.3], at: [2.1, 0.8, -0.3], color: '#f2b45c' })
  s.push(place(plantShapes(P.leafDark, '#c49a6c'), [-0.4, 0, -3.1], 0, 1.1))
  return s
}

const ROOM_ACTIONS: SpotAction[] = [
  { id: 'insurance', labelKey: 'action.insurance', icon: 'laptop', action: 'de.insurance', primary: true, if: { all: [{ flag: 'de.wg' }, { noFlag: 'de.insurance' }] } },
  { id: 'callHome', labelKey: 'action.callHome', icon: 'talk', action: 'de.callHome', if: { flag: 'de.wg' } },
  { id: 'study', labelKey: 'action.selfStudy', icon: 'book', action: 'german.selfStudy', if: { flag: 'de.wg' } },
]
const BED: SpotAction[] = [{ id: 'sleep', labelKey: 'action.sleep', icon: 'sleep', action: 'de.sleep', primary: true, if: { flag: 'de.wg' } }]
const EXIT: SpotAction[] = [{ id: 'exit', labelKey: 'action.exit', icon: 'door', action: 'de.leaveWg', primary: true }]

const WgRoom = memo(function WgRoom() {
  const shapes = useMemo(furniture, [])
  const isHome = useFlags((s) => !!s.flags['de.wg'])
  return (
    <>
      <Room
        w={W}
        d={D}
        style={STYLE}
        windows={[-2.6, 1.0]}
        furniture={shapes}
        blockers={[[-3.6, -2.3, 0.6, 1.0], [-1.6, -3.15, 0.75, 0.3], [-4.0, 0.2, 0.5, 0.3], [2.9, -3.1, 1.3, 0.35], [4.2, -2.2, 0.35, 0.35], [2.4, -0.2, 0.7, 0.45]]}
      />
      <SignBoard options={PUTZPLAN} width={0.8} position={[1.2, 1.65, -3.48]} />
      <NPC def={NPCS.lena} at={{ x: 1.4, z: 0.1 }} yaw={1.2} seatY={0.48} zone={{ x: 1.4, z: 0.6, halfX: 1.3, halfZ: 1.2 }} />
      <NPC def={NPCS.jonas} at={{ x: 3.2, z: -2.5 }} yaw={-0.6} zone={{ x: 3.2, z: -1.6, halfX: 1.0, halfZ: 0.8 }} />
      {isHome && (
        <>
          <ActionSpot id="wg-laptop" nameKey="interact.laptop" zone={{ x: -1.6, z: -2.4, halfX: 0.9, halfZ: 0.8 }} actions={ROOM_ACTIONS} />
          <ActionSpot id="wg-bed" nameKey="interact.bed" zone={{ x: -3.6, z: -0.9, halfX: 0.9, halfZ: 0.6 }} actions={BED} />
        </>
      )}
      <ActionSpot id="wg-exit" nameKey="interact.exit" zone={{ x: 0, z: 3.0, halfX: 1.2, halfZ: 0.7 }} actions={EXIT} />
    </>
  )
})

export default WgRoom
