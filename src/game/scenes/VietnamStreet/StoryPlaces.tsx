import { useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { NPCS } from '../../../data/npcs'
import { NPC } from '../../components/npc/NPC'
import { PALETTE as P } from '../shared/palette'
import { bicycleShapes, cycloShapes, flowerBikeShapes, motorbikeShapes, place, plantShapes, stoolShapes } from '../shared/props'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { PROP_GROUPS } from '../../systems/collisionGroups'
import { BUILDING_BACK_Z, HOME } from './layout'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/** Where the story happens on the Hà Nội street (chapters 1–2). */

const STOOL = 0.33

/** Trung tâm Đức ngữ: a little colonial-yellow building closing off the lane. */
export const CENTER = { x: -1.1, front: BUILDING_BACK_Z + 0.1, width: 4.2 }
const LUA = { bike: { x: -2.6, z: 12.75 }, seller: { x: -1.85, z: 12.2 }, zone: { x: -2.2, z: 11.8, halfX: 1.4, halfZ: 1.1 } }
const CYCLO = { x: -13.0, z: -1.2 }

const MAI = { at: { x: 7.8, z: -1.88 }, yaw: -2.06, zone: { x: 7.6, z: -1.5, halfX: 1.3, halfZ: 1.2 } }
const XE_OM = { bike: { x: 9.3, z: 1.3 }, rider: { x: 9.3, z: 1.52 }, zone: { x: 9.0, z: 1.0, halfX: 1.3, halfZ: 1.3 } }
const STALL = { seller: { x: 2.4, z: 11.6 }, zone: { x: 2.9, z: 11.5, halfX: 1.7, halfZ: 1.3 } }
const BARBER = { chair: { x: -11.8, z: 11.7 }, barber: { x: -12.5, z: 11.3 }, zone: { x: -11.9, z: 11.3, halfX: 1.4, halfZ: 1.2 } }

const CENTER_SIGN: SignOptions = {
  title: 'TRUNG TÂM ĐỨC NGỮ',
  subtitle: 'Deutschkurse A1 · A2 · B1 — Thầy Minh',
  background: '#3f7d5c',
  border: '#f4c04e',
  color: '#ffffff',
  accent: '#ffe6a6',
  aspect: 4.2,
}
const CENTER_BANNER: SignOptions = {
  title: 'Khai giảng lớp mới!',
  subtitle: 'Neue Kurse ab Montag',
  background: '#c8322b',
  border: '#f4c04e',
  color: '#ffe08a',
  accent: '#ffffff',
  aspect: 3.2,
}
/** Hà Nội's blue enamel street-name plaque. */
const STREET_PLAQUE: SignOptions = {
  title: 'PHỐ HÀNG GAI',
  subtitle: 'Q. Hoàn Kiếm',
  background: '#2c5aa0',
  border: '#ffffff',
  color: '#ffffff',
  accent: '#ffffff',
  aspect: 2.6,
}

const CENTER_DOOR: SpotAction[] = [{ id: 'enter', labelKey: 'action.enterClass', icon: 'book', action: 'school.enter', primary: true }]

/** The German centre's facade: two floors, wooden double door, shuttered balcony, tiled roof. */
function centerShapes(): ShapeItem[] {
  const s: ShapeItem[] = []
  const { x, front: f, width: w } = CENTER
  const wall = '#f2c46d'
  const trim = '#fff3d6'
  s.push({ box: [w, 6.2, 0.8], at: [x, 3.1, f - 0.4], color: wall })
  s.push({ box: [w + 0.15, 0.25, 0.25], at: [x, 3.05, f + 0.05], color: trim })
  s.push({ box: [w + 0.2, 0.3, 0.3], at: [x, 6.25, f], color: trim })
  // Terracotta tiled roof lip
  s.push({ box: [w + 0.4, 0.14, 0.9], at: [x, 6.55, f - 0.15], rot: [0.35, 0, 0], color: '#c8653d' })
  for (let i = 0; i < 9; i++) s.push({ cyl: [0.05, 0.05, 0.9, 6], at: [x - w / 2 + 0.1 + i * (w / 8), 6.6, f - 0.12], rot: [Math.PI / 2 + 0.35, 0, 0], color: '#b4552f' })
  // Ground floor: wooden double door with a glass transom and two steps
  s.push({ box: [1.5, 2.6, 0.08], at: [x, 1.3, f + 0.02], color: trim })
  s.push({ box: [1.3, 2.1, 0.08], at: [x, 1.12, f + 0.05], color: '#7a4b2a' })
  s.push({ box: [0.03, 2.1, 0.09], at: [x, 1.12, f + 0.06], color: '#4f2f19' })
  for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) s.push({ box: [0.45, 0.5, 0.02], at: [x + sx * 0.33, 0.45 + r * 0.66, f + 0.1], color: '#8e5a34' })
  s.push({ box: [1.3, 0.32, 0.07], at: [x, 2.4, f + 0.05], color: '#bfe6f2' })
  s.push({ box: [1.8, 0.1, 0.45], at: [x, 0.05, f + 0.25], color: '#d3cdc4' })
  s.push({ box: [1.6, 0.1, 0.25], at: [x, 0.15, f + 0.12], color: '#d3cdc4' })
  // Wall lamps either side of the door
  for (const sx of [-1, 1]) {
    s.push({ box: [0.08, 0.08, 0.2], at: [x + sx * 1.0, 2.35, f + 0.1], color: '#2f2f38' })
    s.push({ sphere: [0.1, 8, 6], at: [x + sx * 1.0, 2.25, f + 0.2], color: '#ffe6a6' })
  }
  // Upper floor: balcony with green shutters and plants
  s.push({ box: [2.6, 0.12, 0.6], at: [x, 3.3, f + 0.28], color: trim })
  for (let b = 0; b <= 10; b++) s.push({ box: [0.03, 0.8, 0.03], at: [x - 1.25 + b * 0.25, 3.75, f + 0.56], color: '#2c5c43' })
  s.push({ box: [2.6, 0.05, 0.05], at: [x, 4.15, f + 0.56], color: '#2c5c43' })
  s.push({ box: [1.0, 1.9, 0.06], at: [x, 4.3, f + 0.02], color: '#bfe6f2' })
  for (const sx of [-1, 1]) {
    s.push({ box: [0.5, 1.9, 0.06], at: [x + sx * 0.78, 4.3, f + 0.04], color: '#3f7d5c' })
    for (let l = 0; l < 7; l++) s.push({ box: [0.42, 0.025, 0.02], at: [x + sx * 0.78, 3.5 + l * 0.25, f + 0.08], color: '#2c5c43' })
  }
  s.push(place(plantShapes(P.leafDark, P.terracotta), [x - 1.0, 3.36, f + 0.35], 0, 0.7))
  s.push(place(plantShapes(P.blossom, P.terracotta), [x + 1.0, 3.36, f + 0.35], 0.5, 0.7))
  // Students' bicycles parked by the door
  s.push(place(bicycleShapes('#4f86d9'), [x - 1.65, 0, f + 0.6], Math.PI / 2 - 0.15))
  s.push(place(bicycleShapes('#ff9fb2'), [x + 1.7, 0, f + 0.6], Math.PI / 2 + 0.1))
  return s
}

