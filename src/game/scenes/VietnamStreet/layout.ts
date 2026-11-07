import type { Vec3 } from '../../../data/config'
import type { Lane } from '../../components/npc/Traffic'
import type { PointXZ, ZoneXZ } from '../../systems/playerState'
import type { PoleSpec } from '../shared/PowerLines'
import { PALETTE as P } from '../shared/palette'
import type { TreeVariant } from '../shared/props'

/**
 * Where everything sits on the street corner (top-down, metres).
 * +X = east (right at the start), -Z = north (toward the buildings).
 *
 *   z=-13  ── back wall ───────────────────────────┐ side
 *          [neighbor][ home ] alley [   café   ]   │ road
 *   z=-4.5 ── building fronts ──────────────────── │
 *             sidewalk (spawn, bikes, café tables)  │
 *   z=3.2  ════════════ main road ══════════════════╪═════
 *   z=8.6  far sidewalk (trees, bench)
 *   z=14   hedge
 */

export const PLAY = { minX: -14, maxX: 14, minZ: -13, maxZ: 14 }

export const BUILDING_FRONT_Z = -4.5
export const BUILDING_BACK_Z = -13
export const BUILDING_DEPTH = BUILDING_FRONT_Z - BUILDING_BACK_Z
export const BUILDING_CENTER_Z = (BUILDING_FRONT_Z + BUILDING_BACK_Z) / 2

export const ROAD = { minZ: 3.2, maxZ: 8.6 }
export const SIDE_ROAD = { minX: 10, maxX: 13.6 }

export const HOME = { x: -5.5, width: 4.5, floors: 3 }
export const NEIGHBOR = { x: -10, width: 4.4, floors: 2 }
export const CAFE = { x: 4.5, width: 7, depth: 6, z: BUILDING_FRONT_Z - 3 }

/**
 * Café interior in café-local coordinates (origin = centre of the open hall,
 * the street side faces +Z). Shared by the building and the barista job.
 */
export const CAFE_INTERIOR = {
  counter: { x: 0.9, z: -0.5, w: 3.4, d: 0.7 },
  fridge: { x: -2.6, z: -2.25 },
  indoorTable: { x: -2.2, z: 1.7 },
  /** Where the barista stands, behind the counter. */
  workSpot: { x: 1.2, z: -1.55 },
  /** Where customers stand to order. */
  customerSpot: { x: 1.2, z: 0.5 },
  /** Customers appear/disappear here, just outside the entrance. */
  door: { x: 1.2, z: 3.9 },
  /** Path around the counter's left end. */
  aisleX: -1.45,
  aisleFrontZ: 0.35,
  /** Inner floor area, used for the roof cut-away. */
  inner: { halfX: 3.3, minZ: -2.8, maxZ: 3.1 },
}

export const cafeToWorld = (p: { x: number; z: number }) => ({ x: CAFE.x + p.x, z: CAFE.z + p.z })

export const TREES: { at: Vec3; variant: TreeVariant; scale?: number }[] = [
  { at: [-8.2, 0, 2.3], variant: 'green' },
  { at: [-0.6, 0, 2.3], variant: 'blossom' },
  { at: [6.4, 0, 2.3], variant: 'green' },
  { at: [-13, 0, -3.4], variant: 'blossom', scale: 0.8 },
  { at: [9.45, 0, -3.6], variant: 'green', scale: 0.9 },
  { at: [-1.2, 0, -12], variant: 'blossom', scale: 0.75 },
  { at: [-11, 0, 10.4], variant: 'green' },
  { at: [-4, 0, 10.4], variant: 'blossom' },
  { at: [3.2, 0, 10.4], variant: 'green' },
  { at: [10.6, 0, 10.4], variant: 'green', scale: 1.1 },
]

export const PLANTS: Vec3[] = [
  [-7.6, 0, -4.0],
  [-3.4, 0, -4.0],
  [-12, 0, -4.0],
  [1.4, 0, -4.0],
  [7.6, 0, -4.0],
  [0.5, 0, -8.0],
  [0.5, 0, -10.8],
  [-2.8, 0, -12.4],
]

export const MOTORBIKES: { at: Vec3; rotY: number; color: string }[] = [
  { at: [-8.9, 0, -2.2], rotY: Math.PI + 0.15, color: P.rose },
  { at: [-1.7, 0, -6.8], rotY: 0.1, color: P.mint },
  { at: [6.2, 0, 11.0], rotY: Math.PI / 2 + 0.1, color: P.lilac },
  { at: [11.9, 0, 10.6], rotY: Math.PI / 2, color: P.butter },
]

