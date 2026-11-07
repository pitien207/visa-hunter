import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { MeshLambertMaterial, type Group, type Material, type Mesh } from 'three'
import type { Vec3 } from '../../../data/config'
import { BUILDING_GROUPS } from '../../systems/collisionGroups'
import { playerState } from '../../systems/playerState'
import { glowMaterial, shadowOnlyMaterial, withOcclusionFade } from '../shared/materials'
import { PALETTE as P } from '../shared/palette'
import { cafeTableSetShapes, place, plantShapes } from '../shared/props'
import { Shapes, type ShapeItem } from '../shared/Shapes'
import { makeSignTexture, makeStripeTexture, SIGN_FONT_FAMILY } from '../shared/textures'
import { CAFE_INTERIOR } from './layout'

const W = 7 // width
const D = 6 // depth of the open hall
const H = 3.2 // wall height
const STORE_D = 2.5 // closed storeroom behind the hall
const F = D / 2 // front face z
const WALL = '#bfe8d7'
const TRIM = P.cream

const AWNING_TILT = 0.35
const AWNING_LEN = 1.5
const AWNING_TOP_Y = 2.78

const { counter: COUNTER, fridge: FRIDGE, indoorTable: TABLE, inner: INNER } = CAFE_INTERIOR

function cafeShapes(): ShapeItem[] {
  const s: ShapeItem[] = []

  // Shell: floor, back + side walls, front beam, storeroom (the roof is separate, see CafeRoof)
  s.push({ box: [W - 0.4, 0.03, D - 0.2], at: [0, 0.015, 0.05], color: '#f8efe2' })
  s.push({ box: [W, H, 0.25], at: [0, H / 2, -F + 0.125], color: WALL })
  for (const side of [-1, 1]) {
    s.push({ box: [0.25, H, D], at: [side * (W / 2 - 0.125), H / 2, 0], color: WALL })
    s.push({ box: [0.45, H - 0.7, 0.32], at: [side * (W / 2 - 0.22), (H - 0.7) / 2, F - 0.12], color: TRIM })
  }
  s.push({ box: [W, 0.7, 0.3], at: [0, H - 0.35, F - 0.15], color: WALL })
  s.push({ box: [W + 0.1, 0.1, 0.36], at: [0, H - 0.72, F - 0.12], color: TRIM })
  s.push({ box: [W, 2.8, STORE_D], at: [0, 1.4, -F - STORE_D / 2], color: '#a9dcc7' })
  s.push({ box: [W + 0.2, 0.2, STORE_D + 0.1], at: [0, 2.9, -F - STORE_D / 2], color: TRIM })

  // Counter with espresso machine, register and a cookie jar
  const { x: cx, z: cz } = COUNTER
  s.push({ box: [COUNTER.w, 1.0, COUNTER.d], at: [cx, 0.5, cz], color: P.wood })
  s.push({ box: [COUNTER.w - 0.2, 0.5, 0.02], at: [cx, 0.55, cz + COUNTER.d / 2 + 0.01], color: P.woodDark })
  s.push({ box: [COUNTER.w + 0.2, 0.08, COUNTER.d + 0.15], at: [cx, 1.04, cz], color: TRIM })
  s.push({ box: [0.7, 0.48, 0.42], at: [cx + 0.9, 1.32, cz - 0.08], color: P.coral })
  s.push({ box: [0.72, 0.06, 0.44], at: [cx + 0.9, 1.59, cz - 0.08], color: P.steel })
  s.push({ cyl: [0.05, 0.05, 0.12, 8], at: [cx + 0.75, 1.18, cz + 0.15], color: P.darkSteel })
  s.push({ cyl: [0.05, 0.05, 0.12, 8], at: [cx + 1.05, 1.18, cz + 0.15], color: P.darkSteel })
  s.push({ cyl: [0.045, 0.04, 0.08, 8], at: [cx + 0.75, 1.12, cz + 0.22], color: P.white })
  s.push({ box: [0.4, 0.22, 0.32], at: [cx - 1.1, 1.19, cz], color: P.lilac })
  s.push({ box: [0.3, 0.12, 0.04], at: [cx - 1.1, 1.36, cz - 0.1], rot: [-0.4, 0, 0], color: P.darkSteel })
  s.push({ cyl: [0.12, 0.12, 0.26, 10], at: [cx - 0.3, 1.21, cz], color: P.glass })
  s.push({ cyl: [0.13, 0.13, 0.04, 10], at: [cx - 0.3, 1.36, cz], color: P.coral })

  // Back wall: shelves with jars + chalk menu
  const shelfZ = -F + 0.43
  for (const y of [1.7, 2.25]) {
    s.push({ box: [3.2, 0.06, 0.36], at: [cx, y, shelfZ], color: P.woodDark })
    const jars = [P.butter, P.coffee, P.mint, P.rose, P.peach, P.sky2, P.coffee]
    jars.forEach((color, i) => {
      s.push({ cyl: [0.08, 0.08, 0.22, 8], at: [cx - 1.35 + i * 0.45, y + 0.14, shelfZ], color })
    })
  }
  s.push({ box: [1.6, 1.0, 0.05], at: [-2.0, 2.05, -F + 0.27], color: '#4f6360' })
  for (let i = 0; i < 4; i++) {
    s.push({ box: [1.0 - (i % 2) * 0.3, 0.05, 0.02], at: [-2.1, 2.35 - i * 0.2, -F + 0.3], color: P.white })
  }

  // Drinks fridge
  const { x: fx, z: fz } = FRIDGE
  s.push({ box: [0.9, 1.9, 0.7], at: [fx, 0.95, fz], color: P.white })
  s.push({ box: [0.74, 1.5, 0.02], at: [fx, 1.05, fz + 0.36], color: P.glass })
  for (let r = 0; r < 3; r++) {
    for (let b = 0; b < 4; b++) {
      s.push({
        cyl: [0.05, 0.05, 0.24, 6],
        at: [fx - 0.25 + b * 0.17, 0.55 + r * 0.45, fz + 0.3],
        color: [P.coral, P.butter, P.mint, P.sky2][(r + b) % 4],
      })
    }
  }

  // Pendant lamps
  for (const lx of [-1.8, 0, 1.8]) {
    s.push({ cyl: [0.01, 0.01, 0.55, 4], at: [lx, H - 0.27, -0.3], color: P.darkSteel })
    s.push({ cyl: [0.05, 0.24, 0.2, 10], at: [lx, H - 0.62, -0.3], color: P.butter })
  }

  s.push(place(cafeTableSetShapes([P.butter, P.mint]), [TABLE.x, 0, TABLE.z]))
  s.push(place(plantShapes(P.leaf, P.mint), [-W / 2 + 0.55, 0, F - 0.6], 0, 1.15))
  s.push(place(plantShapes(P.leafDark, P.peach), [W / 2 - 0.55, 0, F - 0.6], 0.8, 1.15))

  // Chalkboard A-frame stand out front
  s.push({ box: [0.6, 0.85, 0.04], at: [W / 2 - 0.9, 0.42, F + 0.75], rot: [-0.2, 0, 0], color: '#4f6360' })
  s.push({ box: [0.6, 0.85, 0.04], at: [W / 2 - 0.9, 0.42, F + 0.42], rot: [0.2, 0, 0], color: P.woodDark })
  s.push({ box: [0.4, 0.04, 0.02], at: [W / 2 - 0.9, 0.6, F + 0.79], rot: [-0.2, 0, 0], color: P.butter })
  s.push({ box: [0.3, 0.04, 0.02], at: [W / 2 - 0.9, 0.45, F + 0.82], rot: [-0.2, 0, 0], color: P.white })

  return s
}

