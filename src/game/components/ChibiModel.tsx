import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PLAYER_OUTFIT, type Outfit } from '../../data/npcs'
import { solidMaterial } from '../scenes/shared/materials'
import { Shapes, type ShapeItem } from '../scenes/shared/Shapes'
import { damp } from '../systems/math'

/**
 * Written by the owner each frame; read here to drive the animation.
 * Optional fields are pose targets (0–1); the model eases toward them.
 */
export interface MotionState {
  /** 0 = standing still, 1 = full walking cadence. */
  speed: number
  /** Sitting (on a stool, a motorbike…). */
  sit?: number
  /** Height of the seat surface when sitting (default: a tiny plastic stool). */
  seatY?: number
  /** Right hand to the mouth (drinking). */
  sip?: number
  /** Fanning with the right hand. */
  fan?: number
  /** Both arms forward (handlebars). */
  arms?: number
  /** Left-leg kick (đá cầu). */
  kick?: number
  held?: 'glass' | 'fan' | null
}

/**
 * Chibi proportions (plan §2): the head is ~45% of total height (~1.5 m).
 * Each body part is one merged mesh, so a character is ~7 draw calls.
 */

const HEAD_Y = 1.08
const EYE_Y = -0.02
const TORSO_Y = 0.52
const HIP_Y = 0.3
const SHOULDER_Y = 0.66
const STOOL_Y = 0.33

const EYE = '#2d2430'
const CHEEK = '#ffa3b1'
const MOUTH = '#c95b6e'
const WHITE = '#ffffff'

function hairShapes(o: Outfit): ShapeItem[] {
  switch (o.hairStyle) {
    case 'short':
      return [
        { sphere: [0.375, 28, 20], at: [0, 0.095, -0.065], color: o.hair },
        { cyl: [0, 0.05, 0.16, 6], at: [-0.06, 0.46, 0.02], rot: [0.3, 0, 0.4], color: o.hair },
        { cyl: [0, 0.05, 0.16, 6], at: [0.07, 0.46, 0.0], rot: [0.2, 0, -0.5], color: o.hair },
      ]
    case 'bun':
      return [
        { sphere: [0.385, 28, 20], at: [0, 0.065, -0.04], color: o.hair },
        { sphere: [0.14, 16, 12], at: [0, 0.36, -0.24], color: o.hair },
        { torus: [0.09, 0.025, 6, 14], at: [0, 0.29, -0.2], rot: [0.9, 0, 0], color: CHEEK },
      ]
    case 'bob':
    default:
      // A slightly bigger sphere shifted up/back leaves the face uncovered.
      return [
        { sphere: [0.385, 28, 20], at: [0, 0.065, -0.04], color: o.hair },
        { cyl: [0, 0.05, 0.18, 6], at: [0.05, 0.47, 0.0], rot: [0.2, 0, -0.5], color: o.hair },
      ]
  }
}

function accessoryShapes(o: Outfit): ShapeItem[] {
  switch (o.accessory) {
    case 'nonLa': // Vietnamese conical hat
      return [
        { cyl: [0.02, 0.6, 0.34, 18], at: [0, 0.5, -0.02], color: '#f2d79c' },
        { torus: [0.58, 0.012, 4, 24], at: [0, 0.34, -0.02], rot: [Math.PI / 2, 0, 0], color: '#d9b878' },
      ]
    case 'glasses':
      return [
        { torus: [0.075, 0.012, 6, 16], at: [-0.125, -0.02, 0.35], color: '#4a3b4a' },
        { torus: [0.075, 0.012, 6, 16], at: [0.125, -0.02, 0.35], color: '#4a3b4a' },
        { box: [0.1, 0.018, 0.018], at: [0, -0.005, 0.36], color: '#4a3b4a' },
      ]
    case 'beanie': // German Mütze with a pompom
      return [
        { sphere: [0.405, 24, 12, Math.PI / 2], at: [0, 0.1, -0.03], rot: [-0.18, 0, 0], color: o.accent ?? '#d4473b' },
        { torus: [0.37, 0.045, 6, 24], at: [0, 0.13, -0.01], rot: [Math.PI / 2 - 0.18, 0, 0], color: '#fff6e3' },
        { sphere: [0.09, 10, 8], at: [0, 0.53, -0.1], color: '#fff6e3' },
      ]
    case 'helmet': // half-dome motorbike helmet
      return [
        { sphere: [0.415, 24, 12, Math.PI / 2], at: [0, 0.06, -0.03], rot: [-0.22, 0, 0], color: o.accent ?? '#ff9b8f' },
        { box: [0.34, 0.03, 0.12], at: [0, 0.16, 0.36], rot: [-0.35, 0, 0], color: '#5d6170' },
      ]
    default:
      return []
  }
}

const GLASS: ShapeItem[] = [
  { cyl: [0.055, 0.045, 0.15, 10], at: [0, 0.06, 0], color: '#d8a24e' },
  { cyl: [0.058, 0.058, 0.02, 10], at: [0, 0.135, 0], color: '#f6e7c8' },
]
const FAN: ShapeItem[] = [
  { cyl: [0.012, 0.012, 0.14, 5], at: [0, 0.05, 0], color: '#b98a64' },
  { cyl: [0.16, 0.16, 0.012, 14], at: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.75], color: '#ff9b8f' },
]

