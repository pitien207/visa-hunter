import type { Vec3 } from '../../../data/config'
import { PALETTE as P } from './palette'
import type { ShapeGroup, ShapeItem } from './Shapes'

/**
 * Reusable low-poly prop recipes. Each returns shapes in local space
 * (origin on the ground, facing +Z); place them with `place()`.
 */

export function place(group: ShapeItem[], at: Vec3, rotY = 0, scale = 1): ShapeGroup {
  return { group, at, rot: [0, rotY, 0], scale: [scale, scale, scale] }
}

export type TreeVariant = 'green' | 'blossom' | 'linden'

export function treeShapes(variant: TreeVariant = 'green'): ShapeItem[] {
  const [main, light, dark] =
    variant === 'blossom'
      ? [P.blossom, P.blossomLight, P.leaf]
      : variant === 'linden'
        ? ['#7cb87a', '#9ccf8a', '#5fa06a']
        : [P.leaf, P.leafLight, P.leafDark]
  return [
    { cyl: [0.12, 0.17, 1.5, 7], at: [0, 0.75, 0], color: P.trunk },
    { cyl: [0.05, 0.07, 0.6, 5], at: [0.18, 1.3, 0], rot: [0, 0, -0.7], color: P.trunk },
    { ico: [0.95], at: [0, 2.05, 0], color: main },
    { ico: [0.65], at: [0.55, 2.35, 0.25], rot: [0.4, 0.3, 0], color: light },
    { ico: [0.6], at: [-0.5, 2.3, -0.25], rot: [0.2, 0.8, 0.1], color: dark },
    { ico: [0.5], at: [0.05, 2.75, -0.1], rot: [0.6, 0.1, 0.3], color: light },
  ]
}

export function plantShapes(leaf: string = P.leaf, pot: string = P.terracotta): ShapeItem[] {
  return [
    { cyl: [0.22, 0.16, 0.36, 10], at: [0, 0.18, 0], color: pot },
    { cyl: [0.24, 0.24, 0.06, 10], at: [0, 0.36, 0], color: pot },
    { ico: [0.3], at: [0, 0.6, 0], color: leaf },
    { ico: [0.2], at: [0.12, 0.8, 0.05], rot: [0.5, 0.2, 0], color: P.leafLight },
  ]
}

/** A cute scooter-style motorbike — the most Vietnamese street prop there is. */
export function motorbikeShapes(color: string): ShapeItem[] {
  const tire = '#4a4856'
  return [
    { torus: [0.21, 0.08, 6, 14], at: [0, 0.29, -0.5], rot: [0, Math.PI / 2, 0], color: tire },
    { torus: [0.21, 0.08, 6, 14], at: [0, 0.29, 0.55], rot: [0, Math.PI / 2, 0], color: tire },
    { cyl: [0.09, 0.09, 0.14, 8], at: [0, 0.29, -0.5], rot: [0, 0, Math.PI / 2], color: P.steel },
    { cyl: [0.09, 0.09, 0.14, 8], at: [0, 0.29, 0.55], rot: [0, 0, Math.PI / 2], color: P.steel },
    { sphere: [0.4, 14, 10], at: [0, 0.6, -0.25], scale: [0.48, 0.5, 1.0], color },
    { box: [0.3, 0.07, 0.5], at: [0, 0.4, 0.2], color: '#6b6878' },
    { box: [0.34, 0.62, 0.12], at: [0, 0.68, 0.46], rot: [-0.25, 0, 0], color },
    { sphere: [0.2, 12, 8], at: [0, 0.82, -0.22], scale: [0.62, 0.3, 1.45], color: '#6a4a40' },
    { cyl: [0.035, 0.035, 0.42, 6], at: [0, 1.0, 0.56], rot: [-0.25, 0, 0], color },
    { cyl: [0.028, 0.028, 0.62, 6], at: [0, 1.18, 0.6], rot: [0, 0, Math.PI / 2], color: P.darkSteel },
    { sphere: [0.085, 10, 8], at: [0, 1.12, 0.7], color: '#fff6c8' },
    { sphere: [0.05, 8, 6], at: [0.22, 1.32, 0.56], color: P.steel },
    { sphere: [0.05, 8, 6], at: [-0.22, 1.32, 0.56], color: P.steel },
  ]
}

/** Tiny plastic stool, the iconic sidewalk café seat. */
export function stoolShapes(color: string): ShapeItem[] {
  return [
    { cyl: [0.17, 0.2, 0.05, 12], at: [0, 0.3, 0], color },
    { cyl: [0.15, 0.2, 0.27, 12], at: [0, 0.14, 0], color },
  ]
}