/** Roof slab + sign board: hidden (but still shadow-casting) while the player is inside. */
function roofShapes(): ShapeItem[] {
  return [
    { box: [W + 0.3, 0.25, D + 0.3], at: [0, H + 0.125, 0], color: TRIM },
    { box: [3.9, 1.1, 0.12], at: [0, H + 0.82, F - 0.12], color: TRIM },
    { box: [0.12, 0.5, 0.12], at: [-1.6, H + 0.25, F - 0.25], color: P.darkSteel },
    { box: [0.12, 0.5, 0.12], at: [1.6, H + 0.25, F - 0.25], color: P.darkSteel },
  ]
}

/**
 * Cut-away roof: when the player walks inside, roof meshes switch to a material that
 * draws nothing but still casts shadows, so the interior stays visible and lit the same.
 */
function CafeRoof({ origin, signMaterial, awningMaterial }: { origin: Vec3; signMaterial: Material; awningMaterial: Material }) {
  const shapes = useMemo(roofShapes, [])
  const bulbs = useMemo(bulbShapes, [])
  const awningZ = F + (AWNING_LEN / 2) * Math.cos(AWNING_TILT)
  const awningY = AWNING_TOP_Y - (AWNING_LEN / 2) * Math.sin(AWNING_TILT)
  const valanceZ = F + AWNING_LEN * Math.cos(AWNING_TILT) + 0.02
  const valanceY = AWNING_TOP_Y - AWNING_LEN * Math.sin(AWNING_TILT) - 0.13
  const group = useRef<Group>(null)
  const hidden = useRef(false)
  const originals = useRef(new Map<Mesh, Material | Material[]>())

  useFrame(() => {
    const g = group.current
    if (!g) return
    const lx = playerState.position.x - origin[0]
    const lz = playerState.position.z - origin[2]
    const inside = Math.abs(lx) <= INNER.halfX && lz >= INNER.minZ && lz <= INNER.maxZ
    if (inside === hidden.current) return
    hidden.current = inside
    g.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh) return
      if (inside) {
        originals.current.set(mesh, mesh.material)
        mesh.material = shadowOnlyMaterial
      } else {
        mesh.material = originals.current.get(mesh) ?? mesh.material
      }
    })
  })

  return (
    <group ref={group}>
      <Shapes shapes={shapes} />
      <mesh position={[0, H + 0.82, F - 0.05]} material={signMaterial}>
        <planeGeometry args={[3.7, 0.925]} />
      </mesh>
      {/* The awning would block the view into the café too, so it cuts away with the roof. */}
      <mesh position={[0, awningY, awningZ]} rotation-x={AWNING_TILT} material={awningMaterial} castShadow receiveShadow>
        <boxGeometry args={[W + 0.3, 0.04, AWNING_LEN]} />
      </mesh>
      <mesh position={[0, valanceY, valanceZ]} material={awningMaterial} castShadow>
        <boxGeometry args={[W + 0.3, 0.26, 0.03]} />
      </mesh>
      <Shapes shapes={bulbs} material={glowMaterial} castShadow={false} receiveShadow={false} />
    </group>
  )
}

