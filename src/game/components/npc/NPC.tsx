import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { SOLO_LINES } from '../../../data/chatter'
import { CONFIG } from '../../../data/config'
import type { NpcDef } from '../../../data/npcs'
import { useBubbles } from '../../../store/bubbleStore'
import { useDialogue } from '../../../store/dialogueStore'
import { useFlags } from '../../../store/flagsStore'
import type { ContextAction, InteractableDef } from '../../../store/interactionStore'
import { useTime } from '../../../store/timeStore'
import { openDialogue, talkedFlag } from '../../systems/dialogue'
import { dampAngle } from '../../systems/math'
import { playerState, type PointXZ, type ZoneXZ } from '../../systems/playerState'
import { npcPositions } from '../../systems/registry'
import { ChibiModel, type MotionState } from '../ChibiModel'
import { useInteractable } from '../Interactable'
import { NpcMarker } from './NpcMarker'
import { SpeechBubble } from './SpeechBubble'

export interface NpcPath {
  points: PointXZ[]
  speed?: number
  /** Random pause at each point [min, max] seconds. */
  pauseSec?: [number, number]
  /** Loop through the points (default: walk back and forth). */
  loop?: boolean
}

export interface NpcProps {
  def: NpcDef
  at: PointXZ
  yaw?: number
  /** Sitting on something `seatY` high. */
  seatY?: number
  activity?: 'sip' | 'fan' | null
  /** Arms forward (e.g. hands on handlebars), 0–1. */
  arms?: number
  carry?: 'pole' | null
  path?: NpcPath
  /** Interaction area (default: a box around the NPC that follows them). */
  zone?: ZoneXZ
  extraActions?: ContextAction[]
  scale?: number
  /** Which SOLO_LINES list to use when the player blocks the way. */
  yieldLines?: string
}

const rand = ([min, max]: [number, number]) => min + Math.random() * (max - min)
const SIP_CYCLE = 6

/**
 * A street character: walks a path (yielding to the player) or sits and sips/fans.
 * NPCs with a dialogue are interactive: they get a "!" until you talk to them today.
 */
