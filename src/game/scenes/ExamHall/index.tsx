import { memo, useMemo } from 'react'
import { NPCS } from '../../../data/npcs'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { NPC } from '../../components/npc/NPC'
import { EXAM_HALL } from '../interiors'
import { WallClock } from '../shared/Decor'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes } from '../shared/props'
import { Room } from '../shared/Room'
import type { ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/**
 * The exam room: single numbered desks in neat rows, a big clock, a supervisor at the
 * front and the other candidates already bent over their papers.
 */

const { w: W, d: D, h: H } = EXAM_HALL
const BACK = -D / 2
const STYLE = { wall: '#eef1f4', wallLow: '#dfe5ea', floor: '#e4e1d8', floorAlt: '#d9d5ca', trim: '#ffffff', window: '#d6e6ee' }

const BANNER: SignOptions = {
  title: 'KỲ THI TIẾNG ĐỨC',
  subtitle: 'Deutschprüfung · A1 · A2 · B1',
  background: '#2f3a4d',
  border: '#f4c04e',
  color: '#ffffff',
  accent: '#ffe08a',
  aspect: 5,
}
const QUIET: SignOptions = {
  title: 'Bitte Ruhe!',
  subtitle: 'Giữ trật tự · Tắt điện thoại',
  background: '#fffaf2',
  border: '#c8322b',
  color: '#c8322b',
  accent: '#2f3a4d',
  aspect: 1.9,
}

function furniture(): ShapeItem[] {
  const s: ShapeItem[] = []
  EXAM_HALL.desks.forEach((d, i) => {
    // Single desk with an exam paper and a numbered card
    s.push({ box: [0.9, 0.05, 0.55], at: [d.x, 0.74, d.z], color: '#c9ad85' })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.push({ box: [0.04, 0.72, 0.04], at: [d.x + sx * 0.4, 0.36, d.z + sz * 0.23], color: P.darkSteel })
    s.push({ box: [0.3, 0.012, 0.4], at: [d.x - 0.1, 0.772, d.z + 0.02], color: '#ffffff' })
    s.push({ box: [0.2, 0.1, 0.02], at: [d.x + 0.28, 0.82, d.z - 0.22], color: i === 4 ? '#ffe08a' : '#fffaf2' })
    s.push({ box: [0.012, 0.012, 0.16], at: [d.x + 0.12, 0.78, d.z + 0.05], rot: [0, 0.4, 0], color: '#4f86d9' })
    // Chair
    const cz = d.z + 0.5
    s.push({ box: [0.44, 0.05, 0.42], at: [d.x, 0.44, cz], color: '#7fa8c9' })
    s.push({ box: [0.44, 0.45, 0.05], at: [d.x, 0.7, cz + 0.2], color: '#7fa8c9' })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.push({ box: [0.035, 0.43, 0.035], at: [d.x + sx * 0.19, 0.21, cz + sz * 0.18], color: P.darkSteel })
  })
  // Supervisor's desk with stacks of papers and envelopes
  const px = EXAM_HALL.proctor.x
  const pz = BACK + 1.2
  s.push({ box: [1.5, 0.05, 0.65], at: [px, 0.78, pz], color: '#a8754f' })
  s.push({ box: [1.5, 0.72, 0.05], at: [px, 0.42, pz + 0.3], color: '#8e6844' })
  for (let i = 0; i < 4; i++) s.push({ box: [0.3, 0.05, 0.4], at: [px - 0.45, 0.83 + i * 0.05, pz], rot: [0, i * 0.08, 0], color: '#ffffff' })
  s.push({ box: [0.34, 0.06, 0.24], at: [px + 0.3, 0.84, pz], color: '#d8b98a' })
  s.push({ box: [0.34, 0.06, 0.24], at: [px + 0.3, 0.9, pz], color: '#c8322b' })
  s.push(place(plantShapes(P.leafDark, '#c49a6c'), [W / 2 - 0.5, 0, BACK + 0.6], 0, 1.2))
  s.push({ box: [1.1, 0.02, 0.6], at: [EXAM_HALL.exit.x, 0.03, EXAM_HALL.exit.z], color: '#2f3a4d' })
  return s
}

const EXIT: SpotAction[] = [{ id: 'exit', labelKey: 'action.backToClass', icon: 'door', action: 'school.fromExam', primary: true }]

const ExamHall = memo(function ExamHall() {
  const shapes = useMemo(furniture, [])
  const blockers = useMemo<[number, number, number, number][]>(
    () => [...EXAM_HALL.desks.map((d) => [d.x, d.z, 0.47, 0.3] as [number, number, number, number]), [EXAM_HALL.proctor.x, BACK + 1.2, 0.78, 0.36]],
    [],
  )
  const seat = (i: number) => ({ x: EXAM_HALL.desks[i].x, z: EXAM_HALL.desks[i].z + 0.5 })
  return (
    <>
      <Room w={W} d={D} h={H} style={STYLE} windows={[-4.3, 4.3]} furniture={shapes} blockers={blockers} />
      <SignBoard options={BANNER} width={4.2} position={[0, 1.8, BACK + 0.02]} />
      <SignBoard options={QUIET} width={1.1} position={[2.9, 2.55, BACK + 0.02]} />
      <WallClock position={[0, 2.62, BACK + 0.04]} radius={0.38} />

      <NPC def={NPCS.giamThi} at={{ x: EXAM_HALL.proctor.x + 0.2, z: BACK + 0.65 }} yaw={0} />
      <NPC def={NPCS.hvLinh} at={seat(0)} yaw={Math.PI} seatY={0.44} />
      <NPC def={NPCS.hvQuang} at={seat(2)} yaw={Math.PI} seatY={0.44} />
      <NPC def={NPCS.hvThao} at={seat(3)} yaw={Math.PI} seatY={0.44} />
      <NPC def={NPCS.vy} at={seat(7)} yaw={Math.PI} seatY={0.44} />
      <NPC def={NPCS.hvNam} at={seat(8)} yaw={Math.PI} seatY={0.44} />

      <ActionSpot id="exam-exit" nameKey="interact.exit" zone={{ x: EXAM_HALL.exit.x, z: EXAM_HALL.exit.z, halfX: 0.9, halfZ: 0.7 }} actions={EXIT} />
    </>
  )
})

export default ExamHall