/** Đòn gánh: a bamboo pole on the right shoulder with a basket of bánh mì at each end. */
const POLE: ShapeItem[] = (() => {
  const s: ShapeItem[] = [{ cyl: [0.025, 0.025, 1.75, 6], at: [-0.22, 0.27, 0], rot: [Math.PI / 2, 0, 0], color: '#d9b878' }]
  for (const end of [-0.82, 0.82]) {
    s.push({ cyl: [0.006, 0.006, 0.48, 4], at: [-0.22, 0.03, end], color: '#7a6a5a' })
    s.push({ cyl: [0.25, 0.18, 0.2, 12], at: [-0.22, -0.28, end], color: '#d9b46b' })
    s.push({ cyl: [0.26, 0.26, 0.03, 12], at: [-0.22, -0.18, end], color: '#c49a55' })
    for (let i = 0; i < 3; i++) {
      s.push({ sphere: [0.07, 8, 6], at: [-0.22 + (i - 1) * 0.11, -0.13, end + (i % 2) * 0.05], scale: [1, 0.8, 2.2], rot: [0, 0.6 * i, 0], color: '#e8a25a' })
    }
  }
  return s
})()

function buildChibi(o: Outfit) {
  const head: ShapeItem[] = [
    { sphere: [0.36, 28, 20], color: o.skin },
    ...hairShapes(o),
    ...accessoryShapes(o),
    { sphere: [0.06, 12, 8], at: [-0.2, -0.1, 0.268], rot: [0, -0.62, 0], scale: [1, 0.6, 0.3], color: CHEEK },
    { sphere: [0.06, 12, 8], at: [0.2, -0.1, 0.268], rot: [0, 0.62, 0], scale: [1, 0.6, 0.3], color: CHEEK },
    { torus: [0.035, 0.009, 6, 12, Math.PI], at: [0, -0.115, 0.336], rot: [0, 0, Math.PI], color: MOUTH },
  ]

  // Eyes are separate so they can blink. Origin sits at eye height.
  const eyes: ShapeItem[] = [-1, 1].flatMap(
    (side): ShapeItem[] => [
      { sphere: [0.048, 12, 10], at: [side * 0.125, 0, 0.325], scale: [1, 1.15, 0.55], color: EYE },
      { sphere: [0.016, 8, 6], at: [side * 0.125 + 0.016, 0.02, 0.35], color: WHITE },
    ],
  )

  const torso: ShapeItem[] = [
    { sphere: [0.25, 20, 14], scale: [1, 1.1, 0.85], color: o.shirt },
    { sphere: [0.23, 20, 14], at: [0, -0.15, 0], scale: [1, 0.75, 0.85], color: o.shorts },
  ]
  if (o.bag) {
    torso.push(
      { sphere: [0.2, 14, 10], at: [0, 0.03, -0.2], scale: [0.85, 1, 0.5], color: o.bag },
      { sphere: [0.12, 12, 8], at: [0, -0.06, -0.28], scale: [1, 0.6, 0.4], color: WHITE },
      { torus: [0.2, 0.025, 4, 12, Math.PI], at: [-0.13, 0.03, -0.02], rot: [0, Math.PI / 2, 0], scale: [1, 1.1, 1.05], color: o.bag },
      { torus: [0.2, 0.025, 4, 12, Math.PI], at: [0.13, 0.03, -0.02], rot: [0, Math.PI / 2, 0], scale: [1, 1.1, 1.05], color: o.bag },
    )
  }

  const leg: ShapeItem[] = [
    { cyl: [0.075, 0.07, 0.2, 10], at: [0, -0.1, 0], color: o.skin },
    { sphere: [0.1, 12, 8], at: [0, -0.245, 0.03], scale: [0.9, 0.6, 1.25], color: o.shoe },
  ]

  const arm: ShapeItem[] = [
    { sphere: [0.085, 12, 8], at: [0, -0.02, 0], color: o.shirt },
    { cyl: [0.05, 0.05, 0.16, 8], at: [0, -0.12, 0], color: o.skin },
    { sphere: [0.065, 12, 8], at: [0, -0.22, 0], color: o.skin },
  ]

  return { head, eyes, torso, leg, arm }
}

// Outfits are module constants, so parts can be cached per outfit object.
const partsCache = new WeakMap<Outfit, ReturnType<typeof buildChibi>>()
function chibiParts(o: Outfit) {
  let parts = partsCache.get(o)
  if (!parts) {
    parts = buildChibi(o)
    partsCache.set(o, parts)
  }
  return parts
}

export interface ChibiModelProps {
  motion: RefObject<MotionState>
  outfit?: Outfit
  /** Carried object attached to the body. */
  carry?: 'pole' | null
}

