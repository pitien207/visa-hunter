import { memo, useEffect, useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { MeshLambertMaterial } from 'three'
import type { Vec3 } from '../../../data/config'
import { NPCS } from '../../../data/npcs'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { ChatterDirector } from '../../components/npc/ChatterDirector'
import { NPC } from '../../components/npc/NPC'
import { Traffic, type Lane } from '../../components/npc/Traffic'
import { BUILDING_GROUPS, PROP_GROUPS } from '../../systems/collisionGroups'
import { groundMaterial, lambert } from '../shared/materials'
import { PALETTE as P } from '../shared/palette'
import { benchShapes, coneShapes, place, plantShapes, treeShapes } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import { makeTileTexture, type SignOptions } from '../shared/textures'
import { Backdrop } from '../VietnamStreet/Backdrop'
import { Altbau } from './Altbau'
import { PfandBottles } from './PfandBottles'

/**
 * Lindenstraße (chapter 3–4): an Altbau street with the WG, the Bürgeramt, a supermarket,
 * a bakery and bank, a tram stop, a Döner kiosk and a flea market across the road.
 */

const FRONT = -4.5
const DEPTH = 8.5
const CZ = FRONT - DEPTH / 2
const ROAD = { minZ: 3.2, maxZ: 8.6 }
const LANES: Lane[] = [
  { z: 7.25, dir: 1 },
  { z: 4.55, dir: -1 },
]
const GERMAN_COLORS = ['#c9d8e8', '#f2d9b8', '#e8c4b8', '#d8e4c8', '#efe2c4', '#cfc4e0']
const KINDS = ['car', 'bicycle'] as const

const sign = (title: string, subtitle: string, background: string, color: string, aspect = 4): SignOptions => ({
  title,
  subtitle,
  background,
  border: '#ffffff',
  color,
  accent: color,
  aspect,
})
const SIGNS = {
  buergeramt: sign('BÜRGERAMT', 'Lindenstraße 14 · Mo–Fr 8–16 Uhr', '#ffffff', '#2f3a4d', 5),
  wg: sign('Lindenstraße 12', 'WG · 3. OG · Klingel: Lena & Jonas', '#4f6fa8', '#ffffff', 4),
  supermarkt: sign('SUPERMARKT', 'Mo–Sa 8–22 · Sonntag geschlossen!', '#d4473b', '#ffffff', 5),
  baeckerei: sign('BÄCKEREI', 'Frische Brötchen', '#f4c04e', '#5b4636', 3.2),
  bank: sign('SPARBANK', 'Geldautomat 24h', '#2f8c7f', '#ffffff', 3.2),
  doener: sign('DÖNER', 'Kebab · Falafel', '#ff9b8f', '#ffffff', 2.4),
}

function GermanyGround() {
  const paving = useMemo(() => {
    const map = makeTileTexture('#dcd7cf', '#c2bbb0', 30, 28)
    return new MeshLambertMaterial({ map })
  }, [])
  useEffect(
    () => () => {
      paving.map?.dispose()
      paving.dispose()
    },
    [paving],
  )
  const road = useMemo<ShapeItem[]>(() => {
    const s: ShapeItem[] = [{ box: [160, 0.02, ROAD.maxZ - ROAD.minZ], at: [0, 0.005, (ROAD.minZ + ROAD.maxZ) / 2], color: '#8f97a6' }]
    // Tram rails down the middle
    for (const z of [5.45, 5.65, 6.15, 6.35]) s.push({ box: [160, 0.012, 0.06], at: [0, 0.02, z], color: '#c9ccd2' })
    // Curbs and a zebra crossing
    s.push({ box: [160, 0.12, 0.22], at: [0, 0.06, ROAD.minZ], color: '#cfcac0' })
    s.push({ box: [160, 0.12, 0.22], at: [0, 0.06, ROAD.maxZ], color: '#cfcac0' })
    for (let z = ROAD.minZ + 0.45; z < ROAD.maxZ - 0.2; z += 0.8) s.push({ box: [2.2, 0.01, 0.42], at: [-6, 0.022, z], color: P.roadLine })
    // Park strip across the road
    s.push({ box: [29, 0.03, 3.6], at: [0, 0.01, 12.4], color: '#b9d9a0' })
    return s
  }, [])
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} material={lambert('#bcd6a6')} receiveShadow>
        <planeGeometry args={[220, 220]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0.5]} material={paving} receiveShadow>
        <planeGeometry args={[29.2, 28]} />
      </mesh>
      <Shapes shapes={road} material={groundMaterial} castShadow={false} />
    </>
  )
}

