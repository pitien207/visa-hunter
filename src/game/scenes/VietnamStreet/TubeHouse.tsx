import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { Vec3 } from '../../../data/config'
import { BUILDING_GROUPS } from '../../systems/collisionGroups'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes, stoolShapes } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

export interface HousePalette {
  wall: string
  trim: string
  shutter: string
  railing: string
  accent: string
}

export interface TubeHouseOptions {
  width: number
  depth: number
  floors: number
  palette: HousePalette
  roofTank?: boolean
  bougainvillea?: boolean
  airCon?: boolean
  /** Ground floor is a tạp hóa (corner grocery) instead of a half-closed shutter. */
  grocery?: boolean
}

export interface TubeHouseProps extends TubeHouseOptions {
  /** Ground-level centre of the footprint. The front faces +Z. */
  position: Vec3
  /** Painted shop sign above the ground floor. */
  sign?: SignOptions
}

const GOODS = ['#ff9b8f', '#ffe08a', '#7fb8e8', '#a8e6cf', '#cdb8f0', '#ffc3a0', '#ff9fb2', '#f6f1e7']

/** Shelves of snacks, hanging strips of chip packets, drink crates and a cooler. */
function groceryShapes(openW: number, f: number): ShapeItem[] {
  const s: ShapeItem[] = []
  s.push({ box: [openW, 2.25, 0.06], at: [0, 1.125, f], color: '#f1dcc0' })
  let n = 0
  for (const y of [0.45, 0.95, 1.45]) {
    s.push({ box: [openW - 0.2, 0.05, 0.4], at: [0, y, f + 0.2], color: '#c49a6c' })
    for (let x = -openW / 2 + 0.3; x < openW / 2 - 0.2; x += 0.28) {
      const tall = n % 3 === 0
      s.push(
        tall
          ? { cyl: [0.07, 0.07, 0.28, 8], at: [x, y + 0.165, f + 0.2], color: GOODS[n % GOODS.length] }
          : { box: [0.2, 0.22, 0.14], at: [x, y + 0.135, f + 0.2], color: GOODS[n % GOODS.length] },
      )
      n++
    }
  }
  // Strips of snack packets hanging from a wire
  s.push({ cyl: [0.01, 0.01, openW, 4], at: [0, 2.2, f + 0.45], rot: [0, 0, Math.PI / 2], color: '#5d6170' })
  for (let i = 0; i < 6; i++) {
    const x = -openW / 2 + 0.35 + (i * (openW - 0.7)) / 5
    for (let k = 0; k < 4; k++) {
      s.push({ box: [0.16, 0.12, 0.03], at: [x, 2.08 - k * 0.14, f + 0.45], rot: [0, 0, (k % 2 ? 1 : -1) * 0.06], color: GOODS[(i + k * 3) % GOODS.length] })
    }
  }
  // Drink crates and a cooler on the step
  for (let i = 0; i < 3; i++) {
    const x = -openW / 2 + 0.3
    s.push({ box: [0.42, 0.26, 0.32], at: [x, 0.25 + i * 0.27, f + 0.62], color: i % 2 ? '#4f86d9' : '#d4473b' })
    for (let b = 0; b < 3; b++) s.push({ cyl: [0.035, 0.035, 0.06, 6], at: [x - 0.12 + b * 0.12, 0.41 + i * 0.27, f + 0.62], color: '#e9e2d0' })
  }
  s.push({ box: [0.72, 0.5, 0.46], at: [openW * 0.36, 0.37, f + 0.62], color: '#ffffff' })
  s.push({ box: [0.74, 0.07, 0.48], at: [openW * 0.36, 0.65, f + 0.62], color: '#4f86d9' })
  return s
}

const FLOOR_H = 2.8

