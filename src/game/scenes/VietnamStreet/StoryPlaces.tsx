import { useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { NPCS } from '../../../data/npcs'
import { NPC } from '../../components/npc/NPC'
import { PALETTE as P } from '../shared/palette'
import { motorbikeShapes, place, stoolShapes } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/** Where the story happens on the Vietnamese street (chapters 1–2). */

const STOOL = 0.33

export const CLASS = {
  board: { x: -3.18, z: -9.0 },
  teacher: { x: -2.55, z: -9.0 },
  stools: [
    { x: -1.25, z: -8.35 },
    { x: -1.25, z: -9.0 },
    { x: -1.25, z: -9.65 },
  ],
  zone: { x: -1.8, z: -9.0, halfX: 1.6, halfZ: 1.7 },
}

const MAI = { at: { x: 7.8, z: -1.88 }, yaw: -2.06, zone: { x: 7.6, z: -1.5, halfX: 1.3, halfZ: 1.2 } }
const XE_OM = { bike: { x: 9.3, z: 1.3 }, rider: { x: 9.3, z: 1.52 }, zone: { x: 9.0, z: 1.0, halfX: 1.3, halfZ: 1.3 } }
const STALL = { seller: { x: 2.4, z: 11.6 }, zone: { x: 2.9, z: 11.5, halfX: 1.7, halfZ: 1.3 } }
const BARBER = { chair: { x: -11.8, z: 11.7 }, barber: { x: -12.5, z: 11.3 }, zone: { x: -11.9, z: 11.3, halfX: 1.4, halfZ: 1.2 } }

const CLASS_SIGN: SignOptions = {
  title: 'LỚP TIẾNG ĐỨC',
  subtitle: 'Deutschkurs · A1 · A2 · B1',
  background: '#2f8c7f',
  border: '#f4c04e',
  color: '#ffffff',
  accent: '#ffe6a6',
  aspect: 4,
}
const BOARD: SignOptions = {
  title: 'der · die · das',
  subtitle: 'Guten Tag! Ich heiße …',
  background: '#3f5a4f',
  border: '#b98a64',
  color: '#ffffff',
  accent: '#ffe08a',
  aspect: 1.7,
}

function placesShapes(): ShapeItem[] {
  const s: ShapeItem[] = []
  // German class: stools for students
  CLASS.stools.forEach((p, i) => s.push(place(stoolShapes(i === 1 ? P.mint : P.sky2), [p.x, 0, p.z])))
  s.push({ box: [0.08, 1.2, 0.08], at: [CLASS.board.x + 0.1, 0.6, CLASS.board.z - 0.95], color: P.woodDark })
  s.push({ box: [0.08, 1.2, 0.08], at: [CLASS.board.x + 0.1, 0.6, CLASS.board.z + 0.95], color: P.woodDark })

  // Xe ôm parked at the corner
  s.push(place(motorbikeShapes('#8fbf6a'), [XE_OM.bike.x, 0, XE_OM.bike.z], Math.PI))

  // Clothes stall: a rack of shirts, a table of folded clothes, a parasol
  const rx = 3.0
  const rz = 12.9
  s.push({ box: [0.06, 1.7, 0.06], at: [rx - 1.1, 0.85, rz], color: P.darkSteel })
  s.push({ box: [0.06, 1.7, 0.06], at: [rx + 1.1, 0.85, rz], color: P.darkSteel })
  s.push({ box: [2.3, 0.05, 0.05], at: [rx, 1.68, rz], color: P.darkSteel })
  const shirts = ['#ffb3c7', '#d4473b', '#8fd3c1', '#ffe08a', '#7fb8e8', '#cdb8f0', '#ffffff']
  shirts.forEach((c, i) => {
    const x = rx - 0.95 + i * 0.32
    s.push({ box: [0.28, 0.42, 0.06], at: [x, 1.38, rz], color: c })
    s.push({ box: [0.4, 0.1, 0.06], at: [x, 1.55, rz], color: c })
  })
  s.push({ box: [1.4, 0.05, 0.7], at: [rx + 0.4, 0.62, rz - 0.9], color: P.woodDark })
  s.push({ box: [1.3, 0.6, 0.6], at: [rx + 0.4, 0.3, rz - 0.9], color: '#c4a074' })
  for (let i = 0; i < 4; i++) {
    s.push({ box: [0.28, 0.07, 0.24], at: [rx - 0.05 + i * 0.3, 0.68 + (i % 2) * 0.07, rz - 0.9], color: shirts[(i + 2) % shirts.length] })
  }
  s.push(place(stoolShapes(P.coral), [STALL.seller.x, 0, STALL.seller.z]))
  s.push({ cyl: [0.03, 0.03, 2.2, 6], at: [rx + 1.6, 1.1, rz - 0.6], color: P.white })
  s.push({ cyl: [0.05, 1.25, 0.38, 14], at: [rx + 1.6, 2.15, rz - 0.6], color: P.sky2 })

  // Sidewalk barber: chair facing a mirror hung on the tree
  const c = BARBER.chair
  s.push({ box: [0.55, 0.08, 0.55], at: [c.x, 0.5, c.z], color: '#d4473b' })
  s.push({ box: [0.55, 0.6, 0.08], at: [c.x, 0.82, c.z + 0.26], color: '#d4473b' })
  s.push({ cyl: [0.06, 0.18, 0.46, 8], at: [c.x, 0.23, c.z], color: P.steel })
  s.push({ box: [0.7, 0.9, 0.05], at: [-11.0, 1.45, 10.62], color: '#b98a64' })
  s.push({ box: [0.6, 0.8, 0.06], at: [-11.0, 1.45, 10.63], color: '#dff0f8' })
  s.push({ box: [0.5, 0.35, 0.4], at: [-12.6, 0.18, 12.2], color: P.white })
  return s
}

export function StoryPlaces() {
  const shapes = useMemo(placesShapes, [])
  return (
    <>
      <Shapes shapes={shapes} />
      <SignBoard options={BOARD} width={2.0} position={[CLASS.board.x, 1.55, CLASS.board.z]} rotation={[0, Math.PI / 2, 0]} />
      <SignBoard options={CLASS_SIGN} width={2.4} position={[-3.22, 2.55, CLASS.board.z]} rotation={[0, Math.PI / 2, 0]} />

      <NPC def={NPCS.thayMinh} at={CLASS.teacher} yaw={Math.PI / 2} zone={CLASS.zone} />
      <NPC def={NPCS.vy} at={CLASS.stools[2]} yaw={-Math.PI / 2} seatY={STOOL} />
      <NPC def={NPCS.chiMai} at={MAI.at} yaw={MAI.yaw} seatY={STOOL} activity="sip" zone={MAI.zone} />
      <NPC def={NPCS.anhTu} at={XE_OM.rider} yaw={Math.PI} seatY={0.86} arms={1} zone={XE_OM.zone} />
      <NPC def={NPCS.chiHang} at={STALL.seller} yaw={Math.PI} seatY={STOOL} activity="fan" zone={STALL.zone} />
      <NPC def={NPCS.chuSau} at={BARBER.barber} yaw={0.7} zone={BARBER.zone} />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.3, 0.6, 0.85]} position={[XE_OM.bike.x, 0.6, XE_OM.bike.z]} />
        <CuboidCollider args={[1.2, 0.9, 0.2]} position={[3.0, 0.9, 12.9]} />
        <CuboidCollider args={[0.7, 0.4, 0.38]} position={[3.4, 0.4, 12.0]} />
        <CylinderCollider args={[0.5, 0.35]} position={[BARBER.chair.x, 0.5, BARBER.chair.z]} />
        <CuboidCollider args={[0.1, 0.6, 1.1]} position={[CLASS.board.x + 0.1, 0.6, CLASS.board.z]} />
        {CLASS.stools.slice(0, 2).map((p, i) => (
          <CylinderCollider key={i} args={[0.18, 0.2]} position={[p.x, 0.18, p.z]} />
        ))}
      </RigidBody>
    </>
  )
}