/** Street furniture: trees, lamps, bins, Litfaßsäule, tram stop, kiosk, flea market. */
function streetShapes(): ShapeItem[] {
  const s: ShapeItem[] = []
  for (const [x, z] of [
    [-11.5, 2.4],
    [-3.6, 2.4],
    [5.6, 2.4],
    [12.6, 2.4],
    [-10, 12.8],
    [-2, 13.2],
    [7.5, 12.8],
    [12.2, 13.2],
  ]) {
    s.push(place(treeShapes('linden'), [x, 0, z], x * 0.7, 1.15))
  }
  // Classic lamp posts
  for (const x of [-8, 3.8, 10.8]) {
    s.push({ cyl: [0.06, 0.09, 3.6, 8], at: [x, 1.8, 2.75], color: '#3a4a44' })
    s.push({ box: [0.34, 0.45, 0.34], at: [x, 3.75, 2.75], color: '#3a4a44' })
    s.push({ box: [0.26, 0.32, 0.26], at: [x, 3.72, 2.75], color: '#fff2b3' })
  }
  // Recycling bins (blue paper, yellow plastic, brown bio, grey rest)
  ;['#4f86d9', '#f4c04e', '#8a6a4a', '#6b7280'].forEach((c, i) => {
    s.push({ box: [0.6, 0.95, 0.65], at: [-13.2 + i * 0.68, 0.48, -3.7], color: c })
    s.push({ box: [0.64, 0.08, 0.7], at: [-13.2 + i * 0.68, 0.98, -3.75], rot: [-0.15, 0, 0], color: c })
  })
  // Litfaßsäule (advertising column)
  s.push({ cyl: [0.45, 0.45, 2.6, 16], at: [-6.2, 1.3, 1.8], color: '#e9e2d0' })
  ;['#ff9b8f', '#a9d6ff', '#ffe08a', '#a8e6cf'].forEach((c, i) => s.push({ cyl: [0.46, 0.46, 0.5, 16], at: [-6.2, 0.6 + i * 0.55, 1.8], rot: [0, i, 0], color: c }))
  s.push({ sphere: [0.5, 16, 8, Math.PI / 2], at: [-6.2, 2.6, 1.8], color: '#3a4a44' })
  // Tram stop: shelter, bench, H sign, ticket machine
  s.push({ box: [2.4, 0.08, 1.0], at: [1.2, 2.4, 2.45], color: '#3a4a44' })
  s.push({ box: [2.4, 2.3, 0.05], at: [1.2, 1.2, 2.95], color: '#cfe8f6' })
  s.push({ box: [0.05, 2.3, 1.0], at: [0.0, 1.2, 2.45], color: '#3a4a44' })
  s.push({ box: [1.6, 0.08, 0.4], at: [1.2, 0.5, 2.7], color: P.wood })
  s.push({ cyl: [0.04, 0.04, 2.6, 6], at: [-0.4, 1.3, 2.2], color: '#3a4a44' })
  s.push({ cyl: [0.3, 0.3, 0.06, 20], at: [-0.4, 2.65, 2.2], rot: [Math.PI / 2, 0, 0], color: '#6fcf97' })
  s.push({ cyl: [0.22, 0.22, 0.07, 20], at: [-0.4, 2.65, 2.2], rot: [Math.PI / 2, 0, 0], color: '#f4c04e' })
  s.push({ box: [0.55, 1.5, 0.4], at: [2.9, 0.75, 2.2], color: '#d4473b' })
  s.push({ box: [0.4, 0.3, 0.04], at: [2.9, 1.2, 1.99], color: '#a9d6ff' })
  // Döner kiosk with a rotating spit
  s.push({ box: [1.8, 2.3, 1.2], at: [9.2, 1.15, 2.2], color: '#fff6e3' })
  s.push({ box: [1.6, 0.9, 0.06], at: [9.2, 1.4, 1.58], color: '#2f2f38' })
  s.push({ box: [1.9, 0.08, 0.5], at: [9.2, 0.98, 1.4], color: P.white })
  s.push({ cyl: [0.12, 0.2, 0.7, 10], at: [8.8, 1.45, 1.75], color: '#c97b4a' })
  // Bike rack with a bike
  s.push({ box: [1.4, 0.06, 0.06], at: [1.8, 0.7, -3.7], color: P.steel })
  for (const x of [1.2, 1.8, 2.4]) s.push({ torus: [0.3, 0.03, 4, 12, Math.PI], at: [x, 0.05, -3.7], rot: [0, Math.PI / 2, 0], color: P.steel })
  // Flea market tables and bench across the road
  for (const [x, c] of [
    [2.6, '#a9d6ff'],
    [4.4, '#ffe08a'],
  ] as const) {
    s.push({ box: [1.6, 0.06, 0.8], at: [x, 0.75, 12.4], color: P.woodDark })
    s.push({ box: [1.5, 0.7, 0.04], at: [x, 0.38, 12.75], color: '#c4a074' })
    for (let i = 0; i < 4; i++) s.push({ box: [0.3, 0.12 + (i % 2) * 0.1, 0.3], at: [x - 0.55 + i * 0.36, 0.84 + (i % 2) * 0.05, 12.35], color: [c, P.rose, P.mint, P.white][i] })
  }
  s.push(place(benchShapes('#3a4a44'), [-4, 0, 11.6], Math.PI))
  s.push(place(plantShapes(P.leafDark, '#b8aa98'), [-6.2, 0, -3.9], 0, 1.1))
  s.push(place(plantShapes(P.leaf, '#b8aa98'), [7.4, 0, -3.9], 0, 1.1))
  s.push(place(coneShapes(), [-13.6, 0, 2.7]))
  s.push(place(coneShapes(), [13.6, 0, 9.1]))
  return s
}