/** A narrow, deep Vietnamese "nhà ống": shop-front ground floor, balconies above, water tank on the roof. */
function tubeHouseShapes(o: TubeHouseOptions): ShapeItem[] {
  // (grocery front replaces the dark doorway, shutter and stools below)
  const { width: w, depth: d, floors, palette: c } = o
  const H = floors * FLOOR_H
  const f = d / 2 // front face z
  const s: ShapeItem[] = []

  // Main block + roof parapet
  s.push({ box: [w, H, d], at: [0, H / 2, 0], color: c.wall })
  s.push({ box: [w + 0.12, 0.6, 0.2], at: [0, H + 0.3, f - 0.1], color: c.trim })
  s.push({ box: [w * 0.36, 0.32, 0.22], at: [0, H + 0.75, f - 0.1], color: c.trim })
  s.push({ cyl: [0.12, 0.12, 0.08, 10], at: [0, H + 0.75, f + 0.02], rot: [Math.PI / 2, 0, 0], color: c.accent })
  s.push({ box: [0.16, 0.45, d - 0.2], at: [-w / 2 + 0.08, H + 0.22, 0], color: c.trim })
  s.push({ box: [0.16, 0.45, d - 0.2], at: [w / 2 - 0.08, H + 0.22, 0], color: c.trim })
  s.push({ box: [w, 0.45, 0.16], at: [0, H + 0.22, -f + 0.08], color: c.trim })

  // Ground floor: open shop-front with a half-rolled shutter
  const openW = w * 0.78
  const sideW = (w - openW) / 2
  s.push({ box: [openW + 0.24, 0.4, 0.34], at: [0, 2.45, f + 0.17], color: c.shutter })
  if (o.grocery) {
    s.push(...groceryShapes(openW, f))
  } else {
    s.push({ box: [openW, 2.25, 0.06], at: [0, 1.125, f], color: P.darkInterior })
    s.push({ box: [openW, 0.72, 0.05], at: [0, 1.9, f + 0.06], color: c.shutter })
    for (let i = 0; i < 3; i++) {
      s.push({ box: [openW, 0.025, 0.02], at: [0, 1.66 + i * 0.22, f + 0.09], color: c.trim })
    }
  }
  s.push({ box: [sideW, 2.65, 0.1], at: [-(openW / 2 + sideW / 2), 1.325, f + 0.03], color: c.trim })
  s.push({ box: [sideW, 2.65, 0.1], at: [openW / 2 + sideW / 2, 1.325, f + 0.03], color: c.trim })
  s.push({ box: [openW + 0.3, 0.12, 0.6], at: [0, 0.06, f + 0.3], color: c.trim })
  // House number plate
  s.push({ box: [0.34, 0.24, 0.03], at: [openW / 2 + sideW / 2, 1.95, f + 0.1], color: '#5b8fdc' })
  s.push({ box: [0.2, 0.05, 0.02], at: [openW / 2 + sideW / 2, 1.95, f + 0.12], color: P.white })
  if (!o.grocery) {
    // A warm glimpse inside: stacked stools by the door
    s.push(place(stoolShapes(P.coral), [openW * 0.32, 0, f - 0.25]))
    s.push(place(stoolShapes(P.sky2), [openW * 0.32, 0.31, f - 0.25]))
  }

  // Upper floors: balcony, railing, glass door, louvred shutters, plants
  const doorW = w * 0.42
  for (let i = 1; i < floors; i++) {
    const y = i * FLOOR_H
    s.push({ box: [w + 0.12, 0.2, 0.14], at: [0, y, f + 0.05], color: c.trim })
    s.push({ box: [w - 0.1, 0.14, 0.9], at: [0, y + 0.02, f + 0.45], color: c.trim })

    const ry = y + 0.09
    const rz = f + 0.86
    s.push({ box: [w - 0.1, 0.07, 0.07], at: [0, ry + 0.9, rz], color: c.railing })
    for (const side of [-1, 1]) {
      s.push({ box: [0.07, 0.07, 0.86], at: [side * (w / 2 - 0.09), ry + 0.9, f + 0.45], color: c.railing })
      for (let b = 0; b < 3; b++) {
        s.push({ box: [0.035, 0.88, 0.035], at: [side * (w / 2 - 0.09), ry + 0.45, f + 0.15 + b * 0.25], color: c.railing })
      }
    }
    const bars = Math.max(4, Math.floor((w - 0.3) / 0.22))
    for (let b = 0; b <= bars; b++) {
      const bx = -w / 2 + 0.15 + b * ((w - 0.3) / bars)
      s.push({ box: [0.035, 0.88, 0.035], at: [bx, ry + 0.45, rz], color: c.railing })
    }

    s.push({ box: [doorW + 0.16, 2.16, 0.05], at: [0, y + 1.2, f + 0.01], color: c.trim })
    s.push({ box: [doorW, 2.0, 0.06], at: [0, y + 1.17, f + 0.02], color: P.glass })
    s.push({ box: [0.05, 2.0, 0.07], at: [0, y + 1.17, f + 0.03], color: c.trim })
    for (const side of [-1, 1]) {
      const sx = side * (doorW * 0.75 + 0.1)
      s.push({ box: [doorW / 2, 2.0, 0.06], at: [sx, y + 1.17, f + 0.03], color: c.shutter })
      for (let l = 0; l < 6; l++) {
        s.push({ box: [doorW / 2 - 0.1, 0.03, 0.02], at: [sx, y + 0.45 + l * 0.29, f + 0.065], color: c.trim })
      }
    }

    s.push(place(plantShapes(), [-w / 2 + 0.45, y + 0.09, f + 0.5], 0, 0.85))
    s.push(place(plantShapes(P.leafDark, c.accent), [w / 2 - 0.45, y + 0.09, f + 0.5], 0.6, 0.75))
  }

  const topY = (floors - 1) * FLOOR_H

  if (o.airCon) {
    const ax = w / 2 - 0.55
    s.push({ box: [0.72, 0.48, 0.28], at: [ax, topY + 2.5, f + 0.15], color: P.white })
    s.push({ cyl: [0.16, 0.16, 0.03, 12], at: [ax - 0.08, topY + 2.5, f + 0.3], rot: [Math.PI / 2, 0, 0], color: '#c5ccd6' })
  }

  if (o.bougainvillea) {
    const bx = -w / 2 + 0.6
    const bz = f + 0.86
    s.push({ ico: [0.45], at: [bx, topY + 1.1, bz], color: P.blossom })
    s.push({ ico: [0.38], at: [bx + 0.55, topY + 1.05, bz + 0.05], rot: [0.3, 0.5, 0], color: P.blossomLight })
    s.push({ ico: [0.3], at: [bx + 1.0, topY + 1.15, bz - 0.05], rot: [0.6, 0.2, 0], color: P.leaf })
    s.push({ ico: [0.33], at: [bx - 0.1, topY + 0.6, bz + 0.1], rot: [0.2, 0.9, 0.4], color: P.blossom })
    s.push({ ico: [0.28], at: [bx + 0.15, topY + 0.15, bz + 0.12], rot: [0.5, 0.1, 0.2], color: P.blossomLight })
    s.push({ ico: [0.22], at: [bx - 0.05, topY - 0.3, bz + 0.1], rot: [0.1, 0.4, 0.7], color: P.blossom })
  }

  if (o.roofTank) {
    // The classic stainless-steel water tank lying on a frame.
    const tx = w * 0.15
    const tz = -d * 0.2
    s.push({ cyl: [0.5, 0.5, 1.7, 14], at: [tx, H + 1.05, tz], rot: [0, 0, Math.PI / 2], color: P.steel })
    for (const side of [-1, 1]) {
      s.push({ cyl: [0.52, 0.52, 0.06, 14], at: [tx + side * 0.86, H + 1.05, tz], rot: [0, 0, Math.PI / 2], color: '#c9d2dc' })
      for (const zs of [-1, 1]) {
        s.push({ box: [0.08, 0.55, 0.08], at: [tx + side * 0.6, H + 0.28, tz + zs * 0.35], color: P.darkSteel })
      }
    }
    s.push({ box: [1.4, 0.06, 0.8], at: [tx, H + 0.56, tz], color: P.darkSteel })
    s.push(place(plantShapes(P.leaf, c.accent), [-w / 2 + 0.6, H, f - 0.8], 0, 1.1))
  }

  return s
}

export function TubeHouse({ position, sign, ...options }: TubeHouseProps) {
  const { width, depth, floors, palette, roofTank, bougainvillea, airCon, grocery } = options
  const shapes = useMemo(
    () => tubeHouseShapes({ width, depth, floors, palette, roofTank, bougainvillea, airCon, grocery }),
    [width, depth, floors, palette, roofTank, bougainvillea, airCon, grocery],
  )
  const height = floors * FLOOR_H

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <Shapes shapes={shapes} />
      {sign && <SignBoard options={sign} width={width * 0.78 + 0.2} position={[0, 2.45, depth / 2 + 0.35]} />}
      <CuboidCollider
        args={[width / 2, height / 2 + 0.4, depth / 2]}
        position={[0, height / 2 + 0.4, 0]}
        collisionGroups={BUILDING_GROUPS}
      />
    </RigidBody>
  )
}
