import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, CoefficientCombineRule, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { CONFIG } from '../../data/config'
import { usePlayer } from '../../store/playerStore'
import { useUI } from '../../store/uiStore'
import { useMinigame } from '../../store/minigameStore'
import { useDialogue } from '../../store/dialogueStore'
import { cameraState } from '../systems/cameraState'
import { PLAYER_GROUPS } from '../systems/collisionGroups'
import { readMoveInput, type Vec2 } from '../systems/input'
import { damp, dampAngle, dampFactor } from '../systems/math'
import { playerState } from '../systems/playerState'
import { ChibiModel, type MotionState } from './ChibiModel'

const CAPSULE_RADIUS = 0.32
const CAPSULE_HALF_HEIGHT = 0.42
/** Distance at which an auto-walk waypoint counts as reached. */
const WAYPOINT_REACHED = 0.15
/** Auto-walk slows down within this distance of a waypoint. */
const WAYPOINT_SLOWDOWN = 0.6

/** Runs before the physics step (Physics uses priority -50) so new velocity applies this frame. */
export const PLAYER_FRAME_PRIORITY = -100

const _input: Vec2 = { x: 0, y: 0 }

export interface PlayerProps {
  /** Interpolated visual root, followed by the camera. */
  visualRef: RefObject<Group | null>
}

/** Menus, conversations and mini-games own the screen: don't walk behind them. */
function inputBlocked() {
  const ui = useUI.getState()
  return ui.settingsOpen || ui.panel !== null || ui.sleeping || ui.transition !== null || useMinigame.getState().active !== null || useDialogue.getState().npcId !== null
}

function arrive() {
  playerState.path = []
  const callback = playerState.onArrive
  playerState.onArrive = null
  callback?.()
}

export function Player({ visualRef }: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const facing = useRef<Group>(null)
  const motion = useRef<MotionState>({ speed: 0 })
  const velocity = useRef({ x: 0, z: 0 })
  const sipClock = useRef(0)
  const outfit = usePlayer((s) => s.outfit)

  useFrame((_, rawDt) => {
    const rb = body.current
    if (!rb) return
    const dt = Math.min(rawDt, 0.1)
    const cfg = CONFIG.player

    if (playerState.teleportTo) {
      const { x, z } = playerState.teleportTo
      playerState.teleportTo = null
      rb.setTranslation({ x, y: cfg.spawn[1], z }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      velocity.current.x = velocity.current.z = 0
    }

    // Safety net: never lose the player.
    if (rb.translation().y < cfg.fallResetY) {
      rb.setTranslation({ x: cfg.spawn[0], y: cfg.spawn[1] + 1, z: cfg.spawn[2] }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }

    const pos = rb.translation()
    playerState.position.set(pos.x, pos.y, pos.z)

    let moveX = 0
    let moveZ = 0
    let speedScale = 1

    if (playerState.locked) {
      // Scripted walk (e.g. going behind the café counter).
      const target = playerState.path[0]
      if (target) {
        playerState.pathTime += dt
        const dx = target.x - pos.x
        const dz = target.z - pos.z
        const dist = Math.hypot(dx, dz)
        if (playerState.pathTime > cfg.autoWalkTimeoutSec) {
          const last = playerState.path[playerState.path.length - 1]
          rb.setTranslation({ x: last.x, y: pos.y, z: last.z }, true)
          velocity.current.x = velocity.current.z = 0
          arrive()
        } else if (dist < WAYPOINT_REACHED) {
          playerState.path.shift()
          if (playerState.path.length === 0) arrive()
        } else {
          moveX = dx / dist
          moveZ = dz / dist
          speedScale = cfg.autoWalkSpeedScale * (playerState.path.length === 1 ? Math.min(1, dist / WAYPOINT_SLOWDOWN) : 1)
        }
      }
    } else if (!inputBlocked()) {
      // Move relative to the camera: "up" on the stick = away from the camera.
      readMoveInput(_input)
      const sin = Math.sin(cameraState.yaw)
      const cos = Math.cos(cameraState.yaw)
      moveX = cos * _input.x - sin * _input.y
      moveZ = -sin * _input.x - cos * _input.y
    }

    const v = velocity.current
    const k = dampFactor(cfg.accelSharpness, dt)
    v.x += (moveX * cfg.walkSpeed * speedScale - v.x) * k
    v.z += (moveZ * cfg.walkSpeed * speedScale - v.z) * k
    const current = rb.linvel()
    rb.setLinvel({ x: v.x, y: current.y, z: v.z }, true)

    if (facing.current) {
      if (Math.hypot(moveX, moveZ) > 0.05) {
        const target = Math.atan2(moveX, moveZ) // model faces +Z
        facing.current.rotation.y = dampAngle(facing.current.rotation.y, target, cfg.turnSharpness, dt)
      } else if (playerState.faceYaw !== null) {
        facing.current.rotation.y = dampAngle(facing.current.rotation.y, playerState.faceYaw, cfg.turnSharpness * 0.6, dt)
      }
    }

    // Animate from real velocity so walking into a wall looks like standing.
    const planarSpeed = Math.hypot(current.x, current.z)
    const m = motion.current
    m.speed = damp(m.speed, Math.min(1, planarSpeed / cfg.walkSpeed), 10, dt)

    // Sitting down for a drink etc.
    const pose = playerState.pose
    m.sit = pose ? 1 : 0
    m.seatY = pose?.sitY
    m.held = pose?.held ?? null
    sipClock.current = pose?.sipping ? sipClock.current + dt : 0
    m.sip = pose?.sipping && sipClock.current % 1.8 > 0.5 && sipClock.current % 1.8 < 1.4 ? 1 : 0
  }, PLAYER_FRAME_PRIORITY)

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={CONFIG.player.spawn}
      enabledRotations={[false, false, false]}
      canSleep={false}
      ccd
    >
      <CapsuleCollider
        args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]}
        position={[0, CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS, 0]}
        friction={0}
        frictionCombineRule={CoefficientCombineRule.Min}
        collisionGroups={PLAYER_GROUPS}
      />
      <group ref={visualRef}>
        <group ref={facing}>
          <ChibiModel motion={motion} outfit={outfit} />
        </group>
      </group>
    </RigidBody>
  )
}