/** Single-storey supermarket with a big glass front. */
function supermarketShapes(): ShapeItem[] {
  const w = 6
  const f = DEPTH / 2
  return [
    { box: [w, 4, DEPTH], at: [0, 2, 0], color: '#f4f4f4' },
    { box: [w + 0.2, 0.4, DEPTH + 0.2], at: [0, 4.15, 0], color: '#d4473b' },
    { box: [w - 0.6, 2.4, 0.06], at: [0, 1.4, f + 0.01], color: '#bfe6f2' },
    { box: [1.4, 2.4, 0.08], at: [-0.6, 1.2, f + 0.03], color: '#9fd0e4' },
    { box: [0.08, 2.4, 0.1], at: [0.1, 1.2, f + 0.04], color: P.white },
    // Pfand machine on the right of the door
    { box: [0.8, 1.7, 0.5], at: [1.9, 0.85, f + 0.3], color: '#2f8c7f' },
    { box: [0.4, 0.4, 0.05], at: [1.9, 1.15, f + 0.56], color: '#2f2f38' },
    { cyl: [0.12, 0.12, 0.06, 12], at: [1.9, 0.75, f + 0.56], rot: [Math.PI / 2, 0, 0], color: '#a9d6ff' },
    // Shopping carts
    { box: [0.6, 0.5, 0.9], at: [-2.3, 0.6, f + 0.6], color: P.steel },
    { box: [0.6, 0.5, 0.9], at: [-2.3, 0.65, f + 0.85], color: P.steel },
  ]
}

