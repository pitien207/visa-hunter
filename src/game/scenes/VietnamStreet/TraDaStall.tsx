import { useEffect, useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { NPCS } from '../../../data/npcs'
import { NPC } from '../../components/npc/NPC'
import { registerSeat } from '../../systems/registry'
import { PALETTE as P } from '../shared/palette'
import { place, stoolShapes } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'
import { TRA_DA } from './layout'

const STOOL_TOP = 0.33
const TEA = '#d8a24e'

const SIGN: SignOptions = {
  title: 'TRÀ ĐÁ',
  subtitle: '5K',
  background: '#d9b27c',
  border: '#a9814f',
  color: '#3a2a20',
  accent: '#c0392b',
  aspect: 2.2,
}

function stallShapes(): ShapeItem[] {
  const s: ShapeItem[] = []
  const { seller, jugTable: jt, iceBox, table: t, chuNam, anhHai, playerSeat, spareStool, umbrella: u } = TRA_DA

  // Plastic stools (one free for the player)
  s.push(place(stoolShapes(P.sky2), [seller.x, 0, seller.z]))
  s.push(place(stoolShapes(P.coral), [chuNam.x, 0, chuNam.z]))
  s.push(place(stoolShapes(P.mint), [anhHai.x, 0, anhHai.z]))
  s.push(place(stoolShapes(P.coral), [playerSeat.x, 0, playerSeat.z]))
  s.push(place(stoolShapes(P.sky2), [spareStool.x, 0, spareStool.z]))

  // Low plastic table with glasses of tea and a plate of sunflower seeds
  s.push({ box: [0.62, 0.04, 0.62], at: [t.x, 0.44, t.z], color: '#8fbfe8' })
  for (const [dx, dz] of [
    [-0.26, -0.26],
    [0.26, -0.26],
    [-0.26, 0.26],
    [0.26, 0.26],
  ]) {
    s.push({ cyl: [0.025, 0.025, 0.42, 5], at: [t.x + dx, 0.21, t.z + dz], color: '#6f9fd0' })
  }
  for (const [dx, dz] of [
    [-0.15, -0.12],
    [0.16, 0.06],
    [-0.05, 0.18],
  ]) {
    s.push({ cyl: [0.045, 0.04, 0.12, 8], at: [t.x + dx, 0.52, t.z + dz], color: TEA })
    s.push({ cyl: [0.047, 0.047, 0.015, 8], at: [t.x + dx, 0.585, t.z + dz], color: '#f6e7c8' })
  }
  s.push({ cyl: [0.13, 0.11, 0.02, 12], at: [t.x + 0.12, 0.47, t.z - 0.14], color: P.white })
  for (let i = 0; i < 6; i++) {
    s.push({ sphere: [0.022, 6, 4], at: [t.x + 0.08 + (i % 3) * 0.04, 0.49, t.z - 0.18 + Math.floor(i / 3) * 0.06], scale: [1, 0.5, 1.6], color: '#4a3b30' })
  }

  // Serving table: the big tea jug, a tray of glasses, a thermos
  s.push({ box: [0.7, 0.04, 0.6], at: [jt.x, 0.52, jt.z], color: P.woodDark })
  for (const [dx, dz] of [
    [-0.3, -0.25],
    [0.3, -0.25],
    [-0.3, 0.25],
    [0.3, 0.25],
  ]) {
    s.push({ box: [0.04, 0.5, 0.04], at: [jt.x + dx, 0.25, jt.z + dz], color: P.woodDark })
  }
  s.push({ cyl: [0.15, 0.17, 0.42, 14], at: [jt.x - 0.12, 0.75, jt.z], color: '#e05a4a' })
  s.push({ cyl: [0.11, 0.13, 0.07, 14], at: [jt.x - 0.12, 0.99, jt.z], color: '#4f86d9' })
  s.push({ cyl: [0.025, 0.025, 0.16, 6], at: [jt.x + 0.06, 0.62, jt.z + 0.06], rot: [0, 0, -1.2], color: '#4f86d9' })
  s.push({ box: [0.3, 0.02, 0.24], at: [jt.x + 0.18, 0.55, jt.z - 0.08], color: '#ffd166' })
  for (let i = 0; i < 4; i++) {
    s.push({ cyl: [0.04, 0.035, 0.1, 8], at: [jt.x + 0.1 + (i % 2) * 0.12, 0.61, jt.z - 0.13 + Math.floor(i / 2) * 0.1], color: '#e8f4f8' })
  }
  s.push({ cyl: [0.07, 0.07, 0.32, 10], at: [jt.x + 0.22, 0.7, jt.z + 0.17], color: P.rose })

  // Styrofoam ice box
  s.push({ box: [0.5, 0.32, 0.36], at: [iceBox.x, 0.16, iceBox.z], color: '#fbfbf7' })
  s.push({ box: [0.52, 0.04, 0.38], at: [iceBox.x, 0.34, iceBox.z], color: '#eef3f6' })

  // Big parasol
  s.push({ cyl: [0.035, 0.035, 2.3, 6], at: [u.x, 1.15, u.z], color: P.white })
  s.push({ cyl: [0.06, 1.5, 0.42, 16], at: [u.x, 2.24, u.z], color: P.coral })
  s.push({ cyl: [0.06, 0.95, 0.27, 16], at: [u.x, 2.37, u.z], color: P.cream })
  s.push({ sphere: [0.06, 8, 6], at: [u.x, 2.48, u.z], color: P.coral })
  return s
}

/** The trà đá stall: Bà Sáu sells, Chú Năm and Anh Hai sip and gossip, and one stool is free. */
export function TraDaStall() {
  const shapes = useMemo(stallShapes, [])
  const { seller, jugTable, iceBox, table, chuNam, anhHai, playerSeat, spareStool, umbrella, zone } = TRA_DA

  // The free stool, reached from the sidewalk side.
  useEffect(
    () =>
      registerSeat('traDa', {
        ...playerSeat,
        yaw: Math.PI / 2,
        seatY: STOOL_TOP,
        approach: () => [{ x: playerSeat.x, z: playerSeat.z + 0.95 }, playerSeat],
      }),
    [playerSeat],
  )

  return (
    <>
      <Shapes shapes={shapes} />
      <SignBoard options={SIGN} width={0.62} position={[umbrella.x, 1.35, umbrella.z + 0.05]} rotation={[0, 0, 0.04]} />

      <NPC def={NPCS.baSau} at={seller} yaw={Math.PI / 2} seatY={STOOL_TOP} activity="fan" zone={zone} />
      <NPC def={NPCS.chuNam} at={chuNam} yaw={0} seatY={STOOL_TOP} activity="sip" />
      <NPC def={NPCS.anhHai} at={anhHai} yaw={-Math.PI / 2} seatY={STOOL_TOP} activity="sip" />

      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.25, 0.3]} position={[table.x, 0.25, table.z]} />
        <CuboidCollider args={[0.38, 0.5, 0.32]} position={[jugTable.x, 0.5, jugTable.z]} />
        <CuboidCollider args={[0.26, 0.2, 0.2]} position={[iceBox.x, 0.2, iceBox.z]} />
        <CylinderCollider args={[1, 0.08]} position={[umbrella.x, 1, umbrella.z]} />
        <CylinderCollider args={[0.18, 0.2]} position={[spareStool.x, 0.18, spareStool.z]} />
      </RigidBody>
    </>
  )
}
