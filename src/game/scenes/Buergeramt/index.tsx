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

/** The Bürgeramt (M6): Termin, take a number, wait, fill in the Anmeldung form. */

const W = 10
const D = 7
const STYLE = { wall: '#efe6d2', wallLow: '#e4d8bd', floor: '#d9d2c5', floorAlt: '#cfc7b8', trim: '#ffffff', window: '#d6e6ee' }
const SIGN: SignOptions = {
  title: 'BÜRGERAMT',
  subtitle: 'Bitte Wartenummer ziehen · Vui lòng lấy số',
  background: '#ffffff',
  border: '#4f6fa8',
  color: '#2f3a4d',
  accent: '#d4473b',
  aspect: 4.5,
}
const POSTER: SignOptions = {
  title: 'Formular A-17',
  subtitle: 'in dreifacher Ausfertigung',
  background: '#fffbe6',
  border: '#c9b48a',
  color: '#5b4636',
  accent: '#d4473b',
  aspect: 1.6,
}

function furniture(): ShapeItem[] {
  const s: ShapeItem[] = []
  // Three counters ("Platz 1–3") with desks and computers
  for (const [i, x] of [-2.4, 0.4, 3.2].entries()) {
    s.push({ box: [2.2, 1.0, 0.7], at: [x, 0.5, -2.3], color: '#c9b48a' })
    s.push({ box: [2.3, 0.06, 0.8], at: [x, 1.02, -2.3], color: P.white })
    s.push({ box: [0.5, 0.35, 0.05], at: [x + 0.4, 1.3, -2.55], color: '#2f2f38' })
    s.push({ box: [0.45, 0.3, 0.02], at: [x + 0.4, 1.3, -2.52], color: '#a9d6ff' })
    s.push({ box: [0.5, 0.25, 0.05], at: [x, 2.3, -3.45], color: '#2f3a4d' })
    s.push({ box: [0.12, 0.14, 0.02], at: [x, 2.3, -3.42], color: i === 1 ? '#6fcf97' : '#ff6b5e' })
  }
  // Ticket machine and the red number display
  s.push({ box: [0.6, 1.4, 0.45], at: [-4.2, 0.7, 0.2], color: '#d4473b' })
  s.push({ box: [0.4, 0.3, 0.05], at: [-4.2, 1.15, 0.44], color: '#ffe6a6' })
  s.push({ box: [0.5, 0.2, 0.4], at: [-4.2, 1.5, 0.2], color: '#2f2f38' })
  // "Now serving" display on the left wall
  s.push({ box: [0.08, 0.5, 1.6], at: [-4.94, 2.4, -0.9], color: '#2f2f38' })
  s.push({ box: [0.02, 0.2, 1.1], at: [-4.89, 2.4, -0.9], color: '#ff6b5e' })
  // Waiting chairs
  for (const x of [-1.4, -0.8, -0.2, 0.4, 1.0, 1.6]) {
    s.push({ box: [0.5, 0.06, 0.45], at: [x, 0.45, 0.8], color: '#8a9a7a' })
    s.push({ box: [0.5, 0.45, 0.05], at: [x, 0.7, 1.02], color: '#8a9a7a' })
  }
  s.push({ box: [3.3, 0.06, 0.1], at: [0.1, 0.22, 0.8], color: P.darkSteel })
  // Water dispenser, ficus, filing cabinet
  s.push({ box: [0.4, 1.0, 0.4], at: [4.4, 0.5, 1.2], color: P.white })
  s.push({ cyl: [0.16, 0.16, 0.45, 12], at: [4.4, 1.22, 1.2], color: '#a9d6ff' })
  s.push(place(plantShapes(P.leafDark, '#c49a6c'), [4.5, 0, -0.6], 0, 1.4))
  s.push({ box: [0.6, 1.3, 0.5], at: [-4.5, 0.65, -2.8], color: '#a8a2a0' })
  return s
}

const MACHINE: SpotAction[] = [
  { id: 'number', labelKey: 'action.takeNumber', icon: 'number', action: 'de.takeNumber', primary: true, if: { test: 'de.canTakeNumber' } },
  { id: 'termin', labelKey: 'action.bookTermin', icon: 'passport', action: 'de.buergeramtTermin', if: { noFlag: 'de.anmeldung' } },
]
const EXIT: SpotAction[] = [{ id: 'exit', labelKey: 'action.exit', icon: 'door', action: 'de.leaveBuergeramt', primary: true }]

const Buergeramt = memo(function Buergeramt() {
  const shapes = useMemo(furniture, [])
  return (
    <>
      <Room
        w={W}
        d={D}
        style={STYLE}
        windows={[]}
        furniture={shapes}
        blockers={[[0.4, -2.3, 4.0, 0.45], [-4.2, 0.2, 0.35, 0.3], [0.1, 0.85, 1.9, 0.3], [4.4, 1.2, 0.25, 0.25], [-4.5, -2.8, 0.35, 0.3]]}
      />
      <SignBoard options={SIGN} width={3.6} position={[0.4, 2.65, -3.48]} />
      <SignBoard options={POSTER} width={0.9} position={[-4.98, 1.7, -1.2]} rotation={[0, Math.PI / 2, 0]} />
      <NPC def={NPCS.clerk} at={{ x: 0.4, z: -3.0 }} yaw={0} zone={{ x: 0.4, z: -1.5, halfX: 1.6, halfZ: 0.9 }} />
      <NPC def={NPCS.sophie} at={{ x: -0.8, z: 0.8 }} yaw={Math.PI} seatY={0.48} />
      <ActionSpot id="ticket-machine" nameKey="interact.ticketMachine" zone={{ x: -3.7, z: 0.7, halfX: 1.0, halfZ: 1.0 }} actions={MACHINE} />
      <ActionSpot id="buergeramt-exit" nameKey="interact.exit" zone={{ x: 4.0, z: 2.8, halfX: 1.0, halfZ: 0.8 }} actions={EXIT} />
    </>
  )
})

export default Buergeramt