/** Low table + four stools + two iced coffees. */
export function cafeTableSetShapes(stoolColors: string[]): ShapeItem[] {
  const items: ShapeItem[] = [
    { cyl: [0.42, 0.42, 0.05, 16], at: [0, 0.5, 0], color: P.steel },
    { cyl: [0.05, 0.05, 0.46, 6], at: [0, 0.25, 0], color: P.darkSteel },
    { cyl: [0.22, 0.22, 0.03, 10], at: [0, 0.02, 0], color: P.darkSteel },
    // cà phê sữa đá: glass + coffee + straw
    { cyl: [0.055, 0.045, 0.16, 8], at: [0.15, 0.6, 0.05], color: P.coffee },
    { cyl: [0.01, 0.01, 0.12, 4], at: [0.17, 0.72, 0.05], rot: [0, 0, -0.25], color: P.rose },
    { cyl: [0.055, 0.045, 0.16, 8], at: [-0.12, 0.6, -0.12], color: P.coffee },
    { cyl: [0.01, 0.01, 0.12, 4], at: [-0.1, 0.72, -0.12], rot: [0, 0, -0.25], color: P.mint },
  ]
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    items.push(place(stoolShapes(stoolColors[i % stoolColors.length]), [Math.sin(a) * 0.68, 0, Math.cos(a) * 0.68]))
  }
  return items
}

export function benchShapes(color: string = P.mint): ShapeItem[] {
  return [
    { box: [1.6, 0.08, 0.45], at: [0, 0.45, 0], color },
    { box: [1.6, 0.4, 0.07], at: [0, 0.75, -0.2], rot: [-0.15, 0, 0], color },
    { box: [0.08, 0.45, 0.4], at: [-0.7, 0.22, 0], color: P.darkSteel },
    { box: [0.08, 0.45, 0.4], at: [0.7, 0.22, 0], color: P.darkSteel },
  ]
}

/** Striped road barrier (marks the edge of the playable area). */
export function barrierShapes(width: number): ShapeItem[] {
  const items: ShapeItem[] = [
    { box: [0.12, 0.9, 0.12], at: [-width / 2 + 0.1, 0.45, 0], color: P.darkSteel },
    { box: [0.12, 0.9, 0.12], at: [width / 2 - 0.1, 0.45, 0], color: P.darkSteel },
  ]
  const segments = Math.max(2, Math.round(width / 0.5))
  const segment = width / segments
  for (let i = 0; i < segments; i++) {
    items.push({
      box: [segment, 0.22, 0.08],
      at: [-width / 2 + segment * (i + 0.5), 0.72, 0],
      color: i % 2 === 0 ? P.coral : P.white,
    })
  }
  return items
}

export function coneShapes(): ShapeItem[] {
  return [
    { box: [0.4, 0.05, 0.4], at: [0, 0.025, 0], color: P.coral },
    { cyl: [0.04, 0.16, 0.55, 10], at: [0, 0.3, 0], color: P.coral },
    { cyl: [0.105, 0.125, 0.1, 10], at: [0, 0.3, 0], color: P.white },
  ]
}

/** A small, round European hatchback (faces +Z). */
export function carShapes(color: string): ShapeItem[] {
  const tire = '#3d3d48'
  const s: ShapeItem[] = [
    { box: [1.1, 0.5, 2.3], at: [0, 0.48, 0], color },
    { box: [1.0, 0.46, 1.25], at: [0, 0.94, -0.15], color: '#a9c8dc' },
    { box: [1.02, 0.07, 1.2], at: [0, 1.19, -0.15], color },
    { box: [1.12, 0.12, 0.12], at: [0, 0.32, 1.17], color: '#dfe6ee' },
    { box: [1.12, 0.12, 0.12], at: [0, 0.32, -1.17], color: '#dfe6ee' },
    { sphere: [0.09, 8, 6], at: [-0.38, 0.55, 1.16], color: '#fff6c8' },
    { sphere: [0.09, 8, 6], at: [0.38, 0.55, 1.16], color: '#fff6c8' },
    { box: [0.2, 0.08, 0.04], at: [-0.38, 0.55, -1.17], color: '#ff6b5e' },
    { box: [0.2, 0.08, 0.04], at: [0.38, 0.55, -1.17], color: '#ff6b5e' },
  ]
  for (const x of [-0.55, 0.55]) for (const z of [-0.75, 0.75]) s.push({ torus: [0.2, 0.1, 6, 14], at: [x, 0.3, z], rot: [0, Math.PI / 2, 0], color: tire })
  return s
}

/** A city bicycle with a basket (faces +Z). */
export function bicycleShapes(color: string): ShapeItem[] {
  return [
    { torus: [0.3, 0.035, 5, 16], at: [0, 0.34, -0.48], rot: [0, Math.PI / 2, 0], color: '#3d3d48' },
    { torus: [0.3, 0.035, 5, 16], at: [0, 0.34, 0.5], rot: [0, Math.PI / 2, 0], color: '#3d3d48' },
    { cyl: [0.025, 0.025, 0.9, 5], at: [0, 0.55, 0.02], rot: [Math.PI / 2 - 0.35, 0, 0], color },
    { cyl: [0.025, 0.025, 0.6, 5], at: [0, 0.6, -0.3], rot: [0.5, 0, 0], color },
    { cyl: [0.025, 0.025, 0.5, 5], at: [0, 0.75, 0.45], rot: [-0.3, 0, 0], color },
    { cyl: [0.02, 0.02, 0.5, 5], at: [0, 1.0, 0.52], rot: [0, 0, Math.PI / 2], color: '#4a4a55' },
    { box: [0.18, 0.06, 0.28], at: [0, 0.92, -0.22], color: '#6a4a40' },
    { box: [0.32, 0.22, 0.26], at: [0, 0.82, 0.78], color: '#d9b46b' },
  ]
}
