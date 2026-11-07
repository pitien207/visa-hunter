import { memo, useMemo } from 'react'
import { NPCS } from '../../../data/npcs'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { NPC } from '../../components/npc/NPC'
import { BENCH_OFFSET, CLASSROOM } from '../interiors'
import { WallClock, WallFan } from '../shared/Decor'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes } from '../shared/props'
import { Room } from '../shared/Room'
import type { ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/**
 * Thầy Minh's German class at the Trung tâm Đức ngữ: a Hà Nội classroom with a raised
 * teacher's platform (bục giảng), a chalkboard, the "Học, học nữa, học mãi" banner,
 * wooden two-seat desks, a wall fan and a clock that follows the game time.
 */

const { w: W, d: D, h: H } = CLASSROOM
const BACK = -D / 2
const STYLE = { wall: '#f6e7c4', wallLow: '#ecd6a6', floor: '#e3c9a1', floorAlt: '#d8bb8f', trim: '#fff6e3', window: '#cfe8f6' }

const BOARD: SignOptions = {
  title: 'Lektion: Im Café ☕',
  subtitle: 'der Kaffee · die Milch · das Wasser',
  background: '#2f5243',
  border: '#2f5243',
  color: '#f4f1e6',
  accent: '#ffe08a',
  aspect: 2.8,
}
const BANNER: SignOptions = {
  title: 'HỌC, HỌC NỮA, HỌC MÃI',
  background: '#c8322b',
  border: '#f4c04e',
  color: '#ffe08a',
  accent: '#ffe08a',
  aspect: 9,
}
const ARTICLES: SignOptions = {
  title: 'der · die · das',
  subtitle: 'xanh · đỏ · xanh lá',
  background: '#fffaf2',
  border: '#4f86d9',
  color: '#2f3a4d',
  accent: '#c8322b',
  aspect: 1.5,
}
const DOOR_SIGN: SignOptions = {
  title: 'LỐI RA',
  subtitle: 'Ausgang',
  background: '#3f7d5c',
  border: '#ffffff',
  color: '#ffffff',
  accent: '#ffe08a',
  aspect: 2.4,
}

const BOOKS = ['#c8322b', '#4f86d9', '#3f7d5c', '#f4c04e', '#cdb8f0']

function deskShapes(x: number, z: number, i: number): ShapeItem[] {
  const s: ShapeItem[] = []
  const wood = '#c79a68'
  const dark = '#8e6844'
  // Desk: top, front modesty panel, side legs
  s.push({ box: [1.8, 0.05, 0.5], at: [x, 0.74, z], color: wood })
  s.push({ box: [1.8, 0.42, 0.04], at: [x, 0.5, z - 0.24], color: dark })
  for (const side of [-1, 1]) s.push({ box: [0.05, 0.72, 0.46], at: [x + side * 0.86, 0.36, z], color: dark })
  // Bench behind it
  const bz = z + BENCH_OFFSET
  s.push({ box: [1.8, 0.05, 0.3], at: [x, 0.42, bz], color: wood })
  for (const side of [-1, 1]) s.push({ box: [0.05, 0.4, 0.26], at: [x + side * 0.82, 0.2, bz], color: dark })
  // Notebooks and a pencil case
  s.push({ box: [0.32, 0.015, 0.24], at: [x - 0.45, 0.775, z + 0.02], rot: [0, 0.1, 0], color: '#ffffff' })
  s.push({ box: [0.34, 0.03, 0.25], at: [x + 0.48, 0.78, z - 0.05], rot: [0, -0.15, 0], color: BOOKS[i % BOOKS.length] })
  s.push({ box: [0.18, 0.04, 0.06], at: [x + 0.1, 0.79, z - 0.12], color: BOOKS[(i + 2) % BOOKS.length] })
  return s
}

function furniture(): ShapeItem[] {
  const s: ShapeItem[] = []
  // Raised teacher's platform and the chalkboard with its tray
  s.push({ box: [6.4, 0.1, 1.3], at: [0, 0.05, BACK + 0.65], color: '#b98a64' })
  s.push({ box: [4.3, 1.62, 0.06], at: [0, 1.72, BACK + 0.03], color: '#8e6844' })
  s.push({ box: [4.1, 0.05, 0.12], at: [0, 0.9, BACK + 0.08], color: '#8e6844' })
  for (let i = 0; i < 4; i++) s.push({ box: [0.07, 0.025, 0.025], at: [-1.2 + i * 0.25, 0.94, BACK + 0.09], color: i % 2 ? '#ffffff' : '#ffe08a' })

  // Teacher's desk: books, a vase of flowers, the attendance book
  const tx = -3.3
  const tz = BACK + 1.05
  s.push({ box: [1.4, 0.05, 0.62], at: [tx, 0.82, tz], color: '#a8754f' })
  s.push({ box: [1.4, 0.72, 0.05], at: [tx, 0.46, tz + 0.29], color: '#8e6844' })
  for (const side of [-1, 1]) s.push({ box: [0.05, 0.72, 0.58], at: [tx + side * 0.67, 0.46, tz], color: '#8e6844' })
  s.push({ box: [0.36, 0.06, 0.26], at: [tx - 0.3, 0.88, tz], color: '#c8322b' })
  s.push({ box: [0.34, 0.05, 0.24], at: [tx - 0.3, 0.94, tz], color: '#4f86d9' })
  s.push({ cyl: [0.06, 0.08, 0.2, 10], at: [tx + 0.4, 0.95, tz - 0.05], color: '#a9d6ff' })
  for (let i = 0; i < 5; i++) s.push({ sphere: [0.05, 6, 4], at: [tx + 0.4 + Math.cos(i * 1.26) * 0.06, 1.1 + (i % 2) * 0.04, tz - 0.05 + Math.sin(i * 1.26) * 0.06], color: i % 2 ? '#ffffff' : '#ffe08a' })

  CLASSROOM.desks.forEach((d, i) => s.push(...deskShapes(d.x, d.z, i)))

  // German flag poster and a map-ish poster on the back wall
  const fx = -3.55
  s.push({ box: [1.06, 0.7, 0.03], at: [fx, 1.85, BACK + 0.02], color: '#ffffff' })
  ;['#2f2f38', '#c8322b', '#f4c04e'].forEach((c, i) => s.push({ box: [1.0, 0.21, 0.035], at: [fx, 2.08 - i * 0.22, BACK + 0.03], color: c }))

  // Left wall: a window with green Hà Nội shutters
  const wz = BACK + 1.8
  s.push({ box: [0.08, 1.3, 1.4], at: [-W / 2 + 0.02, 1.75, wz], color: STYLE.trim })
  s.push({ box: [0.09, 1.1, 1.2], at: [-W / 2 + 0.03, 1.75, wz], color: '#cfe8f6' })
  for (const side of [-1, 1]) {
    s.push({ box: [0.06, 1.15, 0.5], at: [-W / 2 + 0.06, 1.75, wz + side * 0.95], color: '#3f7d5c' })
    for (let l = 0; l < 5; l++) s.push({ box: [0.07, 0.025, 0.42], at: [-W / 2 + 0.08, 1.35 + l * 0.2, wz + side * 0.95], color: '#2c5c43' })
  }

  // Bookshelf and a plant at the front corners
  s.push({ box: [0.4, 1.4, 1.1], at: [W / 2 - 0.3, 0.7, BACK + 2.2], color: '#a8754f' })
  for (let r = 0; r < 3; r++) {
    for (let b = 0; b < 6; b++) s.push({ box: [0.28, 0.32, 0.12], at: [W / 2 - 0.36, 0.25 + r * 0.45, BACK + 1.77 + b * 0.17], color: BOOKS[(r + b) % BOOKS.length] })
  }
  s.push(place(plantShapes(P.leafDark, '#c49a6c'), [-W / 2 + 0.5, 0, 2.8], 0, 1.2))
  // Doormat by the way out
  s.push({ box: [1.1, 0.02, 0.6], at: [CLASSROOM.exit.x, 0.03, CLASSROOM.exit.z], color: '#c8322b' })
  return s
}

const EXIT: SpotAction[] = [{ id: 'exit', labelKey: 'action.toStreet', icon: 'door', action: 'school.leave', primary: true }]

const Classroom = memo(function Classroom() {
  const shapes = useMemo(furniture, [])
  const seat = (deskIndex: number, side: -1 | 1) => {
    const d = CLASSROOM.desks[deskIndex]
    return { x: d.x + side * 0.45, z: d.z + BENCH_OFFSET }
  }
  const blockers = useMemo<[number, number, number, number][]>(
    () => [
      ...CLASSROOM.desks.map((d) => [d.x, d.z, 0.92, 0.26] as [number, number, number, number]),
      [-3.3, BACK + 1.05, 0.72, 0.33],
      [W / 2 - 0.3, BACK + 2.2, 0.25, 0.6],
    ],
    [],
  )
  return (
    <>
      <Room w={W} d={D} h={H} style={STYLE} furniture={shapes} blockers={blockers} />
      <SignBoard options={BOARD} width={3.9} position={[0, 1.74, BACK + 0.07]} />
      <SignBoard options={BANNER} width={4.6} position={[0, 2.86, BACK + 0.02]} />
      <SignBoard options={ARTICLES} width={1.05} position={[3.55, 1.8, BACK + 0.02]} />
      <SignBoard options={DOOR_SIGN} width={0.8} position={[W / 2 - 0.02, 1.0, 2.6]} rotation={[0, -Math.PI / 2, 0]} />
      <WallClock position={[3.55, 2.72, BACK + 0.04]} radius={0.28} />
      <WallFan position={[W / 2 - 0.05, 2.35, BACK + 1.0]} rotation={[0, -Math.PI / 2, 0]} />

      <NPC def={NPCS.thayMinh} at={CLASSROOM.teacher} yaw={0} zone={{ x: CLASSROOM.teacher.x, z: CLASSROOM.teacher.z + 0.9, halfX: 1.7, halfZ: 0.9 }} />
      <NPC def={NPCS.hvLinh} at={seat(0, -1)} yaw={Math.PI} seatY={0.42} />
      <NPC def={NPCS.vy} at={seat(2, 1)} yaw={Math.PI} seatY={0.42} />
      <NPC def={NPCS.hvQuang} at={seat(3, 1)} yaw={Math.PI} seatY={0.42} />
      <NPC def={NPCS.hvThao} at={seat(4, -1)} yaw={Math.PI} seatY={0.42} />
      <NPC def={NPCS.hvNam} at={seat(6, 1)} yaw={Math.PI} seatY={0.42} />

      <ActionSpot id="class-exit" nameKey="interact.exit" zone={{ x: CLASSROOM.exit.x, z: CLASSROOM.exit.z, halfX: 0.9, halfZ: 0.7 }} actions={EXIT} />
    </>
  )
})

export default Classroom