export function ChibiModel({ motion, outfit = PLAYER_OUTFIT, carry = null }: ChibiModelProps) {
  const parts = useMemo(() => chibiParts(outfit), [outfit])
  const root = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const glass = useRef<Group>(null)
  const fan = useRef<Group>(null)

  const anim = useRef({
    walkPhase: 0,
    time: Math.random() * 10,
    nextBlink: 2.5,
    blinkT: -1,
    sit: 0,
    sip: 0,
    fan: 0,
    arms: 0,
    kick: 0,
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const a = anim.current
    const m = motion.current
    const s = m?.speed ?? 0
    a.time += dt
    a.walkPhase += dt * (4 + 9 * s)
    a.sit = damp(a.sit, m?.sit ?? 0, 10, dt)
    a.sip = damp(a.sip, m?.sip ?? 0, 7, dt)
    a.fan = damp(a.fan, m?.fan ?? 0, 6, dt)
    a.arms = damp(a.arms, m?.arms ?? 0, 8, dt)
    a.kick = damp(a.kick, m?.kick ?? 0, 18, dt)
    const seatY = m?.seatY ?? STOOL_Y

    const stand = 1 - a.sit
    const swing = Math.sin(a.walkPhase) * 0.75 * s * stand
    const bounce = Math.abs(Math.sin(a.walkPhase)) * 0.07 * s * stand
    const breathe = Math.sin(a.time * 2.4) * (1 - s)

    if (root.current) {
      root.current.position.y = bounce + (seatY - HIP_Y) * a.sit
      root.current.rotation.x = 0.1 * s * stand - 0.06 * a.sit // lean into the walk / back when seated
    }
    if (legL.current) legL.current.rotation.x = swing - 1.35 * a.sit - 1.5 * a.kick
    if (legR.current) legR.current.rotation.x = -swing - 1.35 * a.sit

    if (armL.current) {
      armL.current.rotation.x = -swing * 0.9 * (1 - a.arms) - 1.25 * a.arms
    }
    if (armR.current) {
      let rx = swing * 0.9 * (1 - a.arms) - 1.25 * a.arms
      let rz = -0.25
      rx += (-2.45 - rx) * a.sip
      rz += (0.6 - rz) * a.sip
      rx += (-1.7 - rx) * a.fan
      rz += a.fan * (0.15 + Math.sin(a.time * 11) * 0.35)
      armR.current.rotation.x = rx
      armR.current.rotation.z = rz
    }
    // Keep the held glass roughly upright while drinking.
    if (glass.current) {
      glass.current.visible = m?.held === 'glass'
      glass.current.rotation.x = 2.2 * a.sip
    }
    if (fan.current) fan.current.visible = m?.held === 'fan'

    if (torso.current) torso.current.scale.set(1 - breathe * 0.01, 1 + breathe * 0.025, 1)
    if (head.current) {
      head.current.position.y = HEAD_Y + breathe * 0.012
      head.current.rotation.z = Math.sin(a.walkPhase) * 0.06 * s * stand + Math.sin(a.time * 1.1) * 0.035 * (1 - s)
      head.current.rotation.x = -0.15 * a.sip
    }

    // Blink every few seconds
    if (a.blinkT < 0 && a.time > a.nextBlink) a.blinkT = 0
    if (a.blinkT >= 0) {
      a.blinkT += dt
      const k = a.blinkT / 0.14
      if (eyes.current) eyes.current.scale.y = k < 1 ? Math.max(0.1, Math.abs(1 - 2 * k)) : 1
      if (k >= 1) {
        a.blinkT = -1
        a.nextBlink = a.time + 2 + Math.random() * 3
      }
    }
  })

  const mat = solidMaterial
  return (
    <group ref={root}>
      <group ref={head} position={[0, HEAD_Y, 0]}>
        <Shapes shapes={parts.head} material={mat} />
        <group ref={eyes} position={[0, EYE_Y, 0]}>
          <Shapes shapes={parts.eyes} material={mat} castShadow={false} />
        </group>
      </group>
      <group ref={torso} position={[0, TORSO_Y, 0]}>
        <Shapes shapes={parts.torso} material={mat} />
        {carry === 'pole' && <Shapes shapes={POLE} material={mat} />}
      </group>
      <group ref={legL} position={[0.1, HIP_Y, 0]}>
        <Shapes shapes={parts.leg} material={mat} />
      </group>
      <group ref={legR} position={[-0.1, HIP_Y, 0]}>
        <Shapes shapes={parts.leg} material={mat} />
      </group>
      {/* Arms tilt slightly outward; rotation.x swings them (Euler XYZ applies Z first). */}
      <group ref={armL} position={[0.24, SHOULDER_Y, 0]} rotation={[0, 0, 0.25]}>
        <Shapes shapes={parts.arm} material={mat} />
      </group>
      <group ref={armR} position={[-0.24, SHOULDER_Y, 0]} rotation={[0, 0, -0.25]}>
        <Shapes shapes={parts.arm} material={mat} />
        <group ref={glass} position={[0, -0.27, 0.02]} visible={false}>
          <Shapes shapes={GLASS} material={mat} castShadow={false} />
        </group>
        <group ref={fan} position={[0, -0.26, 0.04]} visible={false}>
          <Shapes shapes={FAN} material={mat} castShadow={false} />
        </group>
      </group>
    </group>
  )
}