export function NPC({ def, at, yaw = 0, seatY, activity = null, arms = 0, carry = null, path, zone, extraActions, scale = 1, yieldLines = 'yield' }: NpcProps) {
  const group = useRef<Group>(null)
  const body = useRef<RapierRigidBody>(null)
  const motion = useRef<MotionState>({ speed: 0 })
  const st = useRef({
    x: at.x,
    z: at.z,
    yaw,
    index: 1,
    dir: 1,
    pause: path ? rand(path.pauseSec ?? [0.5, 2]) : 0,
    clock: Math.random() * SIP_CYCLE,
    yieldT: 0,
    yielded: false,
  })
  const walking = !!path
  const interactive = !!def.dialogueId

  // Interaction zone object is mutated in place each frame for walking NPCs.
  const liveZone = useRef<ZoneXZ>(zone ?? { x: at.x, z: at.z, halfX: 1.4, halfZ: 1.4 }).current
  const actions = useMemo<ContextAction[]>(
    () => [
      { id: 'talk', labelKey: 'action.talk', icon: 'talk', primary: true, onPress: () => openDialogue(def.id) },
      ...(extraActions ?? []),
    ],
    [def.id, extraActions],
  )
  const interactableDef = useMemo<InteractableDef>(
    () => ({ id: `npc:${def.id}`, name: def.name, subtitle: def.title, zone: liveZone, actions, priority: 2 }),
    [def.id, def.name, def.title, liveZone, actions],
  )
  useInteractable(interactive ? interactableDef : null)

  const day = useTime((s) => s.day)
  const talkedToday = useFlags((s) => s.flags[talkedFlag(def.id)] === day)
  const talking = useDialogue((s) => s.npcId === def.id)

  useEffect(() => () => void npcPositions.delete(def.id), [def.id])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = st.current
    const m = motion.current
    const inDialogue = useDialogue.getState().npcId === def.id
    let moving = false

    if (inDialogue) {
      const p = playerState.position
      s.yaw = dampAngle(s.yaw, Math.atan2(p.x - s.x, p.z - s.z), 8, dt)
    } else if (path) {
      if (s.pause > 0) {
        s.pause -= dt
      } else {
        const target = path.points[s.index]
        const dx = target.x - s.x
        const dz = target.z - s.z
        const dist = Math.hypot(dx, dz)
        if (dist < 0.06) {
          // Next waypoint: loop, or walk back and forth.
          if (path.loop) s.index = (s.index + 1) % path.points.length
          else {
            if (s.index + s.dir < 0 || s.index + s.dir >= path.points.length) s.dir = -s.dir
            s.index += s.dir
          }
          s.pause = rand(path.pauseSec ?? [0.5, 2])
        } else {
          // Stop politely if the player is right in front.
          const p = playerState.position
          const px = p.x - s.x
          const pz = p.z - s.z
          const pd = Math.hypot(px, pz)
          const blocked = pd < CONFIG.npc.yieldDistance && (px * dx + pz * dz) / (pd * dist + 1e-6) > 0.35
          if (blocked) {
            s.yieldT += dt
            if (s.yieldT > 0.8 && !s.yielded) {
              s.yielded = true
              const lines = SOLO_LINES[yieldLines] ?? SOLO_LINES.yield
              useBubbles.getState().say(def.id, lines[Math.floor(Math.random() * lines.length)], 2000)
            }
          } else {
            s.yieldT = 0
            if (pd > 2.5) s.yielded = false
            const step = Math.min(dist, (path.speed ?? CONFIG.npc.walkSpeed) * dt)
            s.x += (dx / dist) * step
            s.z += (dz / dist) * step
            s.yaw = dampAngle(s.yaw, Math.atan2(dx, dz), 8, dt)
            moving = true
          }
        }
      }
    }

    // Pose + activity
    m.speed += ((moving ? 0.55 : 0) - m.speed) * Math.min(1, dt * 8)
    m.sit = seatY !== undefined ? 1 : 0
    m.seatY = seatY
    m.arms = arms
    s.clock += dt
    if (activity === 'sip') {
      const t = s.clock % SIP_CYCLE
      m.held = 'glass'
      m.sip = t > 3.6 && t < 5 && !inDialogue ? 1 : 0
    } else if (activity === 'fan') {
      m.held = 'fan'
      m.fan = inDialogue || s.clock % 9 > 7 ? 0 : 1
    }

    const g = group.current
    if (g) {
      g.position.set(s.x, 0, s.z)
      g.rotation.y = s.yaw
    }
    if (!zone) {
      liveZone.x = s.x
      liveZone.z = s.z
    }
    npcPositions.set(def.id, { x: s.x, z: s.z })
    if (walking) body.current?.setNextKinematicTranslation({ x: s.x, y: 0, z: s.z })
  })

  return (
    <>
      <group ref={group} position={[at.x, 0, at.z]} rotation={[0, yaw, 0]}>
        <group scale={scale}>
          <ChibiModel motion={motion} outfit={def.outfit} carry={carry} />
        </group>
        <SpeechBubble id={def.id} y={(seatY !== undefined ? 1.75 : 2.05) * scale + (carry ? 0.1 : 0)} />
        {interactive && <NpcMarker visible={!talkedToday && !talking} y={(seatY !== undefined ? 2.0 : 2.3) * scale} />}
      </group>
      {walking ? (
        <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[at.x, 0, at.z]}>
          <CapsuleCollider args={[0.35, 0.28]} position={[0, 0.65, 0]} />
        </RigidBody>
      ) : (
        <RigidBody type="fixed" colliders={false} position={[at.x, 0, at.z]}>
          <CylinderCollider args={[0.5, 0.3 * scale]} position={[0, 0.5, 0]} />
        </RigidBody>
      )}
    </>
  )
}