const WG_ACTIONS: SpotAction[] = [
  { id: 'enter', labelKey: 'action.enterHome', icon: 'door', action: 'de.viewWg', primary: true, if: { flag: 'de.wg' } },
  { id: 'view', labelKey: 'action.viewWg', icon: 'door', action: 'de.viewWg', primary: true, if: { noFlag: 'de.wg' } },
  { id: 'hostel', labelKey: 'action.hostel', icon: 'sleep', action: 'de.hostel', if: { noFlag: 'de.wg' } },
]
const AMT: SpotAction[] = [{ id: 'enter', labelKey: 'action.enter', icon: 'door', action: 'de.enterBuergeramt', primary: true }]
const MARKET: SpotAction[] = [
  { id: 'shop', labelKey: 'action.shop', icon: 'shop', action: 'de.openShop', arg: 'supermarkt', primary: true },
  { id: 'pfand', labelKey: 'action.pfandReturn', icon: 'bottle', action: 'de.pfandReturn', if: { flag: 'pfand.carried', atLeast: 1 } },
]
const BAKERY: SpotAction[] = [{ id: 'shop', labelKey: 'action.shop', icon: 'shop', action: 'de.openShop', arg: 'baeckerei', primary: true }]
const KIOSK: SpotAction[] = [{ id: 'shop', labelKey: 'action.shop', icon: 'shop', action: 'de.openShop', arg: 'imbiss', primary: true }]
const TRAM: SpotAction[] = [
  { id: 'tram', labelKey: 'action.tramCare', icon: 'tram', action: 'de.tram', arg: 'careHome', primary: true },
  { id: 'ticket', labelKey: 'action.buyTicket', icon: 'ticket', action: 'de.buyTicket', if: { not: { test: 'de.ticketValid' } } },
]
const FLEA: SpotAction[] = [{ id: 'shop', labelKey: 'action.shop', icon: 'hanger', action: 'clothes.open', arg: 'flohmarkt', primary: true }]

const at = (x: number, y: number, z: number): Vec3 => [x, y, z]