export const CAFE_TABLES: { at: Vec3; stools: string[] }[] = [
  { at: [2.5, 0, -2.0], stools: [P.coral, P.sky2] },
  { at: [4.9, 0, -1.2], stools: [P.sky2, P.mint] },
  { at: [7.2, 0, -2.2], stools: [P.coral, P.butter] },
]

export const BENCHES: { at: Vec3; rotY: number }[] = [
  { at: [-0.4, 0, 11.6], rotY: Math.PI },
  { at: [7.6, 0, 11.6], rotY: Math.PI },
]

const POLE_Z = 2.6

export const POLES: PoleSpec[] = [
  { x: -19, z: POLE_Z, collider: false },
  { x: -11.6, z: POLE_Z, lamp: true },
  { x: -4.2, z: POLE_Z },
  { x: 2.6, z: POLE_Z, lamp: true },
  { x: 9.4, z: POLE_Z, transformer: true },
  { x: 9.4, z: -6.8, lamp: true },
  { x: 9.4, z: -16, collider: false },
  { x: 17, z: POLE_Z, collider: false },
]

export const POLE_SPANS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [4, 7],
]

export const POLE_DROPS: { from: number; to: Vec3 }[] = [
  // Endpoints sit on bare wall between balconies so wires don't pierce railings.
  { from: 1, to: [-10.6, 4.6, BUILDING_FRONT_Z + 0.05] },
  { from: 2, to: [-3.5, 7.7, BUILDING_FRONT_Z + 0.05] },
  { from: 2, to: [-6.9, 4.8, BUILDING_FRONT_Z + 0.05] },
  { from: 3, to: [1.6, 3.0, BUILDING_FRONT_Z + 0.05] },
]

/** Sidewalk trà đá stall at the mouth of the alley. */
export const TRA_DA = {
  seller: { x: -2.55, z: -2.95 },
  jugTable: { x: -2.0, z: -3.45 },
  iceBox: { x: -2.85, z: -3.75 },
  table: { x: -0.55, z: -2.2 },
  chuNam: { x: -0.55, z: -2.85 },
  anhHai: { x: 0.12, z: -2.2 },
  /** The free stool where the player sits. */
  playerSeat: { x: -1.22, z: -2.2 },
  spareStool: { x: -0.55, z: -1.55 },
  umbrella: { x: -1.3, z: -2.65 },
  zone: { x: -1.25, z: -2.3, halfX: 1.75, halfZ: 1.6 } as ZoneXZ,
}

/** Cô Ba's grocery in the neighbour's ground floor. */
export const GROCERY = {
  coBa: { x: -11.35, z: -3.7 },
  zone: { x: NEIGHBOR.x, z: BUILDING_FRONT_Z + 1.05, halfX: 2.1, halfZ: 1.15 } as ZoneXZ,
}

export const HOME_DOOR_ZONE: ZoneXZ = { x: HOME.x, z: BUILDING_FRONT_Z + 0.9, halfX: 1.7, halfZ: 0.95 }

/** Bánh mì vendor with a shoulder pole, strolling the near sidewalk. */
export const VENDOR_PATH: PointXZ[] = [
  { x: -12.4, z: 1.35 },
  { x: -6.2, z: 1.35 },
  { x: 0.6, z: 1.35 },
  { x: 7.6, z: 1.35 },
]

export const WALKER_PATHS: Record<'coHoa' | 'anhKhoa' | 'chiLan', PointXZ[]> = {
  coHoa: [
    { x: -12.8, z: 0.45 },
    { x: 8.8, z: 0.45 },
  ],
  anhKhoa: [
    { x: -13.2, z: 9.6 },
    { x: 13.2, z: 9.6 },
  ],
  chiLan: [
    { x: 8.65, z: -12.3 },
    { x: 8.65, z: 0.4 },
  ],
}

/** Two kids playing đá cầu on the far sidewalk. */
export const KIDS = { a: { x: -8.7, z: 12.1 }, b: { x: -5.9, z: 12.1 } }

/** Drive on the right: eastbound on the far side, westbound on the near side. */
export const TRAFFIC_LANES: Lane[] = [
  { z: 7.25, dir: 1 },
  { z: 4.55, dir: -1 },
]