/** Warm string lights hanging from the awning edge. */
function bulbShapes(): ShapeItem[] {
  const s: ShapeItem[] = []
  const colors = [P.butter, P.peach, P.mint, P.rose]
  const frontZ = F + AWNING_LEN * Math.cos(AWNING_TILT) + 0.04
  const y = AWNING_TOP_Y - AWNING_LEN * Math.sin(AWNING_TILT) - 0.38
  const count = 13
  for (let i = 0; i < count; i++) {
    const x = -W / 2 + 0.25 + (i * (W - 0.5)) / (count - 1)
    const sag = Math.sin(((i % 4) / 4) * Math.PI) * 0.08
    s.push({ sphere: [0.065, 8, 6], at: [x, y - sag, frontZ], color: colors[i % colors.length] })
  }
  return s
}

function useCafeTextures() {
  const textures = useMemo(() => {
    const sign = makeSignTexture({
      title: 'CÀ PHÊ',
      subtitle: 'Sữa đá · Bạc xỉu · Muối',
      background: P.white,
      border: P.coral,
      color: '#7a4e3a',
      accent: '#d9786b',
    })
    const stripes = makeStripeTexture([P.coral, P.white], 14)
    return {
      sign,
      signMaterial: withOcclusionFade(new MeshLambertMaterial({ map: sign.texture })),
      awningMaterial: withOcclusionFade(new MeshLambertMaterial({ map: stripes })),
    }
  }, [])

  useEffect(() => {
    // Redraw once the rounded web font is available (first draw may use a fallback).
    let cancelled = false
    document.fonts?.load(`800 118px ${SIGN_FONT_FAMILY}`).then(() => {
      if (!cancelled) textures.sign.redraw()
    })
    return () => {
      cancelled = true
      textures.signMaterial.map?.dispose()
      textures.signMaterial.dispose()
      textures.awningMaterial.map?.dispose()
      textures.awningMaterial.dispose()
    }
  }, [textures])

  return textures
}

export function Cafe({ position }: { position: Vec3 }) {
  const shapes = useMemo(cafeShapes, [])
  const { signMaterial, awningMaterial } = useCafeTextures()

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <Shapes shapes={shapes} />
      <CafeRoof origin={position} signMaterial={signMaterial} awningMaterial={awningMaterial} />

      {/* Walls + storeroom block the camera; the roof just fades (see occlusion in materials.ts). */}
      <CuboidCollider
        args={[W / 2, H / 2, (STORE_D + 0.25) / 2]}
        position={[0, H / 2, -F - STORE_D / 2 + 0.125]}
        collisionGroups={BUILDING_GROUPS}
      />
      <CuboidCollider args={[0.125, H / 2, D / 2]} position={[-(W / 2 - 0.125), H / 2, 0]} collisionGroups={BUILDING_GROUPS} />
      <CuboidCollider args={[0.125, H / 2, D / 2]} position={[W / 2 - 0.125, H / 2, 0]} collisionGroups={BUILDING_GROUPS} />
      <CuboidCollider args={[COUNTER.w / 2 + 0.1, 0.55, COUNTER.d / 2 + 0.08]} position={[COUNTER.x, 0.55, COUNTER.z]} />
      <CuboidCollider args={[0.45, 0.95, 0.35]} position={[FRIDGE.x, 0.95, FRIDGE.z]} />
      <CylinderCollider args={[0.4, 0.75]} position={[TABLE.x, 0.4, TABLE.z]} />
    </RigidBody>
  )
}