const GermanyStreet = memo(function GermanyStreet() {
  const street = useMemo(streetShapes, [])
  const market = useMemo(supermarketShapes, [])
  return (
    <>
      <GermanyGround />
      <Altbau position={[-9.5, 0, CZ]} width={7} depth={DEPTH} floors={4} wall="#a9c8e8" trim="#ffffff" roof="#6b7280" doorX={0} flowers />
      <Altbau position={[-2.0, 0, CZ]} width={6.5} depth={DEPTH} floors={3} wall="#e8dcc0" trim="#ffffff" roof="#b5524a" doorX={0} />
      <RigidBody type="fixed" colliders={false} position={[4.8, 0, CZ]}>
        <Shapes shapes={market} />
        <CuboidCollider args={[3, 2.2, DEPTH / 2]} position={[0, 2.2, 0]} collisionGroups={BUILDING_GROUPS} />
      </RigidBody>
      <Altbau position={[11.2, 0, CZ]} width={5.5} depth={DEPTH} floors={3} wall="#f2c4a8" trim="#ffffff" roof="#6b7280" doorX={1.2} flowers />

      <SignBoard options={SIGNS.wg} width={2.2} position={[-9.5, 3.15, FRONT + 0.08]} />
      <SignBoard options={SIGNS.buergeramt} width={3.6} position={[-2.0, 3.25, FRONT + 0.08]} />
      <SignBoard options={SIGNS.supermarkt} width={4.6} position={[4.8, 3.35, FRONT + 0.12]} />
      <SignBoard options={SIGNS.baeckerei} width={2.0} position={[9.9, 2.8, FRONT + 0.08]} />
      <SignBoard options={SIGNS.bank} width={2.0} position={[12.4, 2.8, FRONT + 0.08]} />
      <SignBoard options={SIGNS.doener} width={1.6} position={[9.2, 2.05, 1.56]} />

      <Shapes shapes={street} />
      <RigidBody type="fixed" colliders={false}>
        {[[-11.5, 2.4], [-3.6, 2.4], [5.6, 2.4], [12.6, 2.4], [-10, 12.8], [-2, 13.2], [7.5, 12.8], [12.2, 13.2]].map(([x, z]) => (
          <CylinderCollider key={`t${x},${z}`} args={[0.8, 0.25]} position={[x, 0.8, z]} collisionGroups={PROP_GROUPS} />
        ))}
        <CylinderCollider args={[1.3, 0.5]} position={[-6.2, 1.3, 1.8]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[1.25, 1.2, 0.08]} position={[1.2, 1.2, 2.95]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.3, 0.75, 0.22]} position={[2.9, 0.75, 2.2]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.95, 1.2, 0.65]} position={[9.2, 1.2, 2.2]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[1.4, 0.5, 0.4]} position={[-12.2, 0.5, -3.7]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.45, 0.85, 0.3]} position={[6.7, 0.85, FRONT + 0.3]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[1.8, 0.45, 0.45]} position={[3.5, 0.45, 12.5]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.8, 0.45, 0.25]} position={[-4, 0.45, 11.6]} collisionGroups={PROP_GROUPS} />
        {/* Invisible bounds (incl. a wall just behind the facades so nobody slips between houses) */}
        <CuboidCollider args={[15, 4, 0.3]} position={[0, 4, FRONT - 0.5]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.5, 4, 15]} position={[-14.5, 4, 0.5]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[0.5, 4, 15]} position={[14.5, 4, 0.5]} collisionGroups={PROP_GROUPS} />
        <CuboidCollider args={[15, 4, 0.5]} position={[0, 4, 14.5]} collisionGroups={PROP_GROUPS} />
      </RigidBody>

      {/* Doors and counters */}
      <ActionSpot id="de-wg" name={{ vi: 'Lindenstraße 12 (WG)', en: 'Lindenstraße 12 (WG)' }} zone={{ x: -9.5, z: -3.5, halfX: 1.4, halfZ: 0.9 }} actions={WG_ACTIONS} marker={{ at: at(-9.5, 3.9, -3.9), when: { noFlag: 'de.wg' } }} />
      <ActionSpot id="de-amt" nameKey="interact.buergeramt" zone={{ x: -2.0, z: -3.5, halfX: 1.4, halfZ: 0.9 }} actions={AMT} marker={{ at: at(-2.0, 3.9, -3.9), when: { all: [{ flag: 'de.wg' }, { noFlag: 'de.anmeldung' }] } }} />
      <ActionSpot id="de-market" nameKey="interact.supermarket" zone={{ x: 4.6, z: -3.5, halfX: 2.0, halfZ: 0.9 }} actions={MARKET} />
      <ActionSpot id="de-bakery" nameKey="interact.bakery" zone={{ x: 9.6, z: -3.5, halfX: 0.9, halfZ: 0.9 }} actions={BAKERY} />
      <ActionSpot id="de-kiosk" nameKey="interact.doener" zone={{ x: 9.2, z: 0.9, halfX: 1.2, halfZ: 0.8 }} actions={KIOSK} />
      <ActionSpot id="de-tram" nameKey="interact.tramStop" zone={{ x: 1.6, z: 1.8, halfX: 1.8, halfZ: 0.9 }} actions={TRAM} marker={{ at: at(-0.4, 3.3, 2.2), when: { all: [{ test: 'de.paperworkDone' }, { not: { flag: 'stats.careShifts', atLeast: 1 } }] } }} />
      <ActionSpot id="de-flea" nameKey="interact.flohmarkt" zone={{ x: 3.5, z: 11.4, halfX: 2.0, halfZ: 1.0 }} actions={FLEA} />

      {/* People */}
      <NPC def={NPCS.wagner} at={{ x: 12.6, z: -3.8 }} yaw={0} zone={{ x: 12.5, z: -3.4, halfX: 1.2, halfZ: 0.9 }} />
      <NPC def={NPCS.herrMueller} at={{ x: -4, z: 11.6 }} yaw={Math.PI} seatY={0.45} />
      <NPC def={NPCS.tom} at={{ x: 3.5, z: 13.3 }} yaw={Math.PI} seatY={0.33} activity="sip" />
      <NPC def={NPCS.sophie} at={{ x: -12.5, z: 0.6 }} path={{ points: [{ x: -12.5, z: 0.6 }, { x: 12.5, z: 0.6 }], pauseSec: [0.5, 3] }} yieldLines="yieldDe" />
      <NPC def={NPCS.anhKhoa} at={{ x: 13, z: 9.6 }} path={{ points: [{ x: -13, z: 9.6 }, { x: 13, z: 9.6 }], pauseSec: [1, 4] }} yieldLines="yieldDe" />
      <Traffic lanes={LANES} perLane={2} kinds={[...KINDS]} />
      <ChatterDirector groups={[]} solos={['herrMueller', 'sophie', 'anhKhoa:anhKhoaDe', 'tom', 'wagner']} />

      <PfandBottles />
      <Backdrop colors={GERMAN_COLORS} roof="#8a5a52" sideRoad={false} tree="linden" />
    </>
  )
})

export default GermanyStreet