function placesShapes(): ShapeItem[] {
  const s: ShapeItem[] = []
  s.push(...centerShapes())
  // The flower bicycle and a parked cyclo
  s.push(place(flowerBikeShapes(), [LUA.bike.x, 0, LUA.bike.z], Math.PI / 2 + 0.12))
  s.push(place(cycloShapes(), [CYCLO.x, 0, CYCLO.z], 0.35))

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
      <SignBoard options={CENTER_SIGN} width={2.9} position={[CENTER.x, 2.75, CENTER.front + 0.2]} />
      <SignBoard options={CENTER_BANNER} width={1.15} position={[CENTER.x + 1.28, 1.5, CENTER.front + 0.07]} />
      <SignBoard options={STREET_PLAQUE} width={0.95} position={[HOME.x + 2.27, 3.2, -4.4]} />
      <ActionSpot
        id="center-door"
        nameKey="interact.germanCenter"
        zone={{ x: CENTER.x, z: CENTER.front + 1.3, halfX: 1.4, halfZ: 0.95 }}
        actions={CENTER_DOOR}
        marker={{ at: [CENTER.x, 3.6, CENTER.front + 0.6], when: { noFlag: 'course.0' } }}
        priority={2}
      />
      <NPC def={NPCS.chiLua} at={LUA.seller} yaw={Math.PI + 0.3} zone={LUA.zone} />
      <NPC def={NPCS.chiMai} at={MAI.at} yaw={MAI.yaw} seatY={STOOL} activity="sip" zone={MAI.zone} />
      <NPC def={NPCS.anhTu} at={XE_OM.rider} yaw={Math.PI} seatY={0.86} arms={1} zone={XE_OM.zone} />
      <NPC def={NPCS.chiHang} at={STALL.seller} yaw={Math.PI} seatY={STOOL} activity="fan" zone={STALL.zone} />
      <NPC def={NPCS.chuSau} at={BARBER.barber} yaw={0.7} zone={BARBER.zone} />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.3, 0.6, 0.85]} position={[XE_OM.bike.x, 0.6, XE_OM.bike.z]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[1.2, 0.9, 0.2]} position={[3.0, 0.9, 12.9]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.7, 0.4, 0.38]} position={[3.4, 0.4, 12.0]} collisionGroups={PROP_GROUPS} />
        <CylinderCollider args={[0.5, 0.35]} position={[BARBER.chair.x, 0.5, BARBER.chair.z]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.9, 0.6, 0.3]} position={[LUA.bike.x, 0.6, LUA.bike.z]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.6, 0.6, 0.9]} position={[CYCLO.x, 0.6, CYCLO.z]} collisionGroups={PROP_GROUPS} />
      </RigidBody>
    </>
  )
}
