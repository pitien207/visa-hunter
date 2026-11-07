import { useEffect, useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../../data/config'
import { vertexColorMaterial } from './materials'

/**
 * Declarative low-poly primitives that get merged into ONE mesh with per-vertex colors.
 * A whole building = one draw call, which keeps mid-range phones at 60 fps.
 */

interface Transform {
  at?: Vec3
  rot?: Vec3
  scale?: Vec3
}

export type Shape = Transform & { color: string } & (
    | { box: Vec3 }
    /** [radiusTop, radiusBottom, height, radialSegments?] */
    | { cyl: [number, number, number, number?] }
    /** [radius, widthSegments?, heightSegments?, thetaLength?] — thetaLength < π gives a dome */
    | { sphere: [number, number?, number?, number?] }
    /** [radius, detail?] — detail 0 gives a faceted low-poly blob */
    | { ico: [number, number?] }
    /** [radius, tube, radialSegments?, tubularSegments?, arc?] */
    | { torus: [number, number, number?, number?, number?] }
    /** Any custom geometry (it is cloned, the original is not modified). */
    | { geometry: BufferGeometry }
  )

/** A nested group of shapes with its own transform (e.g. a tree placed in the world). */
export interface ShapeGroup extends Transform {
  group: ShapeItem[]
}

export type ShapeItem = Shape | ShapeGroup

function baseGeometry(s: Shape): BufferGeometry {
  if ('box' in s) return new BoxGeometry(...s.box)
  if ('cyl' in s) {
    const [top, bottom, height, segments = 10] = s.cyl
    return new CylinderGeometry(top, bottom, height, segments)
  }
  if ('sphere' in s) {
    const [radius, w = 16, h = 12, theta = Math.PI] = s.sphere
    return new SphereGeometry(radius, w, h, 0, Math.PI * 2, 0, theta)
  }
  if ('ico' in s) {
    const [radius, detail = 0] = s.ico
    return new IcosahedronGeometry(radius, detail)
  }
  if ('torus' in s) {
    const [radius, tube, radial = 6, tubular = 16, arc = Math.PI * 2] = s.torus
    return new TorusGeometry(radius, tube, radial, tubular, arc)
  }
  return s.geometry.clone()
}

const _euler = new Euler()
const _quat = new Quaternion()
const _pos = new Vector3()
const _scale = new Vector3()
const _color = new Color()

function localMatrix(t: Transform, out: Matrix4) {
  _euler.set(...(t.rot ?? [0, 0, 0]))
  _quat.setFromEuler(_euler)
  _pos.set(...(t.at ?? [0, 0, 0]))
  _scale.set(...(t.scale ?? [1, 1, 1]))
  return out.compose(_pos, _quat, _scale)
}

function collect(items: ShapeItem[], parent: Matrix4, out: BufferGeometry[]) {
  for (const item of items) {
    const matrix = new Matrix4().multiplyMatrices(parent, localMatrix(item, new Matrix4()))
    if ('group' in item) {
      collect(item.group, matrix, out)
      continue
    }
    let g = baseGeometry(item)
    // Non-indexed everywhere so all parts are merge-compatible (icosahedrons are non-indexed).
    if (g.index) {
      const flat = g.toNonIndexed()
      g.dispose()
      g = flat
    }
    g.applyMatrix4(matrix)
    _color.set(item.color) // sRGB hex → linear, matching material colors
    const count = g.attributes.position.count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = _color.r
      colors[i * 3 + 1] = _color.g
      colors[i * 3 + 2] = _color.b
    }
    g.setAttribute('color', new Float32BufferAttribute(colors, 3))
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'color') g.deleteAttribute(name)
    }
    out.push(g)
  }
}

export function buildShapes(items: ShapeItem[]): BufferGeometry {
  const parts: BufferGeometry[] = []
  collect(items, new Matrix4(), parts)
  const merged = parts.length > 0 ? mergeGeometries(parts, false) : new BufferGeometry()
  for (const p of parts) p.dispose()
  if (!merged) throw new Error('Shapes: failed to merge geometries')
  merged.computeBoundingSphere()
  return merged
}

type MeshProps = Omit<ThreeElements['mesh'], 'geometry' | 'material' | 'children'>

export interface ShapesProps extends MeshProps {
  shapes: ShapeItem[]
  material?: Material
}

/** Renders a list of shapes as a single merged mesh. Pass a stable (memoized) `shapes` array. */
export function Shapes({ shapes, material = vertexColorMaterial, castShadow = true, receiveShadow = true, ...props }: ShapesProps) {
  const geometry = useMemo(() => buildShapes(shapes), [shapes])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh {...props} geometry={geometry} material={material} castShadow={castShadow} receiveShadow={receiveShadow} />
  )
}
